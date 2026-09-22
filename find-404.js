#!/usr/bin/env node

const playwright = require('playwright');

async function find404() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  page.on('response', response => {
    if (response.status() === 404) {
      console.log(`❌ 404: ${response.url()}`);
    }
  });

  page.on('requestfailed', request => {
    console.log(`⚠️  Request failed: ${request.url()}`);
  });

  try {
    console.log('🔍 Loading product page...\n');
    await page.goto('http://localhost:8080/product.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    console.log('\n✅ Page loaded');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

find404();
