# Gallery And Carousel

> Generated from `assets.json`. Do not edit by hand.

## Product image gallery — sticky thumbs, swipe, dots
🟡 adapt · `react` · runs: browser
**See it running:** [https://artspire-v2.vercel.app/shop/product/handcrafted-metallic-lamp](https://artspire-v2.vercel.app/shop/product/handcrafted-metallic-lamp) — Sticky thumbs + swipe the main image
**Files:** `product-gallery.reference.tsx`, `artwork-gallery.reference.tsx`, `gallery.css`
Two-column gallery: a sticky vertical thumbnail strip beside a main image, with touch swipe (40px threshold, wraps around), clickable dot indicators on mobile, 3D tilt on hover, and ImageWithFallback on every slot. No carousel library — about 50 lines of JSX and one useState.
**Adapting it:** The gallery JSX lives INSIDE the route files, which is why they are here whole as .reference.tsx — lift the <div className="gallery"> block plus the idx state and the startX ref. gallery.css is self-contained and includes its dependencies: the .frame aspect-box primitive and .tilt, both of which the gallery markup needs.
**Why it exists:** There is no separate Gallery component in the source project — it was written inline. These two files are the only copies.
**Tags:** gallery, image, thumbnails, swipe, touch, dots, carousel, pdp, lightbox

---

## CSS-only swipeable carousel
🟢 as-is · `css` · runs: browser
**See it running:** [https://artspire-v2.vercel.app/](https://artspire-v2.vercel.app/) — Narrow the window under 600px — the product row becomes swipeable
**Files:** `mobile-carousel.css`
Turns any CSS grid into a snapping, swipeable row under 600px using scroll-snap-type and negative margins for edge-to-edge bleed. Zero JavaScript, zero dependencies, native momentum scrolling, keyboard accessible.
**Adapting it:** Change the grid class names in the selector list and the breakpoint. Nothing else.
**Why it exists:** Replaces an entire carousel library. No embla, no swiper, no state, nothing to hydrate.
**Tags:** carousel, slider, scroll-snap, mobile, swipe, no-js, grid

---

## Product card hover — image zoom + quick-view overlay
🟢 as-is · `css` · runs: browser
**See it running:** [https://artspire-v2.vercel.app/shop](https://artspire-v2.vercel.app/shop) — Hover any product card
**Files:** `card-hover.css`
Scale-on-hover image zoom inside an overflow-hidden frame, plus a sliding quick-view label.
**Adapting it:** Rename .card / .imgwrap / .quick to match your markup.
**Tags:** card, hover, zoom, overlay, quick-view, product-grid
