#!/usr/bin/env node

/**
 * Smart link rewriting:
 * - PRESERVE: stylesheets, scripts, CDN URLs, external links
 * - REWRITE: category pages, product pages
 */

const fs = require('fs');
const path = require('path');

const CATEGORY_REWRITES = {
  '/solid-wood-flooring': '/categories/solid-wood.html',
  '/engineered-wood-flooring': '/categories/engineered-wood.html',
  '/laminate-flooring': '/categories/laminate.html',
  '/laminate': '/categories/laminate.html',
  '/vinyl-flooring': '/categories/vinyl.html',
  '/lvt-flooring': '/categories/lvt.html',
  '/herringbone-flooring': '/categories/herringbone.html',
  '/herringbone': '/categories/herringbone.html',
  '/advice-centre': '/advice.html',
  '/about': '/about.html',
};

function rewriteLinksSmartly(html) {
  let modified = html;

  // Step 1: Rewrite category/info page links
  // Only rewrite href attributes that contain our known category paths
  Object.entries(CATEGORY_REWRITES).forEach(([realPath, localPath]) => {
    // Match the href with full factory-direct-flooring URL or just the path
    const pattern = new RegExp(
      `href="https://www\\.factory-direct-flooring\\.co\\.uk${realPath}([^"]*)"`,
      'g'
    );
    modified = modified.replace(pattern, `href="${localPath}"`);
  });

  // Step 2: Rewrite product links (long slugs that look like products)
  // But preserve link attributes used for tracking/analytics
  modified = modified.replace(
    /href="https:\/\/www\.factory-direct-flooring\.co\.uk\/([a-z0-9\-]+)"(?![^>]*(?:stylesheet|css|js|script|src|data-|onclick))/g,
    (match, slug) => {
      // Skip if it matches a category we already handled
      if (Object.keys(CATEGORY_REWRITES).some(key => key.includes(slug))) {
        return match;
      }

      // Skip obvious non-products
      if (slug.startsWith('static') || slug.startsWith('media') || slug.startsWith('catalog')) {
        return match;
      }

      // If it's a long slug (product), route to dynamic product page
      if (slug.length > 20) {
        return `href="/product.html?slug=${slug}"`;
      }

      return match;
    }
  );

  return modified;
}

function processFile(filePath) {
  console.log(`\n🔗 Rewriting: ${path.basename(filePath)}`);

  let html = fs.readFileSync(filePath, 'utf8');

  // Count links before
  const linksBefore = (html.match(/href="https:\/\/www\.factory-direct-flooring\.co\.uk/g) || []).length;

  // Rewrite
  html = rewriteLinksSmartly(html);

  // Count after
  const linksAfter = (html.match(/href="https:\/\/www\.factory-direct-flooring\.co\.uk/g) || []).length;
  const rewritten = linksBefore - linksAfter;

  console.log(`   ✅ Rewrote ${rewritten} links (${linksBefore} → ${linksAfter} external)`);

  fs.writeFileSync(filePath, html);
}

async function main() {
  console.log('🧬 Smart link rewriting\n');

  const files = [
    '/Users/jacobhedges/Projects/factory-flooring-direct/index.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/product.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/cart.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/about.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/advice.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/categories/solid-wood.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/categories/engineered-wood.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/categories/laminate.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/categories/vinyl.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/categories/lvt.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/categories/herringbone.html',
  ];

  for (const file of files) {
    if (fs.existsSync(file)) {
      processFile(file);
    }
  }

  console.log('\n✅ Done!\n');
}

main().catch(console.error);
