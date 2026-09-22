# Factory Direct Flooring - Live Site Structure Reference

**Date**: 2026-09-22
**Site**: https://www.factory-direct-flooring.co.uk/
**Platform**: Magento 2 with Hyva theme (Limely child theme)
**Data Source**: Curl + HTML parsing (4 full page fetches)

---

## Global Header & Navigation

### Header Structure
```html
<header class="page-header sticky top-0 z-50 bg-white shadow-lg">
```

**Header Elements** (top sticky bar):
- Logo: SVG at `/static/frontend/Limely/fdf-hyva/en_GB/images/logo.svg`
- Search icon (aria-label="Search")
- Account icon (aria-label="My Account")
- Basket/Cart icon (aria-label="Basket Button")
- Wishlist toggle

### Main Navigation
```html
<nav class="desktop-navigation">
  <div class="container">
    <ul class="main-navigation">
```

**Top-Level Menu Items** (verified from homepage HTML):
1. Solid Wood Flooring
2. Engineered Wood Flooring
3. Laminate
4. Vinyl / LVT
5. Herringbone
6. Accessories
7. Brands
8. Advice Centre
9. Blog

Each top-level menu supports megamenu expansion (x-data="megamenu: false")

**Filter Categories Visible in Nav** (from category page):
- Product Style (e.g., Wood Plank, Herringbone)
- Plank Width
- Price Per M²
- Thickness
- Brand

### Mobile Navigation
```html
<nav class="mobile-navigation" x-show="mobilemenu" x-cloak>
```
Alpine.js controlled, hidden by default.

### Contact / Trust Elements
- Phone number: +44 (0)330 100 00 15 (from schema.org JSON)
- Trustpilot reviews link: https://uk.trustpilot.com/review/www.factory-direct-flooring.co.uk
- Email: info@factory-direct-flooring.co.uk

---

## Homepage (`/`)

**Page Title**: "Factory Direct Flooring - save up to 60% on typical UK high street prices"
**Meta Description**: "We stock an extensive selection of laminate, roll vinyl, LVT, herringbone, engineered and real wood flooring with free samples delivered 1st class."

### Section Order
1. **Global Message Banner** (noscript warning) – blue border top, shadow
2. **Category Grid Section** (`section-categories`) – 360x360 & 700x700 category images
3. **Trending Flooring Section** (`section-products section-trending-flooring`) – product grid with cards
4. **About / Video Section** (`section-about-video`)
5. **Shop by Colour Section** (`section-shop-colour`) – py-8
6. **Image Blocks Section** (`section-image-blocks`)
7. **About Text Section** (`section-about`) – lg:py-20 xl:py-32
8. **Trending Advice Section** (`section-trending-advice`) – product grid
9. **Image Blocks Section** (repeat)
10. **Instagram Feed Section** (`section-instagram`)
11. **Newsletter Section** (`footer-newsletter`) – bg-slate-200, py-8
12. **Footer** (`page-footer`) – mt-12, text-sm font-medium

### Category Cards
```
<div class="card-category">
  <img src="https://imagely.factory-direct-flooring.co.uk/media/catalog/category/resized/360x360/category-[TYPE].jpg" />
  <!-- 700x700 variant also available -->
</div>
```

**Category Types** (from image URLs):
- category-engineered-wood.jpg
- category-herringbone.jpg
- category-lam.jpg (Laminate)
- category-lvt.jpg
- category-roll-vinyl.jpg
- category-solid-wood.jpg

