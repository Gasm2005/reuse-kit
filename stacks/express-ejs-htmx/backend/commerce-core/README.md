# Commerce Core

> Generated from `assets.json`. Do not edit by hand.

## Commerce core — cart, orders, variants, pricing, discounts, returns
🟡 adapt · `commonjs` · runs: server
**Preview:** Not deployed — run it: npm i && npm start, then http://localhost:3000 — the whole storefront
**Files:** `cart.js`, `orders.js`, `products.js`, `catalog.js`, `variants.js`, `pricing.js`, `discounts.js`, `returns.js`, `fulfilment.js`, `shopper.js`, `swatches.js`
~2,300 lines of working storefront logic. Stock per size AND colour (a kurti with stock 12 is not twelve XL). A pricing waterfall — GST% and unit cost resolve product → category → config default — so a real per-SKU purchase cost drives margin instead of a guess. Discounts as percent / flat / free-shipping. Returns verified by order number plus the contact on the order, no account needed, and only a refund actually marked here moves money in the P&L, so the dashboard shows what was paid back rather than what was asked for.
**Adapting it:** These read and write through store.js — swap that for your data layer and the logic carries over.
**Tags:** cart, orders, products, catalog, variants, stock, pricing, discounts, returns, refunds, fulfilment, ecommerce
