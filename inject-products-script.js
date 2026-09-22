#!/usr/bin/env node

/**
 * Inject products-data.js into all pages so they can access product database
 * Also rewrite links to point to local pages instead of real site
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_SCRIPT = `
    <script src="/js/products-data.js"></script>
    <script src="/js/cart.js"></script>
`;

// Link rewrites: map real URLs to local pages
const LINK_REWRITES = {
  '/solid-wood-flooring': '/categories/solid-wood.html',
  '/engineered-wood-flooring': '/categories/engineered-wood.html',
  '/laminate-flooring': '/categories/laminate.html',
  '/vinyl-flooring': '/categories/vinyl.html',
  '/lvt-flooring': '/categories/lvt.html',
  '/herringbone-flooring': '/categories/herringbone.html',
  '/advice-centre': '/advice.html',
  '/about': '/about.html',
};

function rewriteLinks(html) {
  let modified = html;

  // IMPORTANT: Do NOT rewrite stylesheet, script, or CDN links
  // Only rewrite navigation/product links

  // Rewrite links to category and info pages (must come BEFORE catch-all rewrites)
  Object.entries(LINK_REWRITES).forEach(([realPath, localPath]) => {
    const patterns = [
      new RegExp(`href="https://www\.factory-direct-flooring\.co\.uk${realPath}"`, 'g'),
      new RegExp(`href="${realPath}"`, 'g'),
    ];

    patterns.forEach(pattern => {
      modified = modified.replace(pattern, `href="${localPath}"`);
    });
  });

  // Rewrite product links ONLY (long slugs with product-like names)
  // Must look like /product-name-here
  modified = modified.replace(
    /href="https:\/\/www\.factory-direct-flooring\.co\.uk\/([a-z0-9\-]+)"(?![^>]*(?:stylesheet|css|js|src))/g,
    (match, slug) => {
      // Skip if it's a known category/info page (already handled above)
      if (Object.keys(LINK_REWRITES).some(key => key.includes(slug))) {
        return match;
      }

      // Skip if it looks like a resource (has file extensions or is a known path)
      if (slug.includes('.') || slug.startsWith('static') || slug.startsWith('media') || slug.startsWith('catalog')) {
        return match;
      }

      // Only rewrite if it looks like a product (long slug, multiple words)
      if (slug.includes('-') && slug.length > 20) {
        return `href="/product.html?slug=${slug}"`;
      }

      return match;
    }
  );

  // Don't do aggressive catch-all rewrites for factory-direct-flooring.co.uk
  // Only rewrite specific navigation we know about

  return modified;
}

function processFile(filePath) {
  console.log(`\n📝 Processing: ${path.basename(filePath)}`);

  let html = fs.readFileSync(filePath, 'utf8');

  // Inject products script before </body>
  if (!html.includes('products-data.js')) {
    html = html.replace(
      '</body>',
      PRODUCTS_SCRIPT + '\n</body>'
    );
    console.log('   ✅ Injected products-data.js');
  }

  // Rewrite links
  const beforeLinks = (html.match(/href="/g) || []).length;
  html = rewriteLinks(html);
  const afterLinks = (html.match(/href="/g) || []).length;
  console.log(`   ✅ Rewrote links (${beforeLinks} → ${afterLinks})`);

  // Write back
  fs.writeFileSync(filePath, html);
  console.log(`   💾 Saved`);
}

async function main() {
  console.log('🔗 Injecting products script and rewriting links...\n');

  const files = [
    '/Users/jacobhedges/Projects/factory-flooring-direct/index.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/product.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/cart.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/about.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/advice.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/categories/solid-wood.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/categories/engineered-wood.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/categories/vinyl.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/categories/lvt.html',
    '/Users/jacobhedges/Projects/factory-flooring-direct/categories/herringbone.html',
  ];

  for (const file of files) {
    if (fs.existsSync(file)) {
      processFile(file);
    } else {
      console.log(`\n⚠️  Skipping (not found): ${path.basename(file)}`);
    }
  }

  console.log('\n✅ Complete!\n');
}

main().catch(console.error);