### Product Card Structure (Homepage & Category)
```html
<div class="card-item card-product group product-item"
     x-data="Object.assign({},{sampleItems:[]},initMyProjectProduct_[ID]())"
     x-defer="interact">
  <div class="card-image">
    <img x-data src="[IMAGE_URL]" alt="[PRODUCT_NAME]" loading="lazy" class="!aspect-[5/4]" />
    <img src="[IMAGE_URL_HOVER]" class="!aspect-[5/4] absolute top-0 left-0" />
    
    <!-- Hover Buttons (hidden until hover) -->
    <div class="absolute top-4 left-4 right-4 hidden sm:flex gap-2 opacity-0 group-hover:opacity-100">
      <button @click.prevent="$dispatch('quickview-modal'...)" class="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full">
        <!-- Eye icon for Quick View -->
      </button>
      <button @click.prevent="addToWishlist([ID])" class="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full">
        <!-- Heart icon for Wishlist -->
      </button>
    </div>
  </div>
  
  <h3 class="text-sm xl:text-base leading-3 xs:leading-4 mb-1.5">
    <a href="[PRODUCT_URL]" class="group-hover:text-primary">[PRODUCT_NAME]</a>
  </h3>
  
  <!-- Price Box -->
  <div class="price-box price-sqm_price" data-role="priceBox" data-product-id="[ID]">
    <span class="price-container price-sqm_price tax weee">
      <span data-price-amount="[AMOUNT]" class="price-wrapper">
        <span class="price">£[AMOUNT]</span>m<sup>2</sup>
      </span>
    </span>
  </div>
  
  <!-- Sample/View Buttons -->
  <div class="flex flex-wrap items-center gap-3 mt-auto">
    <a @click.prevent="$dispatch('add-sample', {id: [ID]})" href="#" class="btn btn-primary">
      <span class="mr-1">Order</span> Free Sample
    </a>
    <a href="[PRODUCT_URL]" class="btn btn-border border-primary hidden btn-view-product">
      View Product
    </a>
  </div>
</div>
```

**Real Product Example**:
```
Name: Embrace Pro Laminate Flooring 14mm Crystal Oak AC5 Built-in Underlay
SKU/ID: 918260
Price: £21.98 m²
URL: https://www.factory-direct-flooring.co.uk/embrace-pro-laminate-flooring-14mm-crystal-oak-ac5-built-in-underlay
Image (1): https://imagely.factory-direct-flooring.co.uk/media/catalog/product/cache/07f4e6a093cd3c305a832187014ed50b/7/4/74154p-crystal_oak_11.jpg
Image (2): https://imagely.factory-direct-flooring.co.uk/media/catalog/product/cache/07f4e6a093cd3c305a832187014ed50b/7/4/74154p-crystal_oak_16.jpg
```

### CSS Utility Classes
- **Buttons**: `btn`, `btn-primary`, `btn-secondary`, `btn-border`, `btn-sm`
- **Cards**: `card-item`, `card-product`, `card-category`, `card-image`, `card-content`
- **Layout**: `flex`, `flex-wrap`, `gap-3`, `mt-auto`, `items-center`, `justify-between`
- **Colors**: `bg-slate-100`, `hover:bg-slate-200`, `hover:text-primary`, `text-primary`
- **Spacing**: `mb-1.5`, `mb-4`, `py-8`, `px-3`, `px-0 -mt-4`
- **Visibility**: `hidden`, `sm:flex`, `opacity-0`, `group-hover:opacity-100`
- **Responsive**: `text-sm`, `xl:text-base`, `sm:flex-row`, `md:flex-col`, `xl:flex-row`

### Footer Structure
```html
<footer class="page-footer mt-12 text-sm font-medium">
  <div class="footer-newsletter bg-slate-200 w-full py-8 text-center">
    <div class="container max-w-xl">
      <!-- Newsletter signup form -->
    </div>
  </div>
  
  <!-- Footer columns (multiple columns with links) -->
  <!-- Links organized by: Our Flooring, Useful Links, For Help and Advice, My Account -->
</footer>
```

**Footer Link Categories**:
- Our Flooring: Laminate, Solid Wood, Engineered Wood, Vinyl, LVT, Herringbone
- Useful Links: Sitemap, Editorial Policy, Sustainability, Terms & Conditions
- For Help & Advice: Advice Centre, How to Measure a Floor, How to Lay Laminate, How to Clean Vinyl, Engineered Wood vs Solid Wood, LVT vs Laminate
- My Account: My Basket, Wishlist, My Account
- Customer Service: Checkout, Contact Us, Delivery Information, Returns & Exchanges
- Brands: Manor Collection, Abbey, Aqua Plank, Embrace, Engrave, EcoStep, Manor, CosyStep, Loire Naturalle, Hyper-Loc, EproPro Safe, Chic Parquet, Plain Colours

