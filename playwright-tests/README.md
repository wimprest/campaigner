# Campaign Mobile Viewer - Playwright Tests

Automated testing for the Campaign Builder mobile viewer export.

## Setup

Already done! Dependencies installed.

## How to Use

1. **Export a mobile viewer** from the Campaign Builder app
2. **Update the file path** in `test-mobile-viewer.js` (line 67):
   ```javascript
   const htmlPath = 'C:\\Users\\pR0XY\\AppData\\Local\\Temp\\...\\your-file.html';
   ```

3. **Run the test**:
   ```bash
   npm test
   ```

## What the Test Does

- ✅ Opens the HTML file in a mobile viewport (iPhone SE size: 375x667)
- ✅ Monitors all console messages (log, warn, error)
- ✅ Catches JavaScript errors with full stack traces
- ✅ Verifies page initialization completes successfully
- ✅ Counts rendered nodes
- ✅ Checks for HTML formatting tags in email nodes
- ✅ Tests zoom controls (+, −, Fit) by clicking buttons
- ✅ Shows browser window so you can see what's happening
- ✅ Provides detailed test summary with pass/fail status

## Console Output

You'll see color-coded console messages:
- **White** - log messages
- **Cyan** - info messages
- **Yellow** - warnings
- **Red** - errors

## Test Summary

At the end, you'll get:
- Total console message count by type
- JavaScript error count
- List of any errors with timestamps
- Pass/fail status

## Browser Behavior

- Browser opens automatically (headless: false)
- Actions are slowed down (slowMo: 500ms) so you can see them
- Browser stays open for 10 seconds after test completes
- Then closes automatically

## Troubleshooting

**"Cannot find module 'playwright'"**
```bash
npm install
```

**"Browser not installed"**
```bash
npx playwright install chromium
```

**"File not found"**
- Make sure the `htmlPath` in test-mobile-viewer.js points to your actual exported file
- Use double backslashes in Windows paths: `C:\\Users\\...`
