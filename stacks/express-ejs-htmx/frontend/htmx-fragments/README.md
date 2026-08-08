# Htmx Fragments

> Generated from `assets.json`. Do not edit by hand.

## htmx fragments — the interactivity layer
🔵 reference · `ejs` · runs: server
**Preview:** Not deployed — run it: npm i && npm start, then http://localhost:3000 — open the cart drawer, type in search
**Files:** `cart-drawer.ejs`, `cart-badges.ejs`, `cart-page.ejs`, `checkout-step.ejs`, `checkout-aside.ejs`, `checkout-pay.ejs`, `quick-view.ejs`, `search-suggest.ejs`, `pincode-result.ejs`, `size-chart.ejs`, `wishlist-button.ejs`, `review-form.ejs`, `review-media-list.ejs`, `returns-lookup.ejs`, `grid-items.ejs`, `home-section.ejs`, `newsletter-result.ejs`, `deliverability.ejs`

**Depends on:** `ejs`, `htmx`
Every interaction that a React app would use client state for, done as a server-rendered fragment swapped in by htmx: cart drawer, cart badge, checkout steps, quick view, search suggestions, pincode check, size chart, wishlist toggle, review form with media, returns lookup, infinite grid, newsletter.
**Adapting it:** The fragments themselves are stack-bound, but the PATTERN is the lesson: no client state, no hydration, no bundle — the server returns HTML and htmx swaps it. Study this before reaching for React on a content or commerce site.
**Tags:** htmx, fragments, cart-drawer, quick-view, search-suggest, live-search, partial-render, no-spa, progressive-enhancement
