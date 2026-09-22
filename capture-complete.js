#!/usr/bin/env node

/**
 * Capture complete set of pages for the replica
 * Focus on: main categories, key product pages, info pages
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.factory-direct-flooring.co.uk';
const OUTPUT_DIR = path.join(__dirname, 'pages-captured');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

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

// Key pages to capture - organized by priority
const PAGES_TO_CAPTURE = [
  // Main category pages (must have)
  { url: '/solid-wood-flooring', file: 'category-solid-wood.html', label: 'Solid Wood' },
  { url: '/engineered-wood-flooring', file: 'category-engineered-wood.html', label: 'Engineered Wood' },
  { url: '/laminate-flooring', file: 'category-laminate.html', label: 'Laminate' },
  { url: '/vinyl-flooring', file: 'category-vinyl.html', label: 'Vinyl' },
  { url: '/lvt-flooring', file: 'category-lvt.html', label: 'LVT' },
  { url: '/herringbone-flooring', file: 'category-herringbone.html', label: 'Herringbone' },

  // Info pages (should have)
  { url: '/advice-centre', file: 'advice.html', label: 'Advice Centre' },
  { url: '/about', file: 'about.html', label: 'About' },
];

async function captureAndModifyPage(browser, baseUrl, relativeUrl, outputFileName) {
  const fullUrl = baseUrl + relativeUrl;
  console.log(`\n📸 ${outputFileName}: ${relativeUrl}`);

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);

  try {
    // Use 'load' for faster capture
    await page.goto(fullUrl, { waitUntil: 'load', timeout: 45000 });

    // Wait for content to settle
    await page.waitForTimeout(2000);

    const html = await page.content();
    const modifiedHtml = html.replace('</body>', cartScript + '\n</body>');

    const filePath = path.join(OUTPUT_DIR, outputFileName);
    fs.writeFileSync(filePath, modifiedHtml);
    console.log(`   ✅ Saved (${Math.round(modifiedHtml.length / 1024)}KB)`);

    // Screenshot
    try {
      const screenshotPath = path.join(OUTPUT_DIR, outputFileName.replace('.html', '.png'));
      await page.screenshot({ path: screenshotPath, fullPage: false, timeout: 10000 });
      console.log(`   📷 Screenshot saved`);
    } catch (e) {
      console.log(`   ⚠️  Screenshot failed (non-critical)`);
    }

    return { success: true, size: modifiedHtml.length };

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🚀 Capturing complete site pages...\n');
  console.log('Target pages:');
  PAGES_TO_CAPTURE.forEach(p => console.log(`  - ${p.label} (${p.url})`));
  console.log('\n');

  const browser = await chromium.launch();
  const results = [];

  try {
    for (const page of PAGES_TO_CAPTURE) {
      const result = await captureAndModifyPage(
        browser,
        BASE_URL,
        page.url,
        page.file
      );
      results.push({ ...page, ...result });

      // Be respectful to the server
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n\n📊 CAPTURE SUMMARY\n');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}/${PAGES_TO_CAPTURE.length}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.label}: ${r.error}`);
    });
  }

  const totalSize = results.filter(r => r.success).reduce((sum, r) => sum + (r.size || 0), 0);
  console.log(`\n📁 Total captured: ${Math.round(totalSize / 1024 / 1024 * 100) / 100}MB`);
  console.log(`\n💾 All files saved to: ${OUTPUT_DIR}\n`);

  return results;
}

main().catch(console.error);
