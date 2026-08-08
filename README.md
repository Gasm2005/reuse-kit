# Reuse Kit

Reusable assets harvested from shipped websites, organised by tech stack, then frontend/backend, then capability. Files are copied VERBATIM from the source project — never rewritten — so battle-tested code (and its comments and tests) survives intact.

> **Generated file — do not edit by hand.** Edit `assets.json`, then run `node scripts/build-index.mjs`.

**67 assets** · updated 2026-08-08

## How to use this repo

Give it to Claude Code along with what you are building. Start with `CLAUDE.md` — it explains the search order. For a quick manual look, grep `assets.json` for a tag:

```bash
node -e "const a=require('./assets.json').assets; console.log(a.filter(x=>x.tags.includes('upload')).map(x=>x.path).join('\n'))"
```

## Reuse legend

- 🟢 as-is — Drop in and change a constant or two. No logic changes.
- 🟡 adapt — Logic is sound; table names, buckets or brand values need swapping.
- 🔵 reference — Do not copy wholesale. Read it for the pattern, then write the version this project needs.

## Framework legend

- `agnostic` — Pure TypeScript. Works in any JS project — React, Next, Vue, Node.
- `react` — Needs React. No router or meta-framework coupling.
- `tanstack-start` — Uses createServerFn / createFileRoute / TanStack middleware. Needs a rewrite for other frameworks.
- `sql` — Postgres / Supabase migration.
- `css` — Plain CSS. No build step required.
- `commonjs` — Plain CommonJS Node module. No framework coupling — lifts into any Node app, Express or not.
- `ejs` — EJS server-rendered template. Needs Express + EJS, and htmx for the fragments.

> **Admin panels** live in `admin-panel/<stack>/` rather than under `stacks/`, because a panel is
> reused as a whole unit — shell, auth guard and CRUD screens together — not asset by asset.

---
# TanStack Start + Vite + React 19 + Tailwind 4 + Supabase
`stacks/tanstack-start-supabase/` · Vercel (Nitro preset) · from artspire-v2 · 37 assets
> ⚠️ **Portability:** This is NOT plain Vite + React Router. Anything marked framework 'tanstack-start' will not drop into a plain React app without rewriting the server boundary.

### Admin panel

