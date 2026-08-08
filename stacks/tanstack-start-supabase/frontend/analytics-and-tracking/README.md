# Analytics And Tracking

> Generated from `assets.json`. Do not edit by hand.

## GTM + GA4 + Meta Pixel + Clarity, env-gated
🟢 as-is · `agnostic` · runs: browser
**Preview:** Backend/security asset — nothing to look at, read the code
**Files:** `analytics.ts`
Every provider loads only when its env var is set, so nothing fires in dev. isTrackablePath excludes /admin. GA4-spec ecommerce events: view_item, add_to_cart, begin_checkout, purchase.
**Adapting it:** Set VITE_GTM_ID / VITE_GA4_ID / VITE_META_PIXEL_ID / VITE_CLARITY_ID. Watch the exact names — a VITE_GA vs VITE_GA4_ID mismatch silently sends nothing.
**Tags:** analytics, gtm, ga4, pixel, clarity, ecommerce, tracking
