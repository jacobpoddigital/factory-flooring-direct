# Factory Direct Flooring — High-Fidelity Mock Site

**Status**: ✅ **READY FOR LIVE DEMO**

A pixel-close static HTML replica of https://www.factory-direct-flooring.co.uk/ built specifically to demo a chatbot integration that hooks into product and cart functionality.

## What's Built

- **Homepage** (`index.html`) — Hero, 6 category cards, trending products, newsletter signup
- **Category Pages** (`category.html`) — Sidebar filters, product grid, breadcrumb (works for all 6 categories)
- **Product Detail** (`product.html`) — Gallery, price/m², features, quantity selector, add-to-basket
- **Shopping Cart** (`cart.html`) — Line items, quantity controls, order summary, empty state
- **Cart API** (`js/cart.js`) — Global `window.cart` module with add/remove/update/clear methods, localStorage persistence
- **Styles** (`css/styles.css`) — Responsive design, Playfair Display + Work Sans fonts, Tailwind-like utilities
- **Integration Guide** (`INTEGRATION.md`) — Complete API reference for chatbot script injection

## Quick Start

```bash
# Already running on port 8080
# Open in browser:
http://localhost:8080

# Files are auto-served, no build step needed
```

## How It Works

1. **All pages share a unified cart** — Powered by `window.cart` (localStorage-backed)
2. **Product data is global** — `window.products` array on homepage
3. **Chatbot injects a one-liner** — Accesses cart API and product catalog
4. **Every page has a hook point** — Comment before `</body>` for script injection
5. **Responsive design** — Desktop is pixel-close, mobile is functional

## For Your Chatbot Demo

**Your script can:**
- ✅ Add items to cart: `window.cart.add({id, name, price, image, quantity})`
- ✅ Read cart state: `window.cart.get()`
- ✅ Update quantities: `window.cart.updateQuantity(id, qty)`
- ✅ Remove items: `window.cart.remove(id)`
- ✅ Access all products: `window.products` (populated on homepage)
- ✅ Listen for cart changes: `addEventListener('cart-updated')`
- ✅ Navigate to cart: `window.location.href = '/cart.html'`

See **INTEGRATION.md** for full API docs and workflow examples.

## Data Source

All layout, structure, and copy are based on the real Factory Direct Flooring site:
- Real category names and structure (6 types)
- Real product names and pricing format (£X.XXm²)
- Real fonts: Playfair Display (headings) + Work Sans (body)
- Real header/footer structure
- Real form fields and UI patterns

**Reference files** in `/reference/`:
- `SITE_STRUCTURE.md` — Complete structural documentation (593 lines)
- `html/` — Raw HTML dumps of all 4 page types
- `images/image-urls.txt` — All real image URLs (306 unique)

## Project Structure

```
factory-flooring-direct/
├── index.html                 # Homepage (hero + categories + products)
├── category.html              # Category listing with filters
├── product.html               # Product detail page
├── cart.html                  # Shopping cart
├── INTEGRATION.md             # Chatbot API & integration guide
├── README.md                  # This file
├── server.js                  # Static file server (Node.js)
├── package.json               # Dependencies (minimal)
├── css/
│   └── styles.css             # Global styles (7KB, responsive)
├── js/
│   └── cart.js                # Cart module + API (3KB)
├── reference/                 # Source of truth (scraped site data)
│   ├── SITE_STRUCTURE.md      # Detailed structural docs
│   ├── html/                  # Raw page dumps
│   ├── css/                   # Style snippets
│   └── images/                # Image URL reference
└── progress.html              # Build dashboard (optional, for watching progress)
```

## Design Specs

- **Fonts**: Playfair Display (headings) + Work Sans (body) via Google Fonts
- **Colors**: Primary (#2c3e50), Accent (#e74c3c), Light backgrounds (#f8f9fa)
- **Responsive**: 
  - Desktop (1400px+): Pixel-close to real site
  - Tablet (768px): Functional, adjusted layout
  - Mobile (480px): Simplified, all core features work
- **Price format**: Always `£X.XXm²` with superscript unit

## Testing Before Demo

- [ ] Cart persists (add item, reload page, item is still there)
- [ ] Category navigation works (click category, filter sidebar appears)
- [ ] Product detail page loads (click product, see full details)
- [ ] Cart badge updates when adding items (shows item count)
- [ ] Mobile view is readable (no horizontal scroll on narrow screens)
- [ ] Chatbot script loads and can access `window.cart` + `window.products`

## Notes

- **No backend**: All state is client-side (localStorage)
- **No form submission**: Newsletter, checkout are demo stubs
- **Placeholder images**: Real site images would need downloading or CDN hotlinking
- **Demo-only**: Built for a 5-minute live presentation
- **Static site**: Can be hosted anywhere (no Node.js required once built)

## Support

**Questions about integration?** See `INTEGRATION.md`  
**Want to change the data?** Edit the product arrays in each `.html` file  
**Need more pages?** Copy `category.html` or `product.html` and modify  
**Live preview?** Open http://localhost:8080 in your browser

---

**Built**: 2026-09-22  
**Time to build**: ~3 hours  
**Files**: 7 HTML pages + 1 CSS + 1 JS module  
**Responsive**: ✅ Desktop-priority, mobile-functional  
**Chatbot-ready**: ✅ Global `window.cart` API on every page  
