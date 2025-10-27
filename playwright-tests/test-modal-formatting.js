const { chromium } = require('playwright');

/**
 * Mobile Viewer Modal Formatting Test
 *
 * Opens an exported mobile viewer HTML and checks if email content
 * displays with proper HTML formatting when clicking nodes
 */

(async () => {
  console.log('🚀 Testing Mobile Viewer Modal Formatting...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  // Collect errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.error('❌ JavaScript Error:', error.message);
  });

  try {
    // Load the mobile viewer
    const htmlPath = 'C:\\Users\\pR0XY\\AppData\\Local\\Temp\\MicrosoftEdgeDownloads\\1faa85b5-f7e6-415f-b73d-79d4bd6e3f9e\\DMS_101_Drip_Campaign-mobile-viewer-2025-10-26_19-19-21.html';

    console.log('📄 Loading mobile viewer...');
    console.log(`Path: ${htmlPath}\n`);

    await page.goto(`file:///${htmlPath}`);
    await page.waitForSelector('#header', { timeout: 10000 });
    await page.waitForTimeout(2000);

    console.log('✅ Page loaded\n');

    // Get all email node IDs
    const emailNodeIds = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.node-email'));
      // Extract embedded campaign data to get node IDs
      const scriptContent = document.documentElement.innerHTML;
      const match = scriptContent.match(/const campaignData = ({[\s\S]*?});/);

      if (match) {
        try {
          const dataStr = match[1];
          // Parse to find email nodes
          const nodesMatch = dataStr.match(/"nodes":\s*\[([\s\S]*?)\]/);
          if (nodesMatch) {
            const nodesStr = nodesMatch[0];
            const idMatches = [...nodesStr.matchAll(/"id":\s*"(node_\d+)",\s*"type":\s*"email"/g)];
            return idMatches.map(m => m[1]);
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
      return [];
    });

    console.log(`📧 Found ${emailNodeIds.length} email nodes\n`);

    // Test first 3 email nodes
    const testCount = Math.min(3, emailNodeIds.length);

    for (let i = 0; i < testCount; i++) {
      const nodeId = emailNodeIds[i];
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Testing Email Node ${i + 1}: ${nodeId}`);
      console.log('='.repeat(60));

      // Open modal by passing the full node object
      await page.evaluate((id) => {
        // Find the node object from campaignData
        const scriptContent = document.documentElement.innerHTML;
        const match = scriptContent.match(/const campaignData = ({[\s\S]*?});/);

        if (match) {
          const dataStr = match[1];
          // Use Function constructor to safely evaluate the object
          const campaignData = eval('(' + dataStr + ')');
          const node = campaignData.nodes.find(n => n.id === id);

          if (node) {
            window.showNodeDetails(node);
          } else {
            throw new Error('Node not found: ' + id);
          }
        } else {
          throw new Error('Could not find campaignData');
        }
      }, nodeId);

      await page.waitForSelector('.modal-overlay.active', { timeout: 5000 });

      // Get modal title
      const modalTitle = await page.locator('#modalTitle').textContent();
      console.log(`\n📋 Modal Title: "${modalTitle}"`);

      // Check for formatting in modal content
      const formatting = await page.evaluate(() => {
        const modalContent = document.querySelector('.modal-content');
        if (!modalContent) return null;

        const html = modalContent.innerHTML;

        return {
          hasBulletLists: (html.match(/<ul/gi) || []).length > 0,
          hasNumberedLists: (html.match(/<ol/gi) || []).length > 0,
          hasBoldText: (html.match(/<strong/gi) || []).length > 0,
          hasParagraphs: (html.match(/<p>/gi) || []).length > 0,
          bulletCount: (html.match(/<ul/gi) || []).length,
          numberedCount: (html.match(/<ol/gi) || []).length,
          boldCount: (html.match(/<strong/gi) || []).length,
          paragraphCount: (html.match(/<p>/gi) || []).length,
          // Get first 300 chars of email content
          emailContentSample: (() => {
            const fieldValue = modalContent.querySelector('.field-label + .field-value');
            if (fieldValue) {
              return fieldValue.innerHTML.substring(0, 300);
            }
            return 'Not found';
          })()
        };
      });

      if (formatting) {
        console.log('\n🔍 Formatting Check:');
        console.log(`  - Bullet lists (<ul>): ${formatting.bulletCount} ${formatting.hasBulletLists ? '✅' : '❌'}`);
        console.log(`  - Numbered lists (<ol>): ${formatting.numberedCount} ${formatting.hasNumberedLists ? '✅' : '❌'}`);
        console.log(`  - Bold text (<strong>): ${formatting.boldCount} ${formatting.hasBoldText ? '✅' : '❌'}`);
        console.log(`  - Paragraphs (<p>): ${formatting.paragraphCount} ${formatting.hasParagraphs ? '✅' : '❌'}`);

        console.log('\n📝 Email Content Sample (first 300 chars):');
        console.log('---');
        console.log(formatting.emailContentSample);
        console.log('---');

        const hasAnyFormatting = formatting.hasBulletLists || formatting.hasBoldText || formatting.hasParagraphs;

        if (hasAnyFormatting) {
          console.log('\n✅ HTML FORMATTING IS PRESERVED!');
        } else {
          console.log('\n❌ HTML FORMATTING IS STRIPPED!');
        }
      }

      // Close modal
      await page.evaluate(() => {
        window.closeModal();
      });

      await page.waitForTimeout(500);
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`JavaScript errors: ${errors.length}`);
    console.log(`Email nodes tested: ${testCount}`);

    if (errors.length > 0) {
      console.log('\n⚠️  Errors detected:');
      errors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('\n✅ No JavaScript errors!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✨ Test complete! Browser will stay open for 15 seconds...\n');

    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await browser.close();
    console.log('👋 Browser closed.\n');
  }
})();
