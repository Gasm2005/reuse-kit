# Domain Logic

> Generated from `assets.json`. Do not edit by hand.

## Indian courier shipping calculator
🟡 adapt · `agnostic` · runs: both · ✅ 19 tests
**See it running:** [https://artspire-v2.vercel.app/checkout](https://artspire-v2.vercel.app/checkout) — Add an item, shipping is calculated live
**Files:** `shipping.ts`, `shipping.test.ts`
Volumetric weight (L x B x H / 5000), chargeable weight = max(actual, volumetric), slab-based rates, and text parsers for free-form weight/dimension fields.
**Adapting it:** The RATES ARE PLACEHOLDERS — replace with a real courier rate card before charging anyone. The formula and slab structure are correct and standard for Indian couriers.
**Why it exists:** Written as ONE source of truth shared by cart, checkout and the server-side amount re-verification, because three separate shipping calculations had already drifted apart.
**Tags:** shipping, courier, volumetric, weight, india, ecommerce, checkout
