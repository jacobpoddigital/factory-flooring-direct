#!/usr/bin/env node

/**
 * Capture laminate category page from the live site
 */

const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureLaminatePage() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('📸 Capturing laminate page...');
    await page.goto('https://www.factory-direct-flooring.co.uk/laminate', {
      waitUntil: 'load',
      timeout: 30000
    });

    // Wait for content
    await page.waitForSelector('body', { timeout: 5000 });

    // Get HTML
    let html = await page.content();

    // Inject cart and products scripts
    html = html.replace(
      '</body>',
      `    <script src="/js/cart.js"></script>
    <script src="/js/products-data.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', async () => {
        await ProductsDB.load();
        const params = new URLSearchParams(window.location.search);
        if (params.has('category')) {
          const category = params.get('category');
          ProductsDB.renderCategoryPage(category);
        } else {
          // Default to rendering from category name
          const pathname = window.location.pathname;
          const match = pathname.match(/\/(\w+)/);
          if (match) {
            ProductsDB.renderCategoryPage(match[1]);
          }
        }
      });
    </script>
</body>`
    );

    // Save
    const outputPath = '/Users/jacobhedges/Projects/factory-flooring-direct/categories/laminate.html';
    fs.writeFileSync(outputPath, html);
    console.log(`✅ Saved to ${outputPath}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

captureLaminatePage();