---

## Category Page (`/laminate`)

**Page Title**: "Laminate Flooring | Up to 60% Cheaper | Free Laminate Samples"
**URL Pattern**: `/[category-name]` (no `.html` extension)

### Breadcrumb
```html
<nav class="breadcrumbs" aria-label="Breadcrumb">
  <div class="container">
    <ol class="flex flex-wrap text-xs border-t py-2">
      <li class="item flex font-bold home">
        <a href="/" class="hover:underline" title="Home">Home</a>
      </li>
      <li class="item flex font-bold category-3">
        <span class="separator px-1.5 font-medium text-danger">•</span>
        <span>Laminate</span>
      </li>
    </ol>
  </div>
</nav>
```

**Breadcrumb Style**:
- Small font (text-xs)
- Top border (border-t)
- Padding y-2
- Separator: bullet (•) in danger color (red)
- Home link is clickable, category is plain text

### Sidebar / Filters
```html
<div class="filter-content">
  <div class="regular-filters p-3 sm:p-0 -mt-4 sm:mt-0 border border-border bg-slate-100 sm:bg-transparent space-y-2 sm:space-y-0 hidden sm:flex flex-wrap mb-3 text-sm gap-1"
       :class="{ 'block': blockOpen, 'hidden': !blockOpen }">
    <!-- Mobile: show/hide toggle; Desktop: always visible flex row -->
    
    <div class="filter-option relative" @click.outside="closeFilter('product_style')">
      <div class="filter-options-title font-bold flex items-center justify-between cursor-pointer bg-white hover:bg-slate-100 border border-border px-3 py-2.5"
           @click.prevent.stop="setOpenedFilter('product_style')"
           role="button" tabindex="0">
        <span>Product Style</span>
        <svg class="size-4" :class="{ 'rotate-180': isFilterOpened('product_style') }"></svg>
      </div>
      
      <div class="filter-options-content sm:absolute top-full left-0 border shadow-md z-20 p-3 min-w-60 bg-slate-100 max-h-48 overflow-y-auto"
           x-show="isFilterOpened('product_style')" x-cloak>
        <form class="am-filter am-ranges" aria-label="Filter Product Style in sidebar filters">
          <ol role="list" class="items am-filter-items">
            <li class="item flex justify-between py-0.5 hover:underline leading-tight">
              <div class="filter-row w-full flex items-center">
                <input type="radio" name="amshopby[product_style][]" value="[ID]" class="radio mr-2" />
                <a href="https://www.factory-direct-flooring.co.uk/laminate?product_style=[ID]" class="am-filter-item">
                  [FILTER_OPTION_NAME] ([COUNT])
                </a>
              </div>
            </li>
          </ol>
        </form>
      </div>
    </div>
  </div>
</div>
```

**Available Filters** (from aria-labels):
1. Product Style (e.g., Wood Plank, Herringbone)
2. Plank Width
3. Price Per M² (with price range sliders)
4. Thickness
5. Brand

**Filter Behavior**:
- Mobile: collapsible (hidden by default, toggle with blockOpen state)
- Desktop (sm breakpoint+): always visible as horizontal flex row
- Each filter has dropdown behavior (Alpine.js controlled)
- Filter links use URL params: `?product_style=6550`
- Hover/selected state changes background to slate-100

### Product Grid
Same card structure as homepage (see above), but filtered by category URL params.

**Real Product on Laminate Category**:
```
Name: Embrace Pro Laminate Flooring 14mm Crystal Oak AC5 Built-in Underlay
Price: £21.98 m²
URL: https://www.factory-direct-flooring.co.uk/embrace-pro-laminate-flooring-14mm-crystal-oak-ac5-built-in-underlay
```

### Pagination
```html
<a href="https://www.factory-direct-flooring.co.uk/laminate?p=2"><!-- Next page --></a>
```

---

## Product Detail Page (`/embrace-pro-laminate-flooring-14mm-crystal-oak-ac5-built-in-underlay`)

