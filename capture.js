#!/usr/bin/env node

/**
 * Playwright script to capture real Factory Direct Flooring pages
 * and convert them into our mock site with injected cart functionality
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.factory-direct-flooring.co.uk';
const OUTPUT_DIR = path.join(__dirname, 'pages-captured');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureAndModifyPage(browser, url, outputFileName) {
  console.log(`\n📸 Capturing: ${url}`);

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    // Get full HTML
    const html = await page.content();

    // Inject our cart script before closing body tag
    const cartScript = `
    <script src="/js/cart.js"></script>
    <script>
      // Initialize cart badge
      function updateCartBadge() {
        const cart = window.cart.get();
        const badge = document.querySelector('[id*="cart-count"], [aria-label*="Basket"]');
        if (badge && cart.itemCount > 0) {
          badge.setAttribute('data-count', cart.itemCount);
        }
      }
      window.addEventListener('cart-updated', updateCartBadge);
      updateCartBadge();
    </script>
    `;

    const modifiedHtml = html.replace(
      '</body>',
      cartScript + '\n</body>'
    );

    // Save to file
    const filePath = path.join(OUTPUT_DIR, outputFileName);
    fs.writeFileSync(filePath, modifiedHtml);
    console.log(`✅ Saved to: ${filePath}`);

    // Take screenshot for visual reference
    const screenshotPath = path.join(OUTPUT_DIR, outputFileName.replace('.html', '.png'));
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📷 Screenshot: ${screenshotPath}`);

  } catch (error) {
    console.error(`❌ Error capturing ${url}:`, error.message);
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🚀 Starting page capture with Playwright...');

  const browser = await chromium.launch();

  try {
    // Capture the key pages
    const pages = [
      { url: BASE_URL + '/', file: 'index.html', desc: 'Homepage' },
      { url: BASE_URL + '/laminate-flooring', file: 'category-laminate.html', desc: 'Category: Laminate' },
      { url: BASE_URL + '/engineered-wood-flooring', file: 'category-engineered.html', desc: 'Category: Engineered Wood' },
      { url: BASE_URL + '/embrace-pro-laminate-flooring-14mm-crystal-oak-ac5-built-in-underlay', file: 'product-detail.html', desc: 'Product Detail' },
      { url: BASE_URL + '/checkout/cart/', file: 'cart.html', desc: 'Shopping Cart' },
    ];

    for (const pageInfo of pages) {
      console.log(`\n${pageInfo.desc}:`);
      await captureAndModifyPage(browser, pageInfo.url, pageInfo.file);

      // Small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n✅ All pages captured successfully!');
    console.log(`\n📂 Output files in: ${OUTPUT_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Review captured HTML in pages-captured/');
    console.log('2. Copy successful files to root if they look good');
    console.log('3. Update image URLs to use imagely CDN');
    console.log('4. Test cart functionality on each page');

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
