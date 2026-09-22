#!/usr/bin/env node

/**
 * Simple injection: just add cart.js and products-data.js to each page
 * Don't rewrite any existing links - let them work as-is
 */

const fs = require('fs');
const path = require('path');

const SCRIPTS_TO_INJECT = `
    <script src="/js/cart.js"></script>
    <script src="/js/products-data.js"></script>
    <script>
      // Route products and categories on page load
      document.addEventListener('DOMContentLoaded', async () => {
        await ProductsDB.load();

        // If this is a product page with an ID, render it
        const params = new URLSearchParams(window.location.search);
        if (params.has('id')) {
          const product = ProductsDB.getProduct(params.get('id'));
          if (product) {
            ProductsDB.renderProductPage(product);
          }
        }
      });
    </script>
`;

function injectScripts(filePath) {
  console.log(`\n📝 Injecting into: ${path.basename(filePath)}`);

  let html = fs.readFileSync(filePath, 'utf8');

  // Only inject if not already injected
  if (html.includes('products-data.js')) {
    console.log('   ⏭️  Already injected, skipping');
    return;
  }

  // Inject before </body>
  html = html.replace(
    '</body>',
    SCRIPTS_TO_INJECT + '\n</body>'
  );

  fs.writeFileSync(filePath, html);
  console.log('   ✅ Injected successfully');
}

async function main() {
  console.log('💉 Simple script injection (no link rewriting)\n');

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
      injectScripts(file);
    }
  }

  console.log('\n✅ Done!\n');
}

main().catch(console.error);