**Page Title**: "Embrace Pro Laminate Flooring 14mm Crystal Oak AC5 Built-in Underlay"
**URL Pattern**: `/[product-name-slug]` (no `.html`)

### Breadcrumb
```html
<nav class="breadcrumbs" aria-label="Breadcrumb">
  <ol class="flex flex-wrap text-xs border-t py-2">
    <li class="item flex font-bold home">
      <a href="/" class="hover:underline">Home</a>
    </li>
    <li class="item flex font-bold category-3">
      <span class="separator px-1.5 text-danger">•</span>
      <a href="/laminate" class="hover:underline">Laminate</a>
    </li>
    <li class="item flex font-bold">
      <span class="separator px-1.5 text-danger">•</span>
      <span>Embrace Pro Laminate Flooring 14mm Crystal Oak AC5 Built-in Underlay</span>
    </li>
  </ol>
</nav>
```

### Main Product Section
```html
<div class="price-stock flex flex-col sm:flex-row md:flex-col xl:flex-row gap-3 justify-between sm:items-center md:items-start xl:items-center mb-6 leading-tight text-xs">
  <div class="">
    <div class="price-box price-sqm_price" data-role="priceBox" data-product-id="918260">
      <span class="price-container price-sqm_price tax weee">
        <span data-price-amount="21.98" class="price-wrapper">
          <span class="price">£21.98</span>m<sup>2</sup>
        </span>
      </span>
    </div>
  </div>
</div>
```

**Price Display Format**:
- Price amount: `£21.98`
- Unit: `m²` (square meter) as superscript
- CSS class: `price-container price-sqm_price tax weee`
- Data attributes: `data-price-amount="21.98"`, `data-price-type=""`

### Add to Cart Form
```html
<form method="post"
      action="https://www.factory-direct-flooring.co.uk/checkout/cart/add/uenc/aHR0c...~/product/918260/"
      class="mb-6"
      id="product_addtocart_form"
      x-data="initAddToCartForm()"
      @submit.prevent="$dispatch('add-to-cart', $event)">
  
  <input type="hidden" name="product" value="918260" />
  <input type="hidden" name="selected_configurable_option" value="" />
  <input type="hidden" name="related_product" id="related-products-field" value="" />
  <input type="hidden" name="item" value="918260" />
  <input name="form_key" type="hidden" value="[FORM_KEY]" />
  
  <!-- Quantity input -->
  <input form="product_addtocart_form" type="hidden" name="qty" :value="~~getPacksNeeded()" />
  
  <!-- Submit button -->
  <button type="submit" form="product_addtocart_form" title="Add to Basket" class="btn btn-secondary grow text-base">
    Add to Basket
  </button>
</form>
```

**Form Behavior**:
- Alpine.js driven (x-data="initAddToCartForm()")
- Form dispatches custom event: `add-to-cart`
- Quantity calculated dynamically: `:value="~~getPacksNeeded()"`
- Uses base64-encoded return URL in action
- Form key included for CSRF protection

### Button Styling
```html
<button ... class="btn btn-secondary grow text-base">
```

**Button Classes**:
- `btn` – base button
- `btn-secondary` – secondary styling (vs. `btn-primary`)
- `grow` – flex-grow (fills width)
- `text-base` – font size

---

## Cart Page (`/checkout/cart/`)

**Page Title**: "Shopping Basket"
**URL**: `https://www.factory-direct-flooring.co.uk/checkout/cart/`

### Empty Cart State
```html
<div class="cart-empty mb-8 text-center">
  <img src="https://imagely.factory-direct-flooring.co.uk/static/version1789652328/frontend/Limely/fdf-hyva/en_GB/images/img-empty-basket.png"
       class="h-24 mb-4 inline-block" />
  <p class="font-bold text-xl mb-2">You have no items in your shopping basket.</p>
  <p>Click <a href="https://www.factory-direct-flooring.co.uk/">here</a> to continue shopping.</p>
</div>
```

**Empty Cart Styling**:
- Center-aligned (`text-center`)
- Icon: h-24, mb-4, inline-block
- Heading: font-bold, text-xl, mb-2
- Message text: normal, with clickable link back to home

