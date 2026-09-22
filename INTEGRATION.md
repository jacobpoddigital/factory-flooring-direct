# Factory Direct Flooring Mock — Chatbot Integration Guide

## Overview
This is a static HTML mock of the Factory Direct Flooring e-commerce site built for live demo purposes. All pages share a unified cart system and global product catalog accessible to chatbot scripts.

## Quick Start
```bash
npm install
node server.js
# Open http://localhost:8080
```

## Chatbot Integration Points

### 1. Cart API (window.cart)
The cart is exposed globally on every page via `window.cart` with the following methods:

```javascript
// Add item to cart
window.cart.add({
  id: 'product-id',
  name: 'Product Name',
  price: 2198,  // in pence (£21.98)
  image: 'https://...',
  quantity: 1
});

// Remove item from cart
window.cart.remove('product-id');

// Update quantity
window.cart.updateQuantity('product-id', 5);

// Get full cart state
const cart = window.cart.get();
// Returns: { items: [...], total: 0, itemCount: 0 }

// Get total in pence
const total = window.cart.getTotal();

// Get item count
const count = window.cart.getItemCount();

// Clear cart
window.cart.clear();

// Debug log
window.cart.print();
```

### 2. Product Catalog (window.products)
Global product array populated on homepage:

```javascript
window.products = [
  {
    id: '918260',
    name: 'Embrace Pro Laminate Flooring...',
    category: 'Laminate',
    price: 2198,  // in pence
    image: 'https://...',
    description: '...',
    stock: 45,
    rating: 4.8,
    reviews: 126
  },
  // ... more products
];
```

### 3. Cart Updates Event
Listen for cart changes across the app:

```javascript
window.addEventListener('cart-updated', (event) => {
  console.log('Cart updated:', event.detail);
  // event.detail = full cart object
});
```

### 4. Page Hooks for Chatbot

#### Homepage (`/`)
- Category grid with 6 flooring types
- Product grid with "Order Sample" and "View Product" buttons
- Newsletter signup form
- All product tiles can trigger add-to-cart

#### Category Page (`/category.html?cat=laminate`)
- Filters for Product Style, Price, Thickness, Brand
- Product grid with same structure as homepage
- Breadcrumb navigation
- Free sample buttons on each card

#### Product Detail Page (`/product.html?id=918260`)
- Full product info: title, price, description, features
- Gallery with image thumbnails
- Quantity selector
- "Add to Basket" button
- "Free Sample" button
- Trust badges (free delivery, easy returns, quality)

#### Cart Page (`/cart.html`)
- Full cart display with item cards
- Quantity controls (±)
- Remove item button
- Order summary with subtotal/total
- "Proceed to Checkout" button (stub)
- Empty cart state with "Continue Shopping" link

### 5. Injecting Your Chatbot Script

Add your one-line chatbot script just before `</body>` tag on every page:

```html
<!-- Before </body> in index.html, category.html, product.html, cart.html -->
<script>
  // Your chatbot one-liner here
  // window.cart and window.products are already initialized
  // Example:
  // window.ChatbotWidget.init({ apiKey: 'xxx' });
</script>
```

### 6. Common Chatbot Workflows

**Recommend a product:**
```javascript
const laminate = window.products.find(p => p.category === 'Laminate');
// Show recommendation UI with product details
```

**Add recommended item to cart:**
```javascript
window.cart.add({
  id: laminate.id,
  name: laminate.name,
  price: laminate.price,
  image: laminate.image,
  quantity: 10  // e.g., 10m² based on room size
});
```

**Upsell based on cart contents:**
```javascript
const cart = window.cart.get();
if (cart.total > 5000) {
  // Show premium product recommendation
}
```

**Check if cart is empty:**
```javascript
if (window.cart.getItemCount() === 0) {
  // Show "Browse products" suggestion
}
```

**Redirect to checkout:**
```javascript
window.location.href = '/cart.html';  // Redirects to cart
// Then customer can click "Proceed to Checkout"
```

## File Structure

```
/
├── index.html              # Homepage
├── category.html           # Category listing (all 6 types)
├── product.html            # Product detail
├── cart.html               # Shopping cart
├── server.js               # Static file server
├── css/
│   └── styles.css          # Global styles (Tailwind-like utilities)
├── js/
│   └── cart.js             # Cart module (window.cart API)
├── reference/
│   ├── SITE_STRUCTURE.md   # Real site structure documentation
│   ├── html/               # Raw page HTML dumps
│   └── images/             # Image URL reference
└── progress.html           # Build progress dashboard
```

## Important Notes

1. **Prices are in pence** — £21.98 is stored as `2198` in the cart
2. **Prices always include m²** — Unit is "m²" (square meter) for flooring context
3. **Cart persists** — Uses localStorage, survives page reloads
4. **No backend required** — All state is client-side
5. **Images use placeholders** — Real images would need to be downloaded locally or hotlinked from imagely CDN
6. **Forms are demo stubs** — Newsletter, checkout, etc. don't submit anywhere
7. **Responsive design** — Layouts adapt to desktop/mobile (desktop is high-fidelity, mobile is functional)

## Testing Checklist

Before running the live demo:
- [ ] Cart works: add/remove/update items
- [ ] Cart persists after page reload
- [ ] Product links navigate correctly
- [ ] Category filters display properly
- [ ] Breadcrumbs navigate back correctly
- [ ] Header logo returns to homepage
- [ ] Mobile view is functional (if demoing on mobile)
- [ ] Chatbot script loads without errors
- [ ] Chatbot can read window.cart and window.products

## Demo Script

For a 5-minute live demo:
1. Open homepage, scroll through categories
2. Click into a product detail page
3. Add items to cart (mention that chatbot can do this automatically)
4. Go to cart page, show items
5. Demonstrate cart persists by reloading page
6. Show chatbot making a recommendation and adding to cart
7. Show order summary with total

---

**Built**: 2026-09-22  
**Source**: Static HTML + Vanilla JS  
**Reference**: `/reference/SITE_STRUCTURE.md` for exact layout replicas  
**Chatbot Ready**: Yes — `window.cart` and `window.products` are global APIs
