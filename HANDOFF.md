# Handoff: Factory Direct Flooring Mock → Navigator Integration

**Date**: 2026-09-22
**Prepared for**: Navigator (website-avatar) integration
**Status**: Live and demo-ready

---

## 1. What this is

A pixel-close, fully functional static clone of factory-direct-flooring.co.uk, built so Navigator can be dropped in and demoed against a real-feeling storefront without needing access to the real Magento backend. Every page is captured from the live site (not invented), with a lightweight JS data/cart layer bolted on top so Navigator has something real to query and act on.

## 2. Where it lives

| What | Where |
|---|---|
| **Live demo URL** | https://factory-flooring-direct-puce.vercel.app |
| **GitHub repo** | https://github.com/jacobpoddigital/factory-flooring-direct |
| **Vercel project** | `ad-velocity-97abc273/factory-flooring-direct` |
| **Local dev** | `node server.js` → http://localhost:8080 |

**Auto-deploy is live**: any push to `main` on GitHub triggers a new Vercel production deployment automatically. No manual deploy step needed going forward — just commit and push.

## 3. Architecture

Static HTML/CSS/vanilla JS. No framework, no build step, no server-side rendering in production (Vercel serves it as pure static files — `server.js` is only for local dev and isn't used in the deployed version).

```
index.html                  → homepage (captured from live site)
product.html                → single template, renders any product via ?slug=xxx
cart.html                   → cart page (captured, wired to localStorage)
categories/*.html           → 6 category pages (captured from live site):
                               solid-wood, engineered-wood, laminate,
                               vinyl, lvt, herringbone
about.html, advice.html     → captured static pages

data/
  products.json              → 67 real products (id, name, url/slug, price, image, category)
  product-specs.json         → technical specs + suitability flags (only 3 products fully populated — see gaps below)
  accessories.json           → 14 accessory products (underlay, trims, adhesives, tools, maintenance)
  product-compatibility.json → category→accessory compatibility matrix + 5 scenario bundles + cross-sell rules

js/
  cart.js                    → window.cart API, localStorage-backed
  products-data.js           → window.ProductsDB API, loads all 4 data files and exposes query methods
```

Key implementation detail worth knowing: **product pages are identified by `?slug=` query param, read client-side** — there is no server-side routing. This matters because it's why the site deploys cleanly as 100% static (Vercel serves `/product.html` regardless of query string; the JS in the page reads `location.search` itself).

## 4. The Navigator-facing API

This is what Navigator should call. It's already loaded on every page via `<script src="/js/cart.js">` and `<script src="/js/products-data.js">`.

```javascript
// Initialize (idempotent, safe to call repeatedly)
await window.ProductsDB.load()

// Product queries
window.ProductsDB.getProduct(idOrSlug)              // works with either DB id or URL slug
window.ProductsDB.getProductsByCategory(category)   // 'Solid Wood' | 'Engineered Wood' | 'Laminate' | 'Vinyl' | 'LVT' | 'Herringbone'
window.ProductsDB.getProductSpecs(productId)        // suitability flags, wear rating, warranty, etc. (sparse — see gaps)

// Accessories / cross-sell
window.ProductsDB.getAccessoriesForCategory(category)
window.ProductsDB.getAccessory(accessoryId)
window.ProductsDB.getCrossSellAccessories(productId)
window.ProductsDB.getScenarioBundle(scenarioKey)    // e.g. 'kitchen_heavy_use', 'underfloor_heating'
window.ProductsDB.getAllScenarios()

// Cart
window.cart.add({id, name, price, image, quantity})
window.cart.get()                                   // {items[], total, itemCount}
window.cart.updateQuantity(id, qty)
window.cart.remove(id)

// Events
window.addEventListener('cart-updated', (e) => { /* e.detail = cart state */ })
window.addEventListener('fdf:product-ready', (e) => { /* e.detail = resolved product, fires once product.html finishes rendering */ })
window.addEventListener('fdf:product-not-found', (e) => { /* e.detail.requestedId = the id/slug that didn't match anything */ })
```

**On `product.html` specifically**: this page is a single template shared by all 68 products via `?slug=` or `?id=`. It was originally captured from one real product on the live site, so its `<title>`, meta tags, canonical link, and JSON-LD `Product` schema all start out hardcoded to that one product on page load, before any JS runs. `renderProductPage()` overwrites every one of those surfaces once the real product resolves — if you're reading page metadata for context (title, og:title, JSON-LD, etc.), prefer waiting for the `fdf:product-ready` event or checking `window.currentProduct` over reading `document.title` at an arbitrary time, since there's an unavoidable window between page load and the async `products.json` fetch completing where the title reads as a neutral "Loading product…" placeholder rather than the real product name. If you must read synchronously, know that it will say "Loading product…" (not the real product, and not the stale captured one) during that window.
## 5. How this maps to the 11 friction points Mike scoped with the client

| # | Friction point | API to use | Status |
|---|---|---|---|
| 1 | Homepage confusion (which flooring type) | `getProductsByCategory()` | Ready |
| 2 | Natural language nav ("light oak kitchen floor") | Product names + `getProductSpecs()` | Ready |
| 3 | Category overload | `getProductsByCategory()` + suitability flags | Ready |
| 4 | Product comparison | `getProductSpecs()` | Ready — all 67 products |
| 5 | Measurements/wastage | `productSpecs.plank_width` / `thickness` | Ready |
| 6 | Suitability Q&A (kitchen/pets/underfloor/traffic) | `productSpecs.suitability{...}` | Ready |
| 7 | Accessories recommendation | `getAccessoriesForCategory()` / `getCrossSellAccessories()` | Ready |
| 8 | Samples/visualization | Real product images (hotlinked CDN) | Ready — no sample-ordering backend |
| 9 | Delivery/stock questions | `getDeliveryInfo()` / `getDeliveryFAQ()` | Ready — mock data, see gap #2 below |
| 10 | Basket reassurance | `window.cart.get()` | Ready |
| 11 | Cross-sell/upsell | `getCrossSellAccessories()` + `getScenarioBundle()` | Ready |

**Navigator embed**: `<script defer src="https://cdn.websiteavatar.co.uk/wa-agent.js?id=acct_factory-direct-flooring">` is now live on all 11 pages (homepage, product template, cart, 6 category pages, about, advice), placed immediately after `products-data.js` on each so `window.ProductsDB`/`window.cart` are guaranteed available when the bridge initializes.

## 6. Known gaps — be aware of these before the demo

1. ~~`product-specs.json` only covers 3 of 67 products~~ — **Resolved.** All 67 products now have specs, generated per-category (Solid Wood, Engineered Wood, Laminate, Vinyl, Herringbone) with suitability/wear/installation values parsed from each product's name and sensible category defaults. Worth a spot-check against a few real product pages before the client sees it, since the values are inferred, not scraped from the live site's spec tables.
2. **`data/delivery.json` is mock data, not a real backend** — friction point #9 now has something to query (`getDeliveryInfo()`, `getDeliveryFAQ()`), with category-level overrides (e.g. solid wood ships slower via pallet, herringbone notes "some designs made to order"). This is invented to be plausible, not pulled from a real stock/courier system — fine for demo purposes, just don't present it as live inventory if asked directly.
3. **Accessories are a mix of invented and real products — one confirmed gap already surfaced and was fixed.** Most of the 15 accessories are illustrative placeholders, not scraped, and shouldn't be presented as real if asked directly. One exception: `acc-015` "Underlay Supreme With Moisture Barrier EWA2" was added after Navigator correctly identified during testing that none of the original 3 underlay options were an honest match for laminate + moisture barrier — it's now the real product scraped from `factory-direct-flooring.co.uk/underlay-supreme-with-moisture-barrier-ewa2` (3mm poly cell foam, 10m²/roll, £29.56/roll). This is a good signal that **other invented accessories may have the same kind of category-mismatch the agent will catch in testing** — worth doing a pass to replace the rest with real scraped products before the client sees a similar gap live.
4. **Checkout is not functional** — cart add/remove/update all work and persist via localStorage, but there's no payment flow. The cart page has a checkout CTA that is a non-functional stub.
5. **A handful of legacy Next.js scaffolding files remain in the repo root** (`app/`, `components/`, `lib/`, `next.config.js` was removed but `pages-captured/`, `category.html`, `progress.html` are stray leftovers from earlier iterations). They're harmless (not linked from any live page) but worth a cleanup pass before this repo is handed to another team long-term.
6. **A pile of one-off debug/test scripts live in the repo root** (`debug-*.js`, `test-*.js`, `check-errors.js`, `find-404.js`, `quick-test-products.js`, `verify-product-page.js`) — these were used to diagnose the Vercel deployment issue during this session (see §7) and aren't part of the site itself. Safe to delete or move to a `/scripts` folder.
7. ~~Product page metadata (title/og/JSON-LD) didn't match the loaded product~~ — **Resolved.** `product.html` is a single template shared by all 68 products, captured from one real product on the live site — its `<title>`, meta tags, canonical link, and JSON-LD `Product` schema were baked in and only `document.title` ever got overwritten on render. Any structured-data-aware reader (og:title, JSON-LD, etc.) saw the wrong product every time, and there was a timing race where Navigator's deferred `wa-agent.js` could read state before the real product resolved at all. Full writeup of the fix and the new `fdf:product-ready`/`fdf:product-not-found` events is in §4. The bug report's example slug (`prestige-laminate-flooring-7mm-dusky-grey-oak-3532`) turned out not to exist in the mock at all — it's now product #68, added with real scraped data.

## 7. Deployment notes (for whoever maintains this next)

Two non-obvious things that cost real time getting this live, documented so they don't get re-broken:

- **Don't add a server function for query-string handling.** It's tempting to think `/product.html?slug=xxx` needs server-side routing, but it doesn't — the browser requests `/product.html` and the page's own JS reads `location.search`. An Express serverless function was built and then removed for exactly this reason; it just added failure surface (Express 5's wildcard route syntax changed to `/*splat`, runtime version strings need `.x` suffixes, etc.) for zero benefit.
- **`vercel.json` needs explicit `"outputDirectory": "."` when `"framework": null`.** Without it, Vercel's static builder produces *no* deployable output at all (silently — you only see it if you run `vercel build` locally and read the warning). Current working config:
  ```json
  {
    "framework": null,
    "buildCommand": null,
    "outputDirectory": ".",
    "cleanUrls": false,
    "trailingSlash": false
  }
  ```
- `.vercelignore` excludes `node_modules`, `pages-captured`, and `reference` from the deployment to keep it lean.
- `package.json` has `express`, `cheerio`, and `playwright` in `devDependencies` — none of them are used at runtime by the deployed site (only by local capture/debug scripts), so they don't bloat the production deployment.

## 8. Suggested next steps before the client sees this

1. ~~Backfill `product-specs.json`~~ — done, all 67 products covered.
2. ~~Decide how friction point #9 (delivery/stock) gets handled~~ — done, `data/delivery.json` + `getDeliveryInfo()`/`getDeliveryFAQ()`.
3. ~~Drop the Navigator embed script into the pages~~ — done, live on all 11 pages after `products-data.js`.
4. **Smoke-test the live embed against `window.ProductsDB`/`window.cart` once website-avatar's bridge code is actually running** — the script tag is in place and the globals are confirmed available by the time it loads, but nobody has exercised the real bridge end-to-end yet.
5. Spot-check a handful of the auto-generated `product-specs.json` entries against the real site's spec tables — the values are inferred from product names + category defaults, not scraped, so accuracy should be verified before the client relies on them in a live Q&A.
6. Optional cleanup: remove the stray Next.js/debug files noted in §6 if this repo will live long-term rather than just for the demo.

---

**Quick links**
- Live site: https://factory-flooring-direct-puce.vercel.app
- Repo: https://github.com/jacobpoddigital/factory-flooring-direct
- Local dev: `node server.js` (port 8080)
