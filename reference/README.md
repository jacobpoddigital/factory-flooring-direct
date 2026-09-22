# Factory Direct Flooring - Static Mock Reference Package

This directory contains all extracted real data from the live Factory Direct Flooring e-commerce site (Magento 2 + Hyva theme).

## Files Included

### 1. SITE_STRUCTURE.md (PRIMARY DOCUMENT)
**Location**: `reference/SITE_STRUCTURE.md`
**Size**: 21KB, 593 lines
**Content**: Complete structural documentation covering:
- Global header & navigation (main menu items, icons, positioning)
- Homepage section order (10 major sections with class patterns)
- Category page structure (breadcrumbs, filters, product grid)
- Product detail page (price display, add-to-cart form)
- Cart page (empty state, form structure)
- Font usage (Playfair Display + Work Sans via Google Fonts)
- Image CDN patterns (imagely.factory-direct-flooring.co.uk)
- CSS/Tailwind utility classes used
- JavaScript frameworks (Alpine.js, Splide.js)
- Real product examples with IDs, prices, URLs
- Contact info and social links

**Use this as the single source of truth for your implementation plan.**

### 2. Raw HTML Files (`reference/html/`)
- `home.html` (626 KB) - Full homepage
- `category.html` (996 KB) - Laminate category listing
- `product.html` (632 KB) - Product detail page
- `cart.html` (433 KB) - Shopping basket page

**Use for deep inspection of actual HTML structure, forms, data attributes, inline scripts.**

### 3. Image URLs List (`reference/images/image-urls.txt`)
**Count**: 306 unique image URLs
**Format**: One URL per line with category label

All images hosted on: `https://imagely.factory-direct-flooring.co.uk/`

Categories include:
- Category hero images (360x360, 700x700 variants)
- Product images (with cache hash paths)
- Promotional banners (wysiwyg)
- Static assets (theme icons, empty cart graphic)
- Favicon

---

## Key Findings Summary

### Navigation Structure
- Sticky header (top-0 z-50 bg-white shadow-lg)
- Main nav: 9 top-level categories
- Filters in sidebar: Product Style, Plank Width, Price Per M², Thickness, Brand
- Mobile nav: collapsible via Alpine.js

### Pricing Format (CRITICAL)
- **Display**: `£21.98m²` (price + unit as superscript)
- **HTML**: `<span class="price">£21.98</span>m<sup>2</sup>`
- **Data attribute**: `data-price-amount="21.98"`
- All flooring products use per-square-meter pricing

### Product Card Layout
- Image: 5:4 aspect ratio locked (`!aspect-[5/4]`)
- Two hover buttons: Quick View + Wishlist
- Price box with per-m² format
- CTA buttons: "Order Free Sample" (primary) + "View Product" (border)
- Lazy loading enabled on all images

### Buttons & Forms
- Button classes: `btn btn-primary`, `btn btn-secondary`, `btn btn-border`
- Add-to-cart form: Alpine.js driven, dispatches `add-to-cart` event
- Form includes hidden CSRF token (`form_key`)
- Quantity auto-calculated via `:value="~~getPacksNeeded()"`

### Responsive Breakpoints (Tailwind)
- Mobile first with sm, md, xl breakpoints
- Filters: hidden on mobile, flex row on desktop (sm+)
- Product cards: stack on mobile, grid on desktop
- Text sizes scale: text-sm (mobile) to xl:text-base/xl:text-3xl

### Fonts
- **Heading (Playfair Display)**: serif, weights 400–900
- **Body (Work Sans)**: sans-serif, weights 100–900
- Both loaded from Google Fonts with italic support

### Tracking & Integrations
- Klaviyo: cart tracking and email
- OpenAI: pixel tracking
- Trustpilot: embedded reviews
- Facebook Domain Verification
- Ahrefs + Majestic site verification

---

## Real Product Examples (for testing)

### Example 1: Laminate
```
Name: Embrace Pro Laminate Flooring 14mm Crystal Oak AC5 Built-in Underlay
ID: 918260
Price: £21.98 m²
URL: /embrace-pro-laminate-flooring-14mm-crystal-oak-ac5-built-in-underlay
Images:
  - .../7/4/74154p-crystal_oak_11.jpg
  - .../7/4/74154p-crystal_oak_16.jpg
```

### Example 2: Herringbone Laminate
```
Name: Embrace Herringbone Laminate Flooring Farmhouse Oak 14mm Built-in Underlay
URL: /embrace-herringbone-laminate-flooring-farmhouse-oak-14mm-built-in-underlay
```

### Example 3: Engineered Wood
```
Name: Abbey Audley Engineered Wood Flooring Oak 14mm x 165mm Brushed Oiled
URL: /abbey-audley-engineered-wood-flooring-oak-14mm-x-165mm-brushed-oiled
```

---

## Implementation Checklist

- [ ] Study SITE_STRUCTURE.md for complete page layouts
- [ ] Review product card component (HTML structure + Tailwind classes)
- [ ] Implement header with sticky positioning and nav menu
- [ ] Set up category page with sidebar filters (Alpine.js)
- [ ] Build product detail page with per-m² price display
- [ ] Implement cart page (empty state + form structure)
- [ ] Load Playfair Display + Work Sans from Google Fonts
- [ ] Wire up image CDN URLs (imagely.factory-direct-flooring.co.uk)
- [ ] Test responsive breakpoints (mobile/tablet/desktop)
- [ ] Validate form submissions (add-to-cart, add-sample, wishlist)
- [ ] Confirm breadcrumb navigation on category/product pages
- [ ] Verify lazy loading on product images

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Pages Analyzed | 4 (home, category, product, cart) |
| HTML Files | 2.7 MB total |
| Product Card Aspect Ratio | 5:4 |
| Menu Items (Top Level) | 9 categories |
| Filters per Category | 5 filters |
| Image URLs Extracted | 306 |
| CSS Framework | Tailwind (Hyva) |
| JS Frameworks | Alpine.js + Splide.js |
| Font Families | 2 (Playfair Display + Work Sans) |
| Price Format | £X.XXm² |

---

Generated: 2026-09-22
Source: Live site HTML fetch + curl + grep-based parsing
Status: Complete, ready for static HTML/CSS mock implementation
