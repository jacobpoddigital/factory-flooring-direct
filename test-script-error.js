#!/usr/bin/env node

const playwright = require('playwright');

async function testScriptError() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
    });
  });

  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error);
  });

  try {
    console.log('Loading product page and checking console...\n');
    await page.goto('http://localhost:8080/product.html', { waitUntil: 'networkidle' });

    console.log('Console messages:');
    consoleMessages.forEach(msg => {
      console.log(`[${msg.type}] ${msg.text}`);
      if (msg.location) {
        console.log(`        at ${msg.location.url}:${msg.location.lineNumber}`);
      }
    });

    console.log('\n\nFinal state:');
    const state = await page.evaluate(() => {
      return {
        ProductsDB: typeof window.ProductsDB,
        cart: typeof window.cart,
        productsDB: typeof window.productsDB,
        ProductsDBMethods: window.ProductsDB ? Object.keys(window.ProductsDB).slice(0, 5) : [],
      };
    });

    console.log(JSON.stringify(state, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testScriptError();