### Page Structure
```html
<div class="checkout-cart-index page-layout-1column">
  <main id="maincontent">
    <!-- Cart content -->
  </main>
</div>
```

**Cart Form** (when items present):
```html
<form class="form form-cart flex gap-1">
  <!-- Cart items table/list, quantities, remove buttons -->
  <!-- Totals section -->
  <!-- Proceed to checkout button -->
</form>
```

### Alpine.js Integration
```javascript
x-data="..."
@private-content-loaded.window="checkCartShouldUpdate($event.detail.data)"
@storage.window="onStorageChange($event)"
@cart-is-loading.window="isLoading = ($event.detail && $event.detail.isLoading) || false"
```

Klaviyo cart tracking enabled:
```javascript
x-data="initKlaviyoCartTracking()"
x-init="sendKlaviyoCartData()"
```

---

## Font Usage & Styling

### Google Fonts
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap" />
```

**Font Families**:
- **Playfair Display** (serif): Headings, brand elements
  - Weights: 400–900 (variable), italic support
  - Used via Tailwind `font-serif` utility
  
- **Work Sans** (sans-serif): Body text, UI elements
  - Weights: 100–900 (variable), italic support
  - Used via Tailwind `font-sans` utility

**Confirmed Usage**:
- Headings (h1, h2, h3): Playfair Display (serif)
- Body text, buttons, labels: Work Sans (sans-serif)

---

## Image CDN

**Base URL**: `https://imagely.factory-direct-flooring.co.uk/`

### Image Path Patterns

**Category Images**:
```
/media/catalog/category/resized/[SIZE]/category-[TYPE].jpg
```
Sizes: 360x360, 700x700
Types: engineered-wood, herringbone, lam, lvt, roll-vinyl, solid-wood

**Product Images**:
```
/media/catalog/product/cache/07f4e6a093cd3c305a832187014ed50b/[PATH]/[FILENAME].jpg
```
Example: `.../7/4/74154p-crystal_oak_11.jpg`

**Static/Promotional**:
```
/media/wysiwyg/ban-mm-[TYPE].jpg
```
Types: engineered-wood, herringbone, laminate

**Static Assets**:
```
/static/version1789652328/frontend/Limely/fdf-hyva/en_GB/images/[FILE]
```
Examples: logo.svg, img-empty-basket.png

**Favicon**:
```
/media/favicon/websites/1/favicon.png
```

---

## CSS Framework & Tailwind Integration

