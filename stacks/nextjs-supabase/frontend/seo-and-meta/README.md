# Seo And Meta

> Generated from `assets.json`. Do not edit by hand.

## Next.js SEO — robots, sitemap, site config
🟢 as-is · `nextjs` · runs: server
**See it running:** [https://beigestates.vercel.app/sitemap.xml](https://beigestates.vercel.app/sitemap.xml) — Also /robots.txt
**Files:** `robots.ts`, `sitemap.ts`, `site.ts`

**Depends on:** `next`
Next's native file-based robots.ts and sitemap.ts (typed, generated at build, no post-build script needed) plus a site config where SITE_URL comes from env with a fallback.
**Adapting it:** Change the URLs. Compare with the React stack, which needs a 332-line post-build script to do the same job — this is the cleaner approach when you are on Next.
**Tags:** seo, robots, sitemap, metadata, canonical, nextjs
