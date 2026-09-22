#!/usr/bin/env node

const playwright = require('playwright');

async function verifyProductPage() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('📋 Verifying product page rendering...\n');

    // Test with a real product slug
    const testSlug = 'prestige-herringbone-laminate-flooring-iris-oak-8mm-3773';
    const url = `http://localhost:8080/product.html?slug=${testSlug}`;

    console.log(`🔗 Loading: ${url}\n`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for ProductsDB to be initialized
    await page.waitForFunction(() => window.ProductsDB && window.ProductsDB.load, { timeout: 5000 });

    // Call load and wait for it
    await page.evaluate(async () => {
      await window.ProductsDB.load();
    });

    await page.waitForTimeout(500);

    // Check if product loaded
    const result = await page.evaluate(() => {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('slug');
      const product = window.ProductsDB.getProduct(slug);

      return {
        slug,
        found: !!product,
        productName: product?.name || 'NOT FOUND',
        productPrice: product?.price || 'N/A',
        productImage: product?.image ? '✅ Has image' : '❌ No image',
      };
    });

    console.log('✅ Product Data Found:');
    console.log(`   Slug: ${result.slug}`);
    console.log(`   Name: ${result.productName}`);
    console.log(`   Price: £${(result.productPrice / 100).toFixed(2)}`);
    console.log(`   Image: ${result.productImage}`);

    if (result.found) {
      console.log('\n✅ Product page is working correctly!');
    } else {
      console.log('\n❌ Product not found in database');
    }

    // Check if page title updated
    const title = await page.title();
    console.log(`\n📄 Page Title: "${title}"`);

    // Check if cart is available
    const cartOk = await page.evaluate(() => {
      return {
        cartExists: !!window.cart,
        cartMethods: window.cart ? Object.keys(window.cart) : [],
      };
    });

    console.log(`\n🛒 Cart:`, cartOk.cartExists ? '✅ Available' : '❌ Not available');
    if (cartOk.cartMethods.length > 0) {
      console.log(`   Methods: ${cartOk.cartMethods.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

verifyProductPage();
