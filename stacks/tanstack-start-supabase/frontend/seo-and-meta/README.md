# Seo And Meta

> Generated from `assets.json`. Do not edit by hand.

## SEO metadata, JSON-LD builders, DB-driven redirects
🟡 adapt · `agnostic` · runs: both · ✅ 4 tests
**See it running:** [view-source:https://artspire-v2.vercel.app/](view-source:https://artspire-v2.vercel.app/) — View source: canonical, og tags, JSON-LD
**Files:** `seo.ts`, `site.ts`, `site.test.ts`, `redirects.ts`
buildOrganizationStructuredData / buildBreadcrumbStructuredData / buildArtworkStructuredData JSON-LD builders, absoluteUrl + SITE_URL canonical helpers, and findRedirect for DB-driven 301s.
**Adapting it:** SITE_URL, BRAND and OG_IMAGE are Artspire's. Canonicals must be built from a configured SITE_URL, never window.location.origin.
**Tags:** seo, json-ld, structured-data, canonical, redirect, sitemap, og
