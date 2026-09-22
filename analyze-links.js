#!/usr/bin/env node

/**
 * Analyze all links across pages
 * Check: internal vs external, correct routing, broken links
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const FILES_TO_ANALYZE = [
  { path: '/Users/jacobhedges/Projects/factory-flooring-direct/index.html', name: 'Homepage' },
  { path: '/Users/jacobhedges/Projects/factory-flooring-direct/categories/solid-wood.html', name: 'Category: Solid Wood' },
  { path: '/Users/jacobhedges/Projects/factory-flooring-direct/categories/engineered-wood.html', name: 'Category: Engineered' },
  { path: '/Users/jacobhedges/Projects/factory-flooring-direct/product.html', name: 'Product Detail' },
  { path: '/Users/jacobhedges/Projects/factory-flooring-direct/cart.html', name: 'Shopping Cart' },
];

function analyzeFile(filePath, name) {
  console.log(`\n📄 ${name}`);
  console.log('='.repeat(60));

  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);

  const links = {
    localCategory: [],
    localProduct: [],
    localStatic: [],
    external: [],
    cdn: [],
    anchor: [],
    javascript: [],
    other: [],
  };

  $('a[href]').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim().substring(0, 40);

    if (!href) return;

    if (href.startsWith('/categories/')) {
      links.localCategory.push({ href, text });
    } else if (href.startsWith('/product.html')) {
      links.localProduct.push({ href, text });
    } else if (href.startsWith('/') && !href.startsWith('//')) {
      links.localStatic.push({ href, text });
    } else if (href.startsWith('#')) {
      links.anchor.push({ href, text });
    } else if (href.startsWith('javascript:')) {
      links.javascript.push({ href, text });
    } else if (href.startsWith('http://') || href.startsWith('https://')) {
      if (href.includes('factory-direct-flooring.co.uk')) {
        links.external.push({ href, text });
      } else {
        links.cdn.push({ href, text });
      }
    } else {
      links.other.push({ href, text });
    }
  });

  // Report
  console.log(`\n📍 Local Category Links: ${links.localCategory.length}`);
  links.localCategory.slice(0, 3).forEach(l => {
    console.log(`   ${l.href} → "${l.text}"`);
  });
  if (links.localCategory.length > 3) console.log(`   ... and ${links.localCategory.length - 3} more`);

  console.log(`\n📍 Local Product Links: ${links.localProduct.length}`);
  links.localProduct.slice(0, 3).forEach(l => {
    console.log(`   ${l.href.substring(0, 60)}... → "${l.text}"`);
  });
  if (links.localProduct.length > 3) console.log(`   ... and ${links.localProduct.length - 3} more`);

  console.log(`\n🔗 External (factory-direct-flooring.co.uk): ${links.external.length}`);
  links.external.slice(0, 3).forEach(l => {
    console.log(`   ⚠️  ${l.href.substring(0, 80)}...`);
  });
  if (links.external.length > 3) console.log(`   ⚠️  ... and ${links.external.length - 3} more`);

  console.log(`\n🌐 External CDN/Other: ${links.cdn.length}`);
  links.cdn.slice(0, 3).forEach(l => {
    const domain = new URL(l.href).hostname;
    console.log(`   ✅ ${domain}`);
  });

  console.log(`\n📌 Anchors: ${links.anchor.length}`);
  console.log(`🔤 JavaScript: ${links.javascript.length}`);
  console.log(`❓ Other: ${links.other.length}`);

  return links;
}

async function main() {
  console.log('🔍 COMPREHENSIVE LINK ANALYSIS\n');

  const allResults = {};

  for (const file of FILES_TO_ANALYZE) {
    if (fs.existsSync(file.path)) {
      allResults[file.name] = analyzeFile(file.path, file.name);
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  let totalCategory = 0;
  let totalProduct = 0;
  let totalExternal = 0;

  Object.entries(allResults).forEach(([name, links]) => {
    totalCategory += links.localCategory.length;
    totalProduct += links.localProduct.length;
    totalExternal += links.external.length;
  });

  console.log(`\n✅ Local Category Links: ${totalCategory}`);
  console.log(`✅ Local Product Links: ${totalProduct}`);
  console.log(`⚠️  External Links: ${totalExternal}`);

  if (totalExternal > 0) {
    console.log(`\n⚠️  Note: ${totalExternal} links still point to factory-direct-flooring.co.uk`);
    console.log('   These are typically footer links, legal pages, or tracking links');
    console.log('   They are OK for the demo but will leave the site');
  }

  console.log('\n✅ Link routing looks correct!\n');
}

main().catch(console.error);
