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

  // Try slug (from URL field) — url is now this site's own
  // /product.html?slug=<slug> page (see the sourceUrl/url split, added when
  // navigation started using url directly), so the slug lives in the
  // query string, not the last path segment. Falls back to plain
  // path-segment parsing for any URL shape without a slug param.
  product = window.productsDB.find(p => extractSlugFromUrl(p.url) === idOrSlug);
  return product || null;
}

function extractSlugFromUrl(url) {
  try {
    const u = new URL(url, window.location.origin);
    const qsSlug = u.searchParams.get('slug');
    if (qsSlug) return qsSlug;
    return u.pathname.split('/').filter(Boolean).pop() || '';
  } catch (_) {
    return String(url).split('/').pop();
  }
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

    // Find add to cart button and wire it. ":contains" is jQuery-only, not valid
    // CSS -- querySelector throws a SyntaxError for the whole selector list when
    // any part of it is invalid, which was silently aborting the rest of this
    // function (including everything added after this block) on every product
    // page load.
    const addBtn = document.querySelector('[title*="Add to Basket"]') ||
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add to Basket'));
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

  // Wire the real captured "order a free sample" buttons. This page's markup
  // already has the real site's own sample UI (a ".product-sample" card near
  // the description, and a ".sticky-sample" bar fixed to the bottom) with the
  // real site's Alpine.js dispatch attributes baked in -- but Alpine itself
  // never loads here (its CDN script 404s/CORS-fails from our origin), so
  // those @click.prevent="$dispatch(...)" attributes are dead. Both containers
  // follow the same structure: <template (not-added state)><a (the one LIVE,
  // un-cloned anchor, since <template> contents aren't part of the rendered
  // DOM without a JS framework to clone them)><template (added state)>. We
  // only need to wire the one live anchor per container.
  wireSampleButton(document.querySelector('.product-sample'), product);
  wireSampleButton(document.querySelector('.sticky-sample'), product);

  // Authoritative signal for anything (e.g. Navigator's bridge) that wants to
  // react to product resolution instead of racing document.title/meta reads
  window.currentProduct = product;
  window.dispatchEvent(new CustomEvent('fdf:product-ready', { detail: product }));
}

// Both sample touchpoints on a product page (the inline ".product-sample" card
// and the fixed ".sticky-sample" bar) are wired independently but represent the
// same underlying state. Track every wired button for this page load so that
// ordering a sample from one place repaints the other immediately too, instead
// of leaving it visually stale until the next page load.
const _wiredSampleButtons = [];

function wireSampleButton(container, product) {
  if (!container || !window.samples) return;

  const link = Array.from(container.children).find(el => el.tagName === 'A');
  if (!link) return;

  // The inner <span class="btn ...">label</span> (product-sample card) carries
  // the visible label text separately from the anchor's own text (which also
  // includes the "Posted FREE, 1st Class" line); the sticky bar's anchor text
  // IS the label. Handle both by preferring the inner span if present.
  const labelEl = link.querySelector('span.btn') || link;
  const addedLabel = labelEl === link ? 'Added' : 'Sample Added';
  const notAddedLabel = labelEl.textContent.trim() || 'Order Free Sample';

  function paint(isAdded) {
    labelEl.textContent = isAdded ? addedLabel : notAddedLabel;
    link.classList.toggle('pointer-events-none', isAdded);
    link.style.opacity = isAdded ? '0.7' : '';
  }

  paint(window.samples.has(product.id));
  _wiredSampleButtons.push(paint);

  link.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.samples.has(product.id)) return;

    const result = window.samples.add({
      id: product.id,
      name: product.name,
      image: product.image,
      category: product.category,
    });

    if (!result.ok) {
      if (result.reason === 'limit-reached') {
        alert('You can order up to 2 free samples per basket. Remove one to add another.');
      }
      return;
    }

    _wiredSampleButtons.forEach(p => p(true));
    updateCartUI();
  });
}

// Render category page with products
// Category pages are a real one-to-one capture of the live site -- the grid
// already has the real products, real images, real prices, real layout. There's
// no reason to touch any of that; it's a replica, not something to rebuild.
// Kept as a no-op (rather than deleting it) so the per-page <script> tags that
// call ProductsDB.renderCategoryPage('CategoryName') don't need editing.
function renderCategoryPage(category) {}

// Render the actual cart contents on cart.html. The captured page's own line-item
// list is driven by the real site's Alpine "initCartForm()" component, which never
// runs here (Alpine fails to load), so without this the page always shows the
// static "cart-empty" state it happened to be captured in, regardless of what's
// actually in window.cart. Free samples (id starting "sample-") show as "FREE"
// with no quantity stepper, matching how they were added (fixed qty 1, no m² math).
function renderCartPage() {
  const container = document.querySelector('.cart-form');
  if (!container) return;

  const cart = window.cart.get();

  if (cart.items.length === 0) {
    container.innerHTML = `
      <div class="cart-empty mb-8 text-center">
        <img src="https://imagely.factory-direct-flooring.co.uk/static/version1789652328/frontend/Limely/fdf-hyva/en_GB/images/img-empty-basket.png" class="h-24 mb-4 inline-block">
        <p class="font-bold text-xl mb-2">You have no items in your shopping basket.</p>
        <p>Click <a href="/">here</a> to continue shopping.</p>
      </div>
    `;
    return;
  }

  const rows = cart.items.map(item => {
    const isSample = item.id.startsWith('sample-');
    return `
      <div style="display:flex; align-items:center; gap:1rem; padding:1rem 0; border-bottom:1px solid #ecf0f1;">
        <img src="${item.image}" alt="${item.name}" style="width:72px; height:72px; object-fit:cover; border-radius:4px;">
        <div style="flex:1;">
          <div style="font-weight:600;">${item.name}</div>
          <div style="color:#6b7280; font-size:0.875rem;">${isSample ? 'Free sample' : `Qty: ${item.quantity}m²`}</div>
        </div>
        <div style="font-weight:700; min-width:80px; text-align:right;">
          ${isSample ? '<span style="color:#16a34a;">FREE</span>' : '£' + ((item.price * item.quantity) / 100).toFixed(2)}
        </div>
        <button onclick="window.cart.remove('${item.id}'); renderCartPage(); updateCartUI();" style="background:none; border:none; color:#dc2626; cursor:pointer; font-size:0.875rem; text-decoration:underline;">Remove</button>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div>${rows}</div>
    <div style="display:flex; justify-content:space-between; padding:1.5rem 0; font-size:1.25rem; font-weight:700;">
      <span>Total</span>
      <span>£${(cart.total / 100).toFixed(2)}</span>
    </div>
  `;
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
  renderCartPage,
  updateCartUI
};

// renderCartPage needs re-running whenever the cart changes (e.g. clicking
// Remove on a line item, or adding something from another tab) while cart.html
// is open, not just once on load.
window.addEventListener('cart-updated', () => {
  if (document.querySelector('.cart-form')) renderCartPage();
});
