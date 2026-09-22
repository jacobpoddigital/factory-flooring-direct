#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.factory-direct-flooring.co.uk';
const OUTPUT_DIR = path.join(__dirname, 'pages-captured');

const cartScript = `
    <script src="/js/cart.js"></script>
    <script>
      function updateCartBadge() {
        const cart = window.cart.get();
        document.querySelectorAll('[aria-label*="Basket"], [aria-label*="Cart"]').forEach(el => {
          if (cart.itemCount > 0) el.setAttribute('data-count', cart.itemCount);
        });
      }
      window.addEventListener('cart-updated', updateCartBadge);
      updateCartBadge();
    </script>
`;

async function captureAndModifyPage(browser, url, outputFileName) {
  console.log(`\n📸 Capturing: ${url}`);

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);

  try {
    // Use 'load' instead of 'networkidle' for faster capture
    await page.goto(url, { waitUntil: 'load' });

    // Wait a bit more for additional resources
    await page.waitForTimeout(3000);

    const html = await page.content();
    const modifiedHtml = html.replace('</body>', cartScript + '\n</body>');

    const filePath = path.join(OUTPUT_DIR, outputFileName);
    fs.writeFileSync(filePath, modifiedHtml);
    console.log(`✅ Saved: ${filePath}`);

    const screenshotPath = path.join(OUTPUT_DIR, outputFileName.replace('.html', '.png'));
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📷 Screenshot: ${screenshotPath}`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🚀 Capturing remaining pages...');
  const browser = await chromium.launch();

  try {
    const pages = [
      { url: BASE_URL + '/embrace-pro-laminate-flooring-14mm-crystal-oak-ac5-built-in-underlay', file: 'product-detail.html' },
      { url: BASE_URL + '/checkout/cart/', file: 'cart.html' },
    ];

    for (const page of pages) {
      await captureAndModifyPage(browser, page.url, page.file);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n✅ Complete!');
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
