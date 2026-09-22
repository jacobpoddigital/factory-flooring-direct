/**
 * Products database - loaded from data/products.json
 * Made global so any page can access products
 */

window.productsDB = null;
window.productCategories = {};
window.productSpecs = {};
window.accessories = [];
window.compatibility = {};
window.deliveryInfo = {};

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

    // Load delivery/stock info (mock data, not a real backend)
    try {
      const deliveryResponse = await fetch('/data/delivery.json');
      window.deliveryInfo = await deliveryResponse.json();
    } catch (e) {
      console.warn('Delivery info not found');
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

// Get delivery/stock info for a product (mock data, not a real backend)
function getDeliveryInfo(productIdOrSlug) {
  const info = window.deliveryInfo || {};
  const base = info.default || {};
  const product = productIdOrSlug ? getProduct(productIdOrSlug) : null;
  const categoryOverride = product ? (info.by_category || {})[product.category] : null;

  return {
    ...base,
    ...(categoryOverride || {}),
    category: product ? product.category : null,
  };
}

// Get delivery FAQ entries
function getDeliveryFAQ() {
  return (window.deliveryInfo && window.deliveryInfo.faq) || [];
}

// The template pages (product.html) were captured from ONE real product on the
// live site, so their <title>, <meta>, <link rel="canonical">, and JSON-LD Product
// schema are all hardcoded to that one product. Anything reading page metadata
// (SEO tags, structured data, or a third-party script like Navigator) will see
// that stale product forever unless we overwrite every one of those surfaces
// here — updating document.title alone is not enough.
//
// Call this the instant the script runs (not gated behind an async data load)
// so nothing downstream — including deferred third-party scripts that execute
// before DOMContentLoaded — can observe the stale baked-in product identity.
function neutralizeStaleProductMetadata() {
  const placeholder = 'Loading product… | Factory Direct Flooring';
  document.title = placeholder;

  setMetaContent('meta[name="title"]', 'Loading product…');
  setMetaContent('meta[name="description"]', 'Loading product details…');
  setMetaContent('meta[property="og:title"]', 'Loading product…');
  setMetaContent('meta[property="og:description"]', 'Loading product details…');
  setMetaContent('meta[property="og:url"]', window.location.href);
  setMetaContent('meta[property="product:price:amount"]', '');

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', window.location.pathname + window.location.search);

  removeProductJsonLd();
  updateBreadcrumbJsonLd('Loading…', window.location.href);
  const staleBreadcrumb = document.querySelector('.breadcrumbs [aria-current="page"]');
  if (staleBreadcrumb) staleBreadcrumb.textContent = 'Loading…';
}

function setMetaContent(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute('content', value);
}

// The captured page ships a SEPARATE JSON-LD block for the breadcrumb trail
// (@type "BreadcrumbList", not "Product") whose last item hardcodes the
// originally-captured product's name/URL. removeProductJsonLd() deliberately
// only targets @type "Product" and never touched this one, so it stayed
// wrong forever regardless of which real product loaded — a second reader
// surface (alongside the breadcrumb DOM fix above) that could report the
// wrong "current page" identity.
function updateBreadcrumbJsonLd(name, url) {
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      const data = JSON.parse(script.textContent);
      if (data['@type'] !== 'BreadcrumbList' || !Array.isArray(data.itemListElement)) return;
      const last = data.itemListElement[data.itemListElement.length - 1];
      if (last && last.item) {
        last.item.name = name;
        if (url) last.item['@id'] = url;
        script.textContent = JSON.stringify(data);
      }
    } catch (e) {
      // not JSON-LD we care about, leave it alone
    }
  });
}

function removeProductJsonLd() {
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      const data = JSON.parse(script.textContent);
      if (data['@type'] === 'Product') {
        script.remove();
      }
    } catch (e) {
      // not JSON-LD we care about, leave it alone
    }
  });
}