### Theme & Build Info
- **Theme**: Limely (child of Hyva)
- **Base URL**: `/static/version1789652328/frontend/Limely/fdf-hyva/en_GB/css/styles.css`
- **CSS Processor**: Tailwind CSS (Hyva's default)

### Common Utility Classes
- **Spacing**: `px-3`, `py-2.5`, `mb-4`, `mt-auto`, `gap-3`, `gap-1`
- **Layout**: `flex`, `flex-col`, `flex-row`, `flex-wrap`, `items-center`, `justify-between`, `justify-end`
- **Grid/Sizing**: `w-10`, `h-10`, `h-24`, `grow`, `full`, `w-full`
- **Typography**: `text-sm`, `text-base`, `text-xl`, `text-xs`, `font-bold`, `font-medium`, `leading-tight`
- **Borders**: `border`, `border-t`, `border-border`, `rounded-full`, `rounded-none`
- **Colors**: `bg-white`, `bg-slate-100`, `bg-slate-200`, `text-primary`, `hover:text-primary`, `hover:bg-slate-100`, `text-danger`
- **Responsive**: `hidden`, `sm:flex`, `sm:block`, `md:flex-col`, `xl:flex-row`, `xl:text-3xl`, `xs:leading-4`
- **Effects**: `shadow-lg`, `shadow-md`, `opacity-0`, `group-hover:opacity-100`, `transition`, `duration-300`, `duration-500`
- **Visibility**: `x-cloak` (Alpine.js prevent flash), `x-show`, `x-if`

### CSS Variables (if used)
- `--font-sans`: Work Sans
- `--font-serif`: Playfair Display
- Color tokens for primary, secondary, danger, border, etc.

---

## JavaScript Frameworks & Libraries

### Alpine.js
```html
<script defer src="...alpine.min.js"></script>
```
Used for:
- Filter toggles (`x-data="toggleFilter"`)
- Menu expansion (`x-data="{megamenu: false}"`)
- Quick view modals
- Wishlist interactions
- Add-to-cart form handling
- Cart state management

### Splide.js (Carousel)
```html
<link rel="stylesheet" href=".../splide/splide.min.css" />
<script src=".../splidejs/splide.min.js"></script>
```
Used for product image galleries, category carousels, etc.

### Hyva Modules
- Hyva form key injection (`window.hyva.getFormKey()`)
- Cookie management
- Custom event dispatching

### Analytics & Tracking
- **Klaviyo**: Cart tracking and email integration
- **OpenAI Integration**: Pixel tracking (oaiq.min.js)
- **Trustpilot**: Embedded reviews widget

---

## Key Discovered Product Data

### Example Product 1
- **ID**: 918260
- **Name**: Embrace Pro Laminate Flooring 14mm Crystal Oak AC5 Built-in Underlay
- **Price**: £21.98 m²
- **Category**: Laminate
- **Brand**: Embrace
- **URL**: /embrace-pro-laminate-flooring-14mm-crystal-oak-ac5-built-in-underlay
- **Images**: 
  - https://imagely.factory-direct-flooring.co.uk/media/catalog/product/cache/07f4e6a093cd3c305a832187014ed50b/7/4/74154p-crystal_oak_11.jpg
  - https://imagely.factory-direct-flooring.co.uk/media/catalog/product/cache/07f4e6a093cd3c305a832187014ed50b/7/4/74154p-crystal_oak_16.jpg

### Example Product 2 (Herringbone Laminate)
- **Name**: Embrace Herringbone Laminate Flooring Farmhouse Oak 14mm Built-in Underlay
- **URL**: /embrace-herringbone-laminate-flooring-farmhouse-oak-14mm-built-in-underlay

### Example Product 3 (Engineered Wood)
- **Name**: Abbey Audley Engineered Wood Flooring Oak 14mm x 165mm Brushed Oiled
- **URL**: /abbey-audley-engineered-wood-flooring-oak-14mm-x-165mm-brushed-oiled

---

## Contact & Social

**Phone**: +44 (0)330 100 00 15
**Email**: info@factory-direct-flooring.co.uk
**Address**: 1 Finch Way, Hemdale Industrial Park, Nuneaton, Warwickshire CV11 6TQ

**Social Media Links** (footer):
- Facebook: https://www.facebook.com/FactoryDirectFlooring/
- Instagram: https://instagram.com/factorydirectflooring
- Trustpilot: https://uk.trustpilot.com/review/www.factory-direct-flooring.co.uk

---

## Notes for Implementation

1. **Responsive Design**: Heavy use of Tailwind breakpoints (sm, md, xl). Filters hide on mobile, show on desktop.
2. **Alpine.js State**: Multiple Alpine components with custom event dispatching. Consider Alpine 3.x+ for optimal performance.
3. **CDN Images**: All product/category images served via imagely CDN with cache-busting hash in product cache path.
4. **Per-m² Pricing**: Price display always includes unit (m²) as superscript. Critical UI feature for flooring sales context.
5. **Free Samples UX**: "Order Free Sample" button prominent on all product cards. Dispatch event: `add-sample`.
6. **Form Key**: Every form includes a hidden `form_key` input (CSRF token). Value changes per page load.
7. **Wishlist Integration**: Separate wishlist UX with heart icon button. Dispatch event: `addToWishlist(productId)`.
8. **Quick View Modal**: Product cards support quick view at `?quickview=1` URL param.
9. **Lazy Loading**: Images use `loading="lazy"` attribute. Aspect ratio locked at 5:4 for product cards.
10. **Klayivo + OpenAI**: Email marketing and AI integrations active. May require API keys in production.

