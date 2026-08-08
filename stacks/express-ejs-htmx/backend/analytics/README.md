# Analytics

> Generated from `assets.json`. Do not edit by hand.

## Commerce analytics, UTM attribution, audience switch
🟡 adapt · `commonjs` · runs: server
**Preview:** Not deployed — run it: npm i && npm start, then http://localhost:3000 — /admin dashboard
**Files:** `analytics.js`, `attribution.js`, `activity.js`, `audience.js`
650 lines computing every dashboard number from orders, with the money model written down explicitly: gross = what customers were charged, minus refunds = net sales, minus extracted GST and shipping collected = revenue ex-tax. Attribution remembers first and last touch from ?utm_source / ?ref in a 30-day cookie and stores both on the order, so you can answer whether an influencer post actually sold anything. The audience switch turns one codebase into a menswear, womenswear, kidswear or combined shop via config rather than four templates.
**Adapting it:** The money model is the reusable part — copy those definitions before writing your own dashboard, they are easy to get wrong in a way nobody notices.
**Tags:** analytics, dashboard, kpi, revenue, gst, attribution, utm, cohort, audience, reporting
