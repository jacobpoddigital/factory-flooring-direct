#!/usr/bin/env node

const playwright = require('playwright');

async function debugScriptLoading() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  // Intercept script loads
  const scriptLoads = [];
  page.on('response', async response => {
    if (response.url().includes('/js/')) {
      scriptLoads.push({
        url: response.url(),
        status: response.status(),
      });
    }
  });

  try {
    console.log('Loading product page...\n');
    await page.goto('http://localhost:8080/product.html?slug=test', { waitUntil: 'networkidle' });

    console.log('Script loads:');
    scriptLoads.forEach(s => console.log(`  ${s.status === 200 ? '✅' : '❌'} ${s.url}`));

    await page.waitForTimeout(1000);

    const globals = await page.evaluate(() => {
      return {
        _ProductsDBType: typeof window.ProductsDB,
        _cart: typeof window.cart,
        _productsDB: typeof window.productsDB,
        productsDBKeys: Object.keys(window.ProductsDB || {}),
      };
    });

    console.log('\nGlobals:', globals);

    // Try calling load manually
    console.log('\nManually calling ProductsDB.load()...');
    try {
      await page.evaluate(async () => {
        if (window.ProductsDB && window.ProductsDB.load) {
          await window.ProductsDB.load();
        }
      });

      const afterLoad = await page.evaluate(() => {
        return {
          productsLoaded: window.productsDB?.length || 0,
          hasSpecs: !!window.productSpecs,
        };
      });

      console.log('After load:', afterLoad);
    } catch (e) {
      console.log('Error calling load:', e.message);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugScriptLoading();
