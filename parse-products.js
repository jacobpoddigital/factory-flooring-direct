#!/usr/bin/env node

/**
 * Parse captured HTML pages to extract all product data
 * Builds a products.json database for dynamic routing
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Fallback: use regex if cheerio isn't available
function parseWithRegex(html) {
  const products = [];

  // Find all product cards
  const productPattern = /data-product-id="(\d+)"[\s\S]*?<a\s+[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<span[^>]*class="price"[^>]*>([^<]*)<\/span>/g;

  let match;
  while ((match = productPattern.exec(html)) !== null) {
    const [, id, url, name, priceStr] = match;

    // Extract price number
    const priceMatch = priceStr.match(/£([\d.]+)/);
    const price = priceMatch ? Math.round(parseFloat(priceMatch[1]) * 100) : 0;

    if (id && name && price > 0) {
      products.push({
        id: id.trim(),
        name: name.trim(),
        url: url.trim(),
        price: price,
        category: 'Laminate' // We'll identify category from page
      });
    }
  }

  return products;
}

function parseProductsFromHTML(htmlPath, category) {
  console.log(`\n📖 Parsing: ${path.basename(htmlPath)}`);

  const html = fs.readFileSync(htmlPath, 'utf8');

  // Try using cheerio if available
  try {
    require('cheerio');
    return parseWithCheerio(html, category);
  } catch (e) {
    // Fallback to regex
    return parseWithRegex(html).map(p => ({ ...p, category }));
  }
}

function parseWithCheerio(html, category) {
  const cheerio = require('cheerio');
  const $ = cheerio.load(html);
  const products = [];

  $('.card-item.card-product').each((i, el) => {
    const $card = $(el);

    // Extract product ID from x-data attribute
    const xData = $card.attr('x-data') || '';
    const idMatch = xData.match(/initMyProjectProduct_(\d+)/);
    const productId = idMatch ? idMatch[1] : null;

    // Get product name from img alt
    const name = $card.find('img').attr('alt') || '';

    // Get product URL from link
    const url = $card.find('a.full-block').attr('href') || '';

    // Get first image
    const image = $card.find('img').first().attr('src') || '';

    // Get price - look for the price span/div
    const priceText = $card.find('.price-container, .price, [data-price-amount]').text() || '';
    const priceMatch = priceText.match(/£([\d.]+)/);
    const price = priceMatch ? Math.round(parseFloat(priceMatch[1]) * 100) : 0;

    if (productId && name && price > 0) {
      products.push({
        id: productId,
        name: name.trim(),
        url: url.trim(),
        price: price,
        image: image.trim(),
        category
      });
    }
  });

  return products;
}

async function main() {
  console.log('🔍 Extracting product data from captured pages...\n');

  const allProducts = [];

  // Define which captured files to parse
  const pages = [
    { file: 'pages-captured/category-solid-wood.html', category: 'Solid Wood' },
    { file: 'pages-captured/category-engineered-wood.html', category: 'Engineered Wood' },
    { file: 'pages-captured/category-laminate.html', category: 'Laminate' },
    { file: 'pages-captured/category-vinyl.html', category: 'Vinyl' },
    { file: 'pages-captured/category-lvt.html', category: 'LVT' },
    { file: 'pages-captured/category-herringbone.html', category: 'Herringbone' },
  ];

  for (const page of pages) {
    const filePath = path.join(__dirname, page.file);
    if (fs.existsSync(filePath)) {
      const products = parseProductsFromHTML(filePath, page.category);
      console.log(`   ✅ Found ${products.length} products`);
      allProducts.push(...products);
    }
  }

  // Deduplicate by ID
  const uniqueProducts = [];
  const seen = new Set();

  for (const product of allProducts) {
    if (!seen.has(product.id)) {
      seen.add(product.id);
      uniqueProducts.push(product);
    }
  }

  console.log(`\n📊 Total unique products: ${uniqueProducts.length}`);

  // Save to JSON
  const outputPath = path.join(__dirname, 'data', 'products.json');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(uniqueProducts, null, 2));
  console.log(`\n💾 Saved to: ${outputPath}`);

  // Show sample
  console.log(`\n📦 Sample products:`);
  uniqueProducts.slice(0, 3).forEach(p => {
    console.log(`   - ${p.name} (£${(p.price/100).toFixed(2)}, ID: ${p.id})`);
  });

  return uniqueProducts;
}

main().catch(console.error);
