#!/usr/bin/env node

const playwright = require('playwright');

async function testHomepage() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Testing homepage...\n');
    await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const result = await page.evaluate(() => {
      return {
        hasProductsDB: typeof window.ProductsDB,
        hasCart: typeof window.cart,
        productsLoaded: window.productsDB ? window.productsDB.length : 0,
        accessoriesLoaded: window.accessories ? window.accessories.length : 0,
      };
    });

    console.log('Homepage globals:', result);

    if (result.hasProductsDB === 'object') {
      console.log('✅ ProductsDB is available on homepage');
    } else {
      console.log('❌ ProductsDB not available');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testHomepage();