// Explicit not-found state — distinct from the "Loading…" placeholder so nothing
// (including Navigator) mistakes an unresolved product for one that's still loading
function renderProductNotFound(requestedId) {
  const title = 'Product Not Found | Factory Direct Flooring';
  document.title = title;
  setMetaContent('meta[name="title"]', 'Product Not Found');
  setMetaContent('meta[property="og:title"]', 'Product Not Found');
  setMetaContent('meta[name="description"]', `No product matches "${requestedId}".`);
  setMetaContent('meta[property="og:description"]', `No product matches "${requestedId}".`);
  updateBreadcrumbJsonLd('Product Not Found', window.location.href);
  const staleBreadcrumb = document.querySelector('.breadcrumbs [aria-current="page"]');
  if (staleBreadcrumb) staleBreadcrumb.textContent = 'Product Not Found';
  window.currentProduct = null;
  window.dispatchEvent(new CustomEvent('fdf:product-not-found', { detail: { requestedId } }));
}

// Render product into template
function renderProductPage(product) {
  if (!product) {
    document.body.innerHTML = '<h1>Product not found</h1>';
    return;
  }

  const fullTitle = product.name + ' | Factory Direct Flooring';
  const description = `${product.name} — ${product.category} flooring from Factory Direct Flooring. £${(product.price / 100).toFixed(2)} per m².`;
  const pageUrl = window.location.origin + window.location.pathname + window.location.search;

  // Update price
  const priceElements = document.querySelectorAll('[data-price-display], .price-box span.price');
  priceElements.forEach(el => {
    el.textContent = '£' + (product.price / 100).toFixed(2);
  });

  // Update product name in title and heading
  document.title = fullTitle;
  const titleElements = document.querySelectorAll('h1[class*="product"], .product-title');
  titleElements.forEach(el => {
    el.textContent = product.name;
  });

  // Update every metadata surface a page-context reader might use, not just document.title
  setMetaContent('meta[name="title"]', fullTitle);
  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[property="og:title"]', fullTitle);
  setMetaContent('meta[property="og:description"]', description);
  setMetaContent('meta[property="og:url"]', pageUrl);
  if (product.image) setMetaContent('meta[property="og:image"]', product.image);
  setMetaContent('meta[property="product:price:amount"]', (product.price / 100).toFixed(2));

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', window.location.pathname + window.location.search);

  // Re-add a JSON-LD Product block for THIS product (the captured one was removed
  // by neutralizeStaleProductMetadata() before this ran)
  removeProductJsonLd();
  const jsonLd = document.createElement('script');
  jsonLd.type = 'application/ld+json';
  jsonLd.textContent = JSON.stringify({
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    sku: product.id,
    image: product.image,
    description: description,
    category: product.category,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GBP',
      price: (product.price / 100).toFixed(2),
      url: pageUrl,
      availability: 'https://schema.org/InStock',
    },
  });
  document.head.appendChild(jsonLd);

  // Update images
  const images = document.querySelectorAll('img[class*="product-image"], img[loading="lazy"]');
  if (images.length > 0 && product.image) {
    images[0].src = product.image;
    images[0].alt = product.name;
  }

  // Update breadcrumb — was '.breadcrumb' (selector typo, no such class exists;
  // the real element is `<nav class="breadcrumbs">`, plural), so this whole
  // block silently no-op'd on every page load and the visible "current page"
  // breadcrumb text stayed on the originally-captured product forever.
  const breadcrumb = document.querySelector('.breadcrumbs');
  if (breadcrumb) {
    const categoryLink = breadcrumb.querySelector('a[href*="flooring"]');
    if (categoryLink) {
      categoryLink.textContent = product.category;
    }
    // The final breadcrumb item (aria-current="page") shows the product
    // name itself — this is the most likely thing a page-context reader
    // (including Navigator) picks up as "what page is this," and it was
    // never updated at all, even when the selector above worked.
    const currentPage = breadcrumb.querySelector('[aria-current="page"]');
    if (currentPage) {
      currentPage.textContent = product.name;
    }
  }
  updateBreadcrumbJsonLd(product.name, pageUrl);

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

  // Authoritative signal for anything (e.g. Navigator's bridge) that wants to
  // react to product resolution instead of racing document.title/meta reads
  window.currentProduct = product;
  window.dispatchEvent(new CustomEvent('fdf:product-ready', { detail: product }));
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
  getDeliveryInfo,
  getDeliveryFAQ,
  neutralizeStaleProductMetadata,
  renderProductPage,
  renderProductNotFound,
  renderCategoryPage,
  updateCartUI
};
