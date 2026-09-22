/**
 * Products database - loaded from data/products.json
 * Made global so any page can access products
 */

window.productsDB = null;
window.productCategories = {};
window.productSpecs = {};
window.accessories = [];
window.compatibility = {};

// Load all data files
async function loadProductsData() {
  if (window.productsDB) return window.productsDB;

  try {
    // Load products
    const productsResponse = await fetch('/data/products.json');
    window.productsDB = await productsResponse.json();

    // Load specifications
    try {
      const specsResponse = await fetch('/data/product-specs.json');
      window.productSpecs = await specsResponse.json();
    } catch (e) {
      console.warn('Product specifications not found');
    }

    // Load accessories
    try {
      const accessoriesResponse = await fetch('/data/accessories.json');
      window.accessories = await accessoriesResponse.json();
    } catch (e) {
      console.warn('Accessories not found');
    }

    // Load compatibility matrix
    try {
      const compatResponse = await fetch('/data/product-compatibility.json');
      window.compatibility = await compatResponse.json();
    } catch (e) {
      console.warn('Compatibility matrix not found');
    }

    // Build category map for quick lookup
    window.productsDB.forEach(product => {
      if (!window.productCategories[product.category]) {
        window.productCategories[product.category] = [];
      }
      window.productCategories[product.category].push(product);
    });

    console.log(`✅ Loaded ${window.productsDB.length} products, ${window.accessories.length} accessories`);
    return window.productsDB;
  } catch (error) {
    console.error('Failed to load products:', error);
    return [];
  }
}

// Get product by ID or slug
function getProduct(idOrSlug) {
  if (!window.productsDB) return null;
  // Try ID first
  let product = window.productsDB.find(p => p.id === idOrSlug);
  if (product) return product;

  // Try slug (from URL field)
  product = window.productsDB.find(p => {
    const slugFromUrl = p.url.split('/').pop();
    return slugFromUrl === idOrSlug;
  });
  return product || null;
}

// Get products by category
function getProductsByCategory(category) {
  return window.productCategories[category] || [];
}

// Get product specifications
function getProductSpecs(productId) {
  return window.productSpecs[productId] || null;
}

// Get accessories for a product category
function getAccessoriesForCategory(category) {
  if (!window.compatibility.compatibility_matrix) return [];
  const compat = window.compatibility.compatibility_matrix[category];
  if (!compat) return [];

  const accessoryIds = new Set();
  Object.values(compat).forEach(ids => {
    ids.forEach(id => accessoryIds.add(id));
  });

  return window.accessories.filter(acc => accessoryIds.has(acc.id));
}

// Get specific accessory by ID
function getAccessory(accessoryId) {
  return window.accessories.find(acc => acc.id === accessoryId) || null;
}

// Get cross-sell accessories for a specific product
function getCrossSellAccessories(productId) {
  const product = getProduct(productId);
  if (!product) return [];

  const catCompat = window.compatibility.compatibility_matrix[product.category];
  if (!catCompat || !catCompat.cross_sell) return [];

  return window.accessories.filter(acc => catCompat.cross_sell.includes(acc.id));
}

// Get scenario bundle
function getScenarioBundle(scenarioKey) {
  return window.compatibility.scenario_bundles[scenarioKey] || null;
}

// Get all scenario bundles
function getAllScenarios() {
  return Object.entries(window.compatibility.scenario_bundles || {}).map(([key, bundle]) => ({
    key,
    ...bundle
  }));
}

// Render product into template
function renderProductPage(product) {
  if (!product) {
    document.body.innerHTML = '<h1>Product not found</h1>';
    return;
  }

  // Update price
  const priceElements = document.querySelectorAll('[data-price-display], .price-box span.price');
  priceElements.forEach(el => {
    el.textContent = '£' + (product.price / 100).toFixed(2);
  });

  // Update product name in title and heading
  document.title = product.name + ' | Factory Direct Flooring';
  const titleElements = document.querySelectorAll('h1[class*="product"], .product-title');
  titleElements.forEach(el => {
    el.textContent = product.name;
  });

  // Update images
  const images = document.querySelectorAll('img[class*="product-image"], img[loading="lazy"]');
  if (images.length > 0 && product.image) {
    images[0].src = product.image;
    images[0].alt = product.name;
  }

  // Update breadcrumb
  const breadcrumb = document.querySelector('.breadcrumb');
  if (breadcrumb) {
    const categoryLink = breadcrumb.querySelector('a[href*="flooring"]');
    if (categoryLink) {
      categoryLink.textContent = product.category;
    }
  }

  // Ensure cart integration works
  if (window.cart) {
    // Add product to window for cart add button
    window.currentProduct = product;

    // Find add to cart button and wire it
    const addBtn = document.querySelector('[title*="Add to Basket"], button:contains("Add to Basket")');
    if (addBtn) {
      addBtn.onclick = () => {
        const qty = parseInt(document.querySelector('input[name="qty"], input[type="number"]')?.value || 1);
        window.cart.add({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: qty
        });
        alert(`Added ${qty}m² to basket`);
      };
    }
  }
}

// Render category page with products
function renderCategoryPage(category) {
  const products = getProductsByCategory(category);

  if (products.length === 0) {
    console.warn(`No products found for category: ${category}`);
    return;
  }

  // Update category title
  document.title = category + ' Flooring | Factory Direct Flooring';
  const heading = document.querySelector('h1');
  if (heading) heading.textContent = category + ' Flooring';

  // Find product grid and render products
  const grid = document.querySelector('[class*="product-grid"], [class*="products"]');
  if (grid) {
    grid.innerHTML = products.map(p => `
      <div class="card-item card-product" style="border: 1px solid #ecf0f1; border-radius: 8px; overflow: hidden;">
        <div style="aspect-ratio: 5/4; overflow: hidden; background: #f8f9fa;">
          <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
        </div>
        <div style="padding: 1rem;">
          <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">
            <a href="/product.html?id=${p.id}" style="color: inherit;">${p.name}</a>
          </h3>
          <div style="font-size: 1.2rem; font-weight: 700; color: #e74c3c; margin: 0.5rem 0;">
            £${(p.price/100).toFixed(2)}<small style="font-size: 0.7em;">m<sup>2</sup></small>
          </div>
          <button onclick="window.cart.add({id: '${p.id}', name: '${p.name}', price: ${p.price}, image: '${p.image}', quantity: 1}); updateCartUI();" style="width: 100%; padding: 0.5rem; background: #2c3e50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Order Sample</button>
        </div>
      </div>
    `).join('');
  }
}

// Update cart UI from anywhere
function updateCartUI() {
  const cart = window.cart.get();
  const badge = document.querySelector('[id*="cart"], [aria-label*="Basket"]');
  if (badge && cart.itemCount > 0) {
    badge.textContent = cart.itemCount;
    badge.style.display = 'block';
  }
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
}

// Auto-load on page init
document.addEventListener('DOMContentLoaded', loadProductsData);

// Export for use
window.ProductsDB = {
  load: loadProductsData,
  getProduct,
  getProductsByCategory,
  getProductSpecs,
  getAccessoriesForCategory,
  getAccessory,
  getCrossSellAccessories,
  getScenarioBundle,
  getAllScenarios,
  renderProductPage,
  renderCategoryPage,
  updateCartUI
};
