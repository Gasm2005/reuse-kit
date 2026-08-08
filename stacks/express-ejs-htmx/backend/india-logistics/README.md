# India Logistics

> Generated from `assets.json`. Do not edit by hand.

## Pincode lookup, COD rules, delivery zones
🟢 as-is · `commonjs` · runs: server
**Preview:** Not deployed — run it: npm i && npm start, then http://localhost:3000 — enter a pincode at checkout
**Files:** `pincode.js`, `cod.js`, `delivery.js`
Pincode → city + state through three layers so a checkout field never spins: a local cache that grows as customers shop, then India Post's free public API, then a built-in prefix table (the first two digits identify the postal circle, so STATE is always answerable offline). COD as three independent switches — offered at all / full COD / partial advance — because full COD carries the whole RTO risk and should be opened deliberately. Delivery priced by ZONE, so a local order can go same-day by hand for free instead of paying a courier ₹199 to take three days.
**Adapting it:** Set your own zones and COD thresholds in config. The pincode fallback table is national and stays as-is.
**Tags:** pincode, cod, delivery, shipping, zones, india, checkout, rto, serviceability
