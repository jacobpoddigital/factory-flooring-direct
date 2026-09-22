#!/usr/bin/env node

const playwright = require('playwright');

async function checkErrors() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  try {
    await page.goto('http://localhost:8080/product.html?slug=prestige-herringbone-laminate-flooring-iris-oak-8mm-3773');
    await page.waitForTimeout(2000);

    console.log('📋 Console messages:\n');
    consoleLogs.forEach(log => {
      console.log(`[${log.type}] ${log.text}`);
    });

    console.log('\n📦 Scripts on page:');
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
    });
    scripts.forEach(s => console.log(`  - ${s}`));

    console.log('\n🔍 Checking globals:');
    const globals = await page.evaluate(() => {
      return {
        hasProductsDB: typeof window.ProductsDB,
        hasProducstdb: typeof window.productsDB,
        hasCart: typeof window.cart,
      };
    });
    console.log(globals);

  } finally {
    await browser.close();
  }
}

checkErrors();
