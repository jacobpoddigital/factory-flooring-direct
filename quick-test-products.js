#!/usr/bin/env node

const playwright = require('playwright');

async function testProducts() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  try {
    const testSlug = 'prestige-herringbone-laminate-flooring-iris-oak-8mm-3773';
    const url = `http://localhost:8080/product.html?slug=${testSlug}`;

    console.log(`📦 Testing product page...\n`);
    console.log(`🔗 URL: ${url}\n`);

    // Wait for networkidle to ensure all resources are loaded
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for ProductsDB to be defined
    try {
      await page.waitForFunction(() => typeof window.ProductsDB !== 'undefined', { timeout: 5000 });
    } catch (e) {
      console.log('⚠️  Timeout waiting for ProductsDB, continuing anyway...');
    }

    const result = await page.evaluate(() => {
      if (!window.ProductsDB) return { error: 'ProductsDB not defined' };
      if (!window.productsDB) return { error: 'productsDB not loaded' };

      const params = new URLSearchParams(window.location.search);
      const slug = params.get('slug');
      const product = window.ProductsDB.getProduct(slug);

      if (!product) {
        return {
          error: 'Product not found',
          attemptedSlug: slug,
          databaseSize: window.productsDB.length,
        };
      }

      return {
        success: true,
        name: product.name,
        price: `£${(product.price / 100).toFixed(2)}`,
        category: product.category,
        image: !!product.image,
      };
    });

    if (result.success) {
      console.log('✅ Product found!');
      console.log(`   Name: ${result.name}`);
      console.log(`   Price: ${result.price}`);
      console.log(`   Category: ${result.category}`);
      console.log(`   Has image: ${result.image}`);
    } else {
      console.log('❌ Error:', result.error);
      if (result.attemptedSlug) console.log(`   Slug: ${result.attemptedSlug}`);
      if (result.databaseSize !== undefined) console.log(`   Database size: ${result.databaseSize}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testProducts();
