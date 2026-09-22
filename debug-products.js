#!/usr/bin/env node

const playwright = require('playwright');

async function debugProductsDB() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🔍 Debugging products database...\n');

    await page.goto('http://localhost:8080/product.html', { waitUntil: 'networkidle' });

    // Wait for scripts to load
    await page.waitForTimeout(2000);

    const debug = await page.evaluate(async () => {
      // Call load manually
      if (window.ProductsDB && window.ProductsDB.load) {
        console.log('Calling ProductsDB.load()...');
        await window.ProductsDB.load();
      }

      return {
        windowProductsDB: typeof window.ProductsDB,
        productsDBCount: window.productsDB?.length || 0,
        accessoriesCount: window.accessories?.length || 0,
        firstProduct: window.productsDB?.[0],
        testSlug: 'prestige-herringbone-laminate-flooring-iris-oak-8mm-3773',
        testMatch: window.ProductsDB?.getProduct('prestige-herringbone-laminate-flooring-iris-oak-8mm-3773'),
      };
    });

    console.log('ProductsDB type:', debug.windowProductsDB);
    console.log('Products loaded:', debug.productsDBCount);
    console.log('Accessories loaded:', debug.accessoriesCount);
    console.log('\nFirst product:', JSON.stringify(debug.firstProduct, null, 2));
    console.log('\nTest slug:', debug.testSlug);
    console.log('Match result:', debug.testMatch);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugProductsDB();
