# Seo And Meta

> Generated from `assets.json`. Do not edit by hand.

## SEO metadata, JSON-LD builders, DB-driven redirects
🟡 adapt · `agnostic` · runs: both · ✅ 4 tests
**See it running:** [view-source:https://artspire-v2.vercel.app/](view-source:https://artspire-v2.vercel.app/) — View source: canonical, og tags, JSON-LD
**Files:** `seo.ts`, `site.ts`, `site.test.ts`, `redirects.ts`
buildOrganizationStructuredData / buildBreadcrumbStructuredData / buildArtworkStructuredData JSON-LD builders, absoluteUrl + SITE_URL canonical helpers, and findRedirect for DB-driven 301s.
**Adapting it:** SITE_URL, BRAND and OG_IMAGE are Artspire's. Canonicals must be built from a configured SITE_URL, never window.location.origin.
**Tags:** seo, json-ld, structured-data, canonical, redirect, sitemap, og

---

## Sitemap + robots.txt generator
🟡 adapt · `agnostic` · runs: server
**See it running:** [https://artspire-v2.vercel.app/sitemap.xml](https://artspire-v2.vercel.app/sitemap.xml) — The generated output; also /robots.txt
**Files:** `post-build-sitemap-robots.mjs`
Post-build script that writes sitemap.xml (static routes plus DB-driven product, category and blog URLs with priorities and changefreq) and robots.txt from SITE_URL. Never emits admin, cart, checkout or order pages.
**Adapting it:** Replace the static route list and the DB queries. Run it from your build script.
**Why it exists:** It once emitted /categories/<slug> URLs for a route that did not exist, and listed categories with zero published products — both silently, for months.
**Tags:** seo, sitemap, robots, post-build, crawl, indexing

---

## Canonical tags + canonical host redirect
🔵 reference · `tanstack-start` · runs: both
**See it running:** [view-source:https://artspire-v2.vercel.app/](view-source:https://artspire-v2.vercel.app/) — View source, look for rel=canonical and og:url
**Files:** `root-canonical-tags.reference.tsx`, `server-canonical-host.reference.ts`
Per-page self-canonical and og:url built from a configured SITE_URL with query strings dropped, plus a server-side canonical host redirect behind an env flag that never fires on localhost.
**Adapting it:** Read, do not copy — these are the app root and the server entry. Two rules to carry over: build canonicals from a configured SITE_URL and never from window.location.origin; and set 301 explicitly, because the framework default is 307.
**Tags:** seo, canonical, og, duplicate-content, redirect, www, 301

---

## AEO — FAQPage structured data
🟡 adapt · `react` · runs: both
**See it running:** [https://artspire-v2.vercel.app/faq](https://artspire-v2.vercel.app/faq) — View source for the ld+json block
**Files:** `faq-page-jsonld.reference.tsx`, `faqs.ts`
A FAQ page that emits FAQPage structured data (mainEntity / Question / acceptedAnswer) so search engines can show rich results and answer engines can quote the answers directly.
**Adapting it:** Replace the questions, keep the shape. Together with Organization and BreadcrumbList from seo.ts this is the whole AEO surface — there is nothing else to it.
**Tags:** aeo, faq, json-ld, structured-data, rich-results, answer-engine, llm
