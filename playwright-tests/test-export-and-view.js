const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

/**
 * End-to-End Mobile Viewer Export Test
 *
 * This script:
 * 1. Opens the Campaign Builder app
 * 2. Loads the DMS 101 campaign JSON
 * 3. Exports as mobile viewer
 * 4. Opens the exported HTML in mobile viewport
 * 5. Verifies HTML formatting is preserved
 */

(async () => {
  console.log('🚀 Starting End-to-End Mobile Viewer Test...\n');

  // Launch browser
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Track downloads
  const downloads = [];
  page.on('download', download => {
    downloads.push(download);
    console.log('📥 Download started:', download.suggestedFilename());
  });

  try {
    // Step 1: Load the app
    console.log('📄 Loading Campaign Builder app...');
    await page.goto('http://localhost:3003'); // Vite dev server
    await page.waitForSelector('.sidebar', { timeout: 10000 });
    console.log('✅ App loaded\n');

    // Step 2: Import JSON file
    console.log('📂 Importing DMS 101 campaign...');

    // Click Open menu
    await page.click('button:has-text("Open")');
    await page.waitForTimeout(200);

    // Click "Open File"
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Open File');
    const fileChooser = await fileChooserPromise;

    // Upload the JSON file
    const jsonPath = 'C:\\Users\\pR0XY\\Dropbox\\Code\\Campaign\\DMS 101 Drip Campaign.json';
    await fileChooser.setFiles(jsonPath);

    // Wait for import to complete
    await page.waitForTimeout(2000);
    console.log('✅ Campaign imported\n');

    // Step 3: Export as mobile viewer
    console.log('📤 Exporting as mobile viewer...');

    // Click Export menu
    await page.click('button:has-text("Export")');
    await page.waitForTimeout(200);

    // Click "Mobile Viewer (HTML)"
    await page.click('text=Mobile Viewer (HTML)');

    // Wait for download
    await page.waitForTimeout(3000);

    if (downloads.length === 0) {
      throw new Error('No download detected!');
    }

    // Save the downloaded file
    const download = downloads[0];
    const downloadsDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    const downloadPath = path.join(downloadsDir, download.suggestedFilename());
    await download.saveAs(downloadPath);
    console.log(`✅ Mobile viewer saved: ${downloadPath}\n`);

    // Step 4: Open mobile viewer in mobile viewport
    console.log('📱 Opening mobile viewer...');

    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });

    const mobilePage = await mobileContext.newPage();

    // Collect console messages
    const consoleMessages = [];
    mobilePage.on('console', msg => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
      const colors = {
        log: '\x1b[37m',
        info: '\x1b[36m',
        warn: '\x1b[33m',
        error: '\x1b[31m'
      };
      const color = colors[msg.type()] || colors.log;
      console.log(`${color}[${msg.type().toUpperCase()}]\x1b[0m ${msg.text()}`);
    });

    // Collect errors
    const errors = [];
    mobilePage.on('pageerror', error => {
      errors.push(error.message);
      console.error('❌ JavaScript Error:', error.message);
    });

    await mobilePage.goto(`file:///${downloadPath.replace(/\\/g, '/')}`);
    await mobilePage.waitForSelector('#header', { timeout: 10000 });
    await mobilePage.waitForTimeout(2000);

    console.log('✅ Mobile viewer loaded\n');

    // Step 5: Check for HTML formatting
    console.log('🔍 Checking HTML formatting preservation...\n');

    const formatting = await mobilePage.evaluate(() => {
      const results = {
        inNodes: { bullets: 0, numbers: 0, bold: 0, paragraphs: 0 },
        inModalHTML: { bullets: 0, numbers: 0, bold: 0, paragraphs: 0 },
        rawEmailContent: []
      };

      // Check visible nodes
      const emailNodes = Array.from(document.querySelectorAll('.node-email'));
      emailNodes.forEach(node => {
        const html = node.innerHTML;
        results.inNodes.bullets += (html.match(/<ul/gi) || []).length;
        results.inNodes.numbers += (html.match(/<ol/gi) || []).length;
        results.inNodes.bold += (html.match(/<strong/gi) || []).length;
        results.inNodes.paragraphs += (html.match(/<p>/gi) || []).length;
      });

      // Check what's embedded in the script data
      const scriptContent = document.documentElement.innerHTML;
      const campaignDataMatch = scriptContent.match(/const campaignData = ({[\s\S]*?});/);

      if (campaignDataMatch) {
        try {
          // Extract email content samples
          const dataStr = campaignDataMatch[1];
          const emailContentMatches = dataStr.match(/"emailContent":\s*"([^"]*(?:\\.[^"]*)*)"/g);

          if (emailContentMatches) {
            emailContentMatches.slice(0, 3).forEach(match => {
              const content = match.substring(match.indexOf('"emailContent":') + 17, match.length - 1);
              results.rawEmailContent.push(content.substring(0, 200) + '...');

              // Count tags in raw data
              results.inModalHTML.bullets += (content.match(/<ul/gi) || []).length;
              results.inModalHTML.numbers += (content.match(/<ol/gi) || []).length;
              results.inModalHTML.bold += (content.match(/<strong/gi) || []).length;
              results.inModalHTML.paragraphs += (content.match(/<p>/gi) || []).length;
            });
          }
        } catch (e) {
          results.parseError = e.message;
        }
      }

      return results;
    });

    console.log('📊 Formatting Analysis:');
    console.log('\n  In Rendered Nodes (preview cards):');
    console.log(`    - Bullet lists (<ul>): ${formatting.inNodes.bullets}`);
    console.log(`    - Numbered lists (<ol>): ${formatting.inNodes.numbers}`);
    console.log(`    - Bold text (<strong>): ${formatting.inNodes.bold}`);
    console.log(`    - Paragraphs (<p>): ${formatting.inNodes.paragraphs}`);

    console.log('\n  In Embedded campaignData (for modals):');
    console.log(`    - Bullet lists (<ul>): ${formatting.inModalHTML.bullets} ${formatting.inModalHTML.bullets > 0 ? '✅' : '❌'}`);
    console.log(`    - Numbered lists (<ol>): ${formatting.inModalHTML.numbers} ${formatting.inModalHTML.numbers > 0 ? '✅' : '❌'}`);
    console.log(`    - Bold text (<strong>): ${formatting.inModalHTML.bold} ${formatting.inModalHTML.bold > 0 ? '✅' : '❌'}`);
    console.log(`    - Paragraphs (<p>): ${formatting.inModalHTML.paragraphs} ${formatting.inModalHTML.paragraphs > 0 ? '✅' : '❌'}`);

    if (formatting.rawEmailContent.length > 0) {
      console.log('\n  📝 Sample Email Content (first 200 chars):');
      formatting.rawEmailContent.forEach((sample, idx) => {
        console.log(`\n    Email ${idx + 1}:`);
        console.log(`    ${sample}`);
      });
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`JavaScript errors: ${errors.length}`);
    console.log(`Console messages: ${consoleMessages.length}`);

    const hasFormatting = formatting.inModalHTML.bullets > 0 ||
                          formatting.inModalHTML.bold > 0 ||
                          formatting.inModalHTML.paragraphs > 0;

    if (hasFormatting) {
      console.log('\n✅ HTML FORMATTING PRESERVED IN EXPORT!');
    } else {
      console.log('\n❌ HTML FORMATTING STRIPPED - NEEDS FIX!');
    }

    if (errors.length > 0) {
      console.log('\n⚠️  JavaScript errors detected:');
      errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✨ Test complete! Browser will close in 10 seconds...\n');

    await mobilePage.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await browser.close();
    console.log('👋 Browser closed.\n');
  }
})();