| Asset | Preview | Category | Framework | Reuse | Tests | Tags |
|---|---|---|---|---|---|---|
| [Admin shell + route guard + login](admin-panel/tanstack-start-supabase/shell-and-auth) | [👁 see it live](https://artspire-v2.vercel.app/admin/login) | `shell-and-auth` | tanstack-start | 🟡 adapt | — | admin, auth, guard, login |
| [Media manager (DAM)](admin-panel/tanstack-start-supabase/media-manager) | — | `media-manager` | tanstack-start | 🟡 adapt | — | admin, media, dam, upload |
| [SEO manager](admin-panel/tanstack-start-supabase/seo-manager) | — | `seo-manager` | tanstack-start | 🟡 adapt | — | admin, seo, meta, title |
| [Leads CRM](admin-panel/tanstack-start-supabase/crm-leads) | — | `crm-leads` | tanstack-start | 🟡 adapt | — | admin, crm, leads, enquiry |
| [Blog CMS](admin-panel/tanstack-start-supabase/blog-cms) | [👁 see it live](https://artspire-v2.vercel.app/blog) | `blog-cms` | tanstack-start | 🟢 as-is | — | admin, blog, cms, editor |
| [Website content CMS](admin-panel/tanstack-start-supabase/content-cms) | — | `content-cms` | tanstack-start | 🟡 adapt | — | admin, cms, content, editable |
| [Orders, reviews and subscribers admin](admin-panel/tanstack-start-supabase/commerce-admin) | — | `commerce-admin` | tanstack-start | 🟡 adapt | — | admin, orders, fulfilment, reviews |


### Frontend

| Asset | Preview | Category | Framework | Reuse | Tests | Tags |
|---|---|---|---|---|---|---|
| [India-first phone + email validation](stacks/tanstack-start-supabase/frontend/forms-and-validation) | [👁 see it live](https://artspire-v2.vercel.app/contact) | `forms-and-validation` | agnostic | 🟢 as-is | ✅ 16 | form, validation, phone, email |
| [Shared lead/contact form submit hook](stacks/tanstack-start-supabase/frontend/forms-and-validation) | [👁 see it live](https://artspire-v2.vercel.app/contact) | `forms-and-validation` | tanstack-start | 🟡 adapt | — | form, hook, idempotency, upload |
| [Toast wrapper + Sonner provider](stacks/tanstack-start-supabase/frontend/toast-and-feedback) | [👁 see it live](https://artspire-v2.vercel.app/shop/product/handcrafted-metallic-lamp) | `toast-and-feedback` | react | 🟢 as-is | — | toast, notification, feedback, sonner |
| [Dependency-free HTML error page](stacks/tanstack-start-supabase/frontend/toast-and-feedback) | [🎨 demo page](previews/index.html) | `toast-and-feedback` | agnostic | 🟢 as-is | — | error, 500, ssr, fallback |
| [shadcn/ui primitives (button, dialog, input, skeleton) + cn](stacks/tanstack-start-supabase/frontend/ui-primitives) | [👁 see it live](https://artspire-v2.vercel.app/track-order) | `ui-primitives` | react | 🟢 as-is | — | shadcn, button, dialog, modal |
| [ImageWithFallback](stacks/tanstack-start-supabase/frontend/images-and-media) | [👁 see it live](https://artspire-v2.vercel.app/shop) | `images-and-media` | react | 🟢 as-is | — | image, fallback, placeholder, accessibility |
| [Media library picker + multi-image uploader](stacks/tanstack-start-supabase/frontend/images-and-media) | — | `images-and-media` | react | 🟡 adapt | — | upload, media, dam, picker |
| [Product image gallery — sticky thumbs, swipe, dots](stacks/tanstack-start-supabase/frontend/gallery-and-carousel) | [👁 see it live](https://artspire-v2.vercel.app/shop/product/handcrafted-metallic-lamp) | `gallery-and-carousel` | react | 🟡 adapt | — | gallery, image, thumbnails, swipe |
| [CSS-only swipeable carousel](stacks/tanstack-start-supabase/frontend/gallery-and-carousel) | [👁 see it live](https://artspire-v2.vercel.app/) | `gallery-and-carousel` | css | 🟢 as-is | — | carousel, slider, scroll-snap, mobile |
| [Product card hover — image zoom + quick-view overlay](stacks/tanstack-start-supabase/frontend/gallery-and-carousel) | [👁 see it live](https://artspire-v2.vercel.app/shop) | `gallery-and-carousel` | css | 🟢 as-is | — | card, hover, zoom, overlay |
| [Reveal-on-scroll — safe by design](stacks/tanstack-start-supabase/frontend/animation-and-scroll) | [👁 see it live](https://artspire-v2.vercel.app/) | `animation-and-scroll` | css | 🟢 as-is | — | animation, scroll, intersection-observer, reveal |
| [Lenis-aware smooth scroll](stacks/tanstack-start-supabase/frontend/animation-and-scroll) | — | `animation-and-scroll` | agnostic | 🟢 as-is | — | scroll, lenis, smooth-scroll, anchor |
| [GTM + GA4 + Meta Pixel + Clarity, env-gated](stacks/tanstack-start-supabase/frontend/analytics-and-tracking) | — | `analytics-and-tracking` | agnostic | 🟢 as-is | — | analytics, gtm, ga4, pixel |
| [SEO metadata, JSON-LD builders, DB-driven redirects](stacks/tanstack-start-supabase/frontend/seo-and-meta) | [👁 see it live](view-source:https://artspire-v2.vercel.app/) | `seo-and-meta` | agnostic | 🟡 adapt | ✅ 4 | seo, json-ld, structured-data, canonical |
| [Legal page shell + editable website content](stacks/tanstack-start-supabase/frontend/content-pages) | [👁 see it live](https://artspire-v2.vercel.app/privacy-policy) | `content-pages` | react | 🟡 adapt | — | legal, privacy, terms, cms |
| [Tailwind 4 @theme tokens](stacks/tanstack-start-supabase/frontend/design-tokens) | [👁 see it live](https://artspire-v2.vercel.app/) | `design-tokens` | css | 🔵 reference | — | tailwind, theme, tokens, colors |
| [SiteChrome — header, nav, footer, reveal engine](stacks/tanstack-start-supabase/frontend/header-navbar) | [👁 see it live](https://artspire-v2.vercel.app/) | `header-navbar` | tanstack-start | 🔵 reference | — | header, navbar, footer, nav |
| [Sitemap + robots.txt generator](stacks/tanstack-start-supabase/frontend/seo-and-meta) | [👁 see it live](https://artspire-v2.vercel.app/sitemap.xml) | `seo-and-meta` | agnostic | 🟡 adapt | — | seo, sitemap, robots, post-build |
| [Canonical tags + canonical host redirect](stacks/tanstack-start-supabase/frontend/seo-and-meta) | [👁 see it live](view-source:https://artspire-v2.vercel.app/) | `seo-and-meta` | tanstack-start | 🔵 reference | — | seo, canonical, og, duplicate-content |
| [AEO — FAQPage structured data](stacks/tanstack-start-supabase/frontend/seo-and-meta) | [👁 see it live](https://artspire-v2.vercel.app/faq) | `seo-and-meta` | react | 🟡 adapt | — | aeo, faq, json-ld, structured-data |


### Backend

| Asset | Preview | Category | Framework | Reuse | Tests | Tags |
|---|---|---|---|---|---|---|
| [Supabase auth + role-based admin](stacks/tanstack-start-supabase/backend/auth-and-roles) | — | `auth-and-roles` | tanstack-start | 🟢 as-is | — | auth, supabase, rls, roles |
| [Reusable Postgres schemas (CMS, media, commerce, blog, CRM)](stacks/tanstack-start-supabase/backend/database-schema) | — | `database-schema` | sql | 🟡 adapt | — | schema, migration, cms, media |
| [Client-side WebP compression + resilient upload](stacks/tanstack-start-supabase/backend/file-upload-storage) | — | `file-upload-storage` | agnostic | 🟢 as-is | — | upload, image, compression, webp |
| [Payment gateway integration — security pattern](stacks/tanstack-start-supabase/backend/payments) | — | `payments` | tanstack-start | 🔵 reference | ✅ 6 | payment, razorpay, webhook, signature |
| [Transactional email via Resend](stacks/tanstack-start-supabase/backend/email) | — | `email` | agnostic | 🟡 adapt | — | email, resend, transactional, order-confirmation |
| [Serverless-safe rate limiting](stacks/tanstack-start-supabase/backend/rate-limiting) | — | `rate-limiting` | agnostic | 🟢 as-is | ✅ 6 | rate-limit, throttle, security, brute-force |
| [Sentry with PII scrubbing + serverless flush](stacks/tanstack-start-supabase/backend/error-monitoring) | — | `error-monitoring` | agnostic | 🟢 as-is | — | sentry, error, monitoring, pii |
| [Verified public access to private records](stacks/tanstack-start-supabase/backend/api-security) | — | `api-security` | tanstack-start | 🟡 adapt | — | security, pii, rls, order-lookup |
| [Indian courier shipping calculator](stacks/tanstack-start-supabase/backend/domain-logic) | [👁 see it live](https://artspire-v2.vercel.app/checkout) | `domain-logic` | agnostic | 🟡 adapt | ✅ 19 | shipping, courier, volumetric, weight |


### Config

| Asset | Preview | Category | Framework | Reuse | Tests | Tags |
|---|---|---|---|---|---|---|
| [Config presets (prettier, tsconfig, eslint, vitest, shadcn)](stacks/tanstack-start-supabase/config) | — | `config` | agnostic | 🟢 as-is | — | config, prettier, tsconfig, eslint |


---
# Node + Express + EJS + htmx, JSON file store (no database)
`stacks/express-ejs-htmx/` · Any Node host (render.yaml + pm2 ecosystem included) · from ethnic-luxe-template · 30 assets
> ⚠️ **Portability:** Server-rendered EJS with htmx fragments — there is no React here. Views are not portable to a React stack, but the backend modules are plain CommonJS with almost no framework coupling and lift cleanly into any Node app. The JSON store is SINGLE-PROCESS ONLY: under pm2 cluster mode two workers write from stale copies and silently lose orders (server.js refuses to boot in that case).
>
> ⚖️ **Licence:** The source repo carries NO LICENSE file. Fine for your own reference; before shipping any of it to a paying client, confirm you own or are licensed for this code.

### Admin panel

| Asset | Preview | Category | Framework | Reuse | Tests | Tags |
|---|---|---|---|---|---|---|
| [Admin routes + access gate](admin-panel/express-ejs-htmx/routes) | — | `routes` | commonjs | 🟡 adapt | — | admin, routes, express, gate |
| [Admin shell, login, lock screens](admin-panel/express-ejs-htmx/shell) | — | `shell` | ejs | 🟡 adapt | — | admin, shell, login, layout |
| [Admin dashboard + reports](admin-panel/express-ejs-htmx/dashboard-reports) | — | `dashboard-reports` | ejs | 🟡 adapt | — | admin, dashboard, reports, kpi |
| [Catalog admin — products, variants, stock grid, categories](admin-panel/express-ejs-htmx/catalog) | — | `catalog` | ejs | 🟡 adapt | — | admin, products, catalog, variants |
| [Orders + returns admin](admin-panel/express-ejs-htmx/orders) | — | `orders` | ejs | 🟡 adapt | — | admin, orders, fulfilment, returns |
| [Discounts, marketing audit, journal admin](admin-panel/express-ejs-htmx/marketing) | — | `marketing` | ejs | 🟡 adapt | — | admin, discounts, coupons, marketing |
| [Settings, customers, activity log, import/export admin](admin-panel/express-ejs-htmx/settings) | — | `settings` | ejs | 🟡 adapt | — | admin, settings, customers, activity-log |
| [Licence + plan admin](admin-panel/express-ejs-htmx/licensing) | — | `licensing` | ejs | 🟡 adapt | — | admin, licence, plan, upgrade |
| [Admin CSS + JS](admin-panel/express-ejs-htmx/styles-and-scripts) | — | `styles-and-scripts` | css | 🟢 as-is | — | admin, css, styles, javascript |
| [Review moderation admin](admin-panel/express-ejs-htmx/reviews) | — | `reviews` | ejs | 🟡 adapt | — | admin, reviews, moderation, ugc |


### Frontend

| Asset | Preview | Category | Framework | Reuse | Tests | Tags |
|---|---|---|---|---|---|---|
| [Storefront pages (EJS)](stacks/express-ejs-htmx/frontend/storefront-pages) | — | `storefront-pages` | ejs | 🟡 adapt | — | storefront, ejs, home, listing |
| [Layout partials — header, footer, drawer, filters, product card](stacks/express-ejs-htmx/frontend/layout-partials) | — | `layout-partials` | ejs | 🟡 adapt | — | header, navbar, footer, drawer |
| [htmx fragments — the interactivity layer](stacks/express-ejs-htmx/frontend/htmx-fragments) | — | `htmx-fragments` | ejs | 🔵 reference | — | htmx, fragments, cart-drawer, quick-view |
| [Transactional email templates](stacks/express-ejs-htmx/frontend/email-templates) | — | `email-templates` | ejs | 🟢 as-is | — | email, transactional, order-confirmation, order-status |
| [Storefront CSS + JS](stacks/express-ejs-htmx/frontend/styles-and-scripts) | — | `styles-and-scripts` | css | 🔵 reference | — | css, styles, javascript, htmx-config |


### Backend

| Asset | Preview | Category | Framework | Reuse | Tests | Tags |
|---|---|---|---|---|---|---|
| [GST tax invoices + GSTIN validation + GSTR-1 working papers](stacks/express-ejs-htmx/backend/india-gst) | — | `india-gst` | commonjs | 🟢 as-is | — | gst, gstin, invoice, tax |
| [Pincode lookup, COD rules, delivery zones](stacks/express-ejs-htmx/backend/india-logistics) | — | `india-logistics` | commonjs | 🟢 as-is | — | pincode, cod, delivery, shipping |
| [Dependency-free admin auth (scrypt + signed cookie)](stacks/express-ejs-htmx/backend/auth-and-sessions) | — | `auth-and-sessions` | commonjs | 🟢 as-is | — | auth, login, session, scrypt |
| [Atomic JSON file store with backups](stacks/express-ejs-htmx/backend/data-store) | — | `data-store` | commonjs | 🟡 adapt | — | database, json, store, persistence |
| [Commerce core — cart, orders, variants, pricing, discounts, returns](stacks/express-ejs-htmx/backend/commerce-core) | — | `commerce-core` | commonjs | 🟡 adapt | — | cart, orders, products, catalog |
| [Payment gateway adapter layer](stacks/express-ejs-htmx/backend/payments) | — | `payments` | commonjs | 🟢 as-is | — | payments, razorpay, adapter, gateway |
| [Notification adapter — SMTP / Resend / WhatsApp](stacks/express-ejs-htmx/backend/notifications) | — | `notifications` | commonjs | 🟢 as-is | — | email, smtp, resend, whatsapp |
| [Image + video compression pipeline](stacks/express-ejs-htmx/backend/media-pipeline) | — | `media-pipeline` | commonjs | 🟢 as-is | — | upload, image, video, compression |
| [Commerce analytics, UTM attribution, audience switch](stacks/express-ejs-htmx/backend/analytics) | — | `analytics` | commonjs | 🟡 adapt | — | analytics, dashboard, kpi, revenue |
| [Offline-verifiable licence keys + one-command provisioning](stacks/express-ejs-htmx/backend/licensing-saas) | — | `licensing-saas` | commonjs | 🟢 as-is | — | licensing, saas, ed25519, signing |
| [Catalog import/export](stacks/express-ejs-htmx/backend/import-export) | — | `import-export` | commonjs | 🟡 adapt | — | import, export, csv, catalog |
| [Theme contract + config-driven theming](stacks/express-ejs-htmx/backend/theming) | — | `theming` | commonjs | 🟡 adapt | — | theme, theming, white-label, config |
| [htmx response header helper](stacks/express-ejs-htmx/backend/htmx-helpers) | — | `htmx-helpers` | commonjs | 🟢 as-is | — | htmx, headers, hx-trigger, toast |
| [Reviews (with media), Google review sync, marketing, journal](stacks/express-ejs-htmx/backend/reviews-and-marketing) | — | `reviews-and-marketing` | commonjs | 🟡 adapt | — | reviews, ugc, google-reviews, marketing |
| [Server entry, health doctor, pm2 + Render deploy](stacks/express-ejs-htmx/backend/ops-and-deploy) | — | `ops-and-deploy` | commonjs | 🔵 reference | — | express, server, deploy, pm2 |

