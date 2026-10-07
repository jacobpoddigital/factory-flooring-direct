#!/usr/bin/env node

/**
 * Re-capture pages whose nav links got irrecoverably collapsed to href="/" by an
 * earlier broken link-rewrite pass (about.html, advice.html, and 4 category pages).
 * Fresh HTML preserves the real site's nav hrefs so smart-link-rewrite.js can do its
 * job properly afterwards.
 */

const playwright = require('playwright');
const fs = require('fs');

const ROOT = '/Users/jacobhedges/Projects/factory-flooring-direct';

const CART_BADGE_SCRIPT = `
    <script src="/js/cart.js"></script>
    <script src="/js/products-data.js"></script>
    <script defer src="https://cdn.websiteavatar.co.uk/wa-agent.js?id=acct_factory-direct-flooring"></script>
    <script>
      function updateCartBadge() {
        const cart = window.cart.get();
        document.querySelectorAll('[aria-label*="Basket"], [aria-label*="Cart"]').forEach(el => {
          if (cart.itemCount > 0) el.setAttribute('data-count', cart.itemCount);
        });
      }
      window.addEventListener('cart-updated', updateCartBadge);
      document.addEventListener('DOMContentLoaded', async () => {
        await ProductsDB.load();
        updateCartBadge();
      });
    </script>
`;

function categoryRenderScript(categoryName) {
  return `
    <script src="/js/cart.js"></script>
    <script src="/js/products-data.js"></script>
    <script defer src="https://cdn.websiteavatar.co.uk/wa-agent.js?id=acct_factory-direct-flooring"></script>
    <script>
      document.addEventListener('DOMContentLoaded', async () => {
        await ProductsDB.load();
        ProductsDB.renderCategoryPage('${categoryName}');
      });
    </script>
`;
}

const TARGETS = [
  { liveUrl: 'https://www.factory-direct-flooring.co.uk/about', outputPath: `${ROOT}/about.html`, script: CART_BADGE_SCRIPT },
  { liveUrl: 'https://www.factory-direct-flooring.co.uk/advice-centre', outputPath: `${ROOT}/advice.html`, script: CART_BADGE_SCRIPT },
  { liveUrl: 'https://www.factory-direct-flooring.co.uk/real-wood-flooring', outputPath: `${ROOT}/categories/engineered-wood.html`, script: categoryRenderScript('Engineered Wood') },
  { liveUrl: 'https://www.factory-direct-flooring.co.uk/luxury-vinyl-tiles', outputPath: `${ROOT}/categories/lvt.html`, script: categoryRenderScript('LVT') },
  { liveUrl: 'https://www.factory-direct-flooring.co.uk/vinyl-flooring', outputPath: `${ROOT}/categories/vinyl.html`, script: categoryRenderScript('Vinyl') },
  { liveUrl: 'https://www.factory-direct-flooring.co.uk/herringbone-flooring', outputPath: `${ROOT}/categories/herringbone.html`, script: categoryRenderScript('Herringbone') },
];

async function captureOne(browser, target) {
  const page = await browser.newPage();
  try {
    console.log(`\n📸 Capturing ${target.liveUrl} -> ${target.outputPath}`);
    await page.goto(target.liveUrl, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('body', { timeout: 5000 });

    let html = await page.content();
    html = html.replace('</body>', target.script + '</body>');

    fs.writeFileSync(target.outputPath, html);
    console.log(`   ✅ Saved (${html.length} bytes)`);
  } catch (error) {
    console.error(`   ❌ Error capturing ${target.liveUrl}:`, error.message);
  } finally {
    await page.close();
  }
}

async function main() {
  const browser = await playwright.chromium.launch();
  for (const target of TARGETS) {
    await captureOne(browser, target);
  }
  await browser.close();
  console.log('\n✅ Done — now run smart-link-rewrite.js to localize nav links.\n');
}

main();
