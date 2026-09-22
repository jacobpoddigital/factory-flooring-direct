#!/usr/bin/env node

const playwright = require('playwright');

async function debugNetwork() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  const requests = [];
  page.on('request', request => {
    if (request.url().includes('localhost')) {
      requests.push({
        url: request.url().replace('http://localhost:8080', ''),
        method: request.method(),
      });
    }
  });

  try {
    console.log('Loading product page...\n');
    await page.goto('http://localhost:8080/product.html', { waitUntil: 'domcontentloaded', timeout: 10000 });

    // Wait for all requests to complete
    await page.waitForTimeout(2000);

    console.log('Requests to localhost:');
    const uniqueRequests = [...new Set(requests.map(r => r.url))].sort();
    uniqueRequests.forEach(url => {
      const isLocal = url.startsWith('/js/') ? '✅' : '  ';
      console.log(`${isLocal} ${url}`);
    });

    console.log('\nChecking if products-data.js was loaded...');
    const found = requests.find(r => r.url.includes('products-data.js'));
    console.log(found ? '✅ Found products-data.js' : '❌ NOT found');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugNetwork();
