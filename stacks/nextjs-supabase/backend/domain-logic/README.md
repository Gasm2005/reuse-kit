# Domain Logic

> Generated from `assets.json`. Do not edit by hand.

## Domain logic — pricing, slugs, schema validation, typed models
🟡 adapt · `agnostic` · runs: both
**See it running:** [https://beigestates.vercel.app/listings](https://beigestates.vercel.app/listings) — Prices shown in lakh/crore
**Files:** `price.ts`, `properties.ts`, `property-schema.ts`, `slug.ts`, `types.ts`, `sample-data.ts`
Indian price formatting (lakh/crore, not thousands/millions), slug generation, a validation schema for the property shape, shared types, and 731 lines of realistic sample data for developing without a database.
**Adapting it:** price.ts is as-is reusable for any Indian-market app — ₹1,25,00,000 rendered as "1.25 Cr" is not something Intl gives you for free. The rest is domain-shaped.
**Tags:** pricing, lakh, crore, formatting, slug, validation, schema, types, seed-data, india
