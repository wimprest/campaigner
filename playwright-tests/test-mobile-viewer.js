const { chromium } = require('playwright');
const path = require('path');

/**
 * Campaign Mobile Viewer Test
 *
 * This script tests the mobile viewer HTML export from the Campaign Builder
 * It opens the HTML file, monitors console messages, and checks for errors
 */

(async () => {
  console.log('🚀 Starting Campaign Mobile Viewer Test...\n');

  // Launch browser
  const browser = await chromium.launch({
    headless: false,  // Show browser so you can see it
    slowMo: 500       // Slow down actions for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },  // iPhone SE size
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text, timestamp: new Date().toISOString() });

    // Print to terminal with color
    const colors = {
      log: '\x1b[37m',      // white
      info: '\x1b[36m',     // cyan
      warn: '\x1b[33m',     // yellow
      error: '\x1b[31m',    // red
      debug: '\x1b[90m'     // gray
    };
    const color = colors[type] || colors.log;
    const reset = '\x1b[0m';
    console.log(`${color}[${type.toUpperCase()}]${reset} ${text}`);
  });

  // Collect JavaScript errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.error('\n❌ JavaScript Error:', error.message);
    console.error('Stack:', error.stack);
  });

  try {
    // Path to the mobile viewer HTML
    // UPDATE THIS PATH to your most recent export
    const htmlPath = 'C:\\Users\\pR0XY\\AppData\\Local\\Temp\\MicrosoftEdgeDownloads\\1faa85b5-f7e6-415f-b73d-79d4bd6e3f9e\\DMS_101_Drip_Campaign-mobile-viewer-2025-10-26_19-19-21.html';

    console.log('\n📄 Loading HTML file...');
    console.log(`Path: ${htmlPath}\n`);

    await page.goto(`file:///${htmlPath}`);

    // Wait for loading to complete
    console.log('⏳ Waiting for page to load...\n');
    await page.waitForSelector('#header', { timeout: 10000 });

    console.log('✅ Page loaded successfully!\n');

    // Get page title
    const title = await page.title();
    console.log(`📋 Page Title: ${title}\n`);

    // Count nodes
    const nodeCount = await page.locator('.node').count();
    console.log(`🔵 Found ${nodeCount} nodes\n`);

    // Check for formatting elements in email nodes
    console.log('📧 Checking email content formatting...\n');

    const emailContentFormatting = await page.evaluate(() => {
      const emailNodes = Array.from(document.querySelectorAll('.node-email'));
      let totalBullets = 0;
      let totalNumbers = 0;
      let totalBold = 0;

      emailNodes.forEach(node => {
        const content = node.innerHTML;
        // Count formatting tags in node content
        totalBullets += (content.match(/<ul/g) || []).length;
        totalNumbers += (content.match(/<ol/g) || []).length;
        totalBold += (content.match(/<strong/g) || []).length;
      });

      return { bullets: totalBullets, numbers: totalNumbers, bold: totalBold };
    });

    console.log(`  Found in email nodes:`);
    console.log(`    - Bullet lists: ${emailContentFormatting.bullets} ${emailContentFormatting.bullets > 0 ? '✅' : '❌'}`);
    console.log(`    - Numbered lists: ${emailContentFormatting.numbers} ${emailContentFormatting.numbers > 0 ? '✅' : '❌'}`);
    console.log(`    - Bold text: ${emailContentFormatting.bold} ${emailContentFormatting.bold > 0 ? '✅' : '❌'}`);

    // Test zoom controls
    console.log('\n🔍 Testing zoom controls...\n');

    await page.locator('button:has-text("+")').click();
    console.log('  ✅ Zoomed in');
    await page.waitForTimeout(500);

    await page.locator('button:has-text("−")').click();
    console.log('  ✅ Zoomed out');
    await page.waitForTimeout(500);

    await page.locator('button:has-text("Fit")').click();
    console.log('  ✅ Fit to view');
    await page.waitForTimeout(1000);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`  - log: ${consoleMessages.filter(m => m.type === 'log').length}`);
    console.log(`  - info: ${consoleMessages.filter(m => m.type === 'info').length}`);
    console.log(`  - warn: ${consoleMessages.filter(m => m.type === 'warn').length}`);
    console.log(`  - error: ${consoleMessages.filter(m => m.type === 'error').length}`);
    console.log(`\nJavaScript errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n⚠️  ERRORS FOUND:');
      errors.forEach((err, idx) => {
        console.log(`\n${idx + 1}. ${err.message}`);
        console.log(`   ${err.timestamp}`);
      });
    } else {
      console.log('\n✅ No JavaScript errors detected!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✨ Test complete! Browser will close in 10 seconds...\n');

    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await browser.close();
    console.log('👋 Browser closed.\n');
  }
})();
