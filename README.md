# Reuse Kit

Reusable assets harvested from shipped websites, organised by tech stack, then frontend/backend, then capability. Files are copied VERBATIM from the source project — never rewritten — so battle-tested code (and its comments and tests) survives intact.

> **Generated file — do not edit by hand.** Edit `assets.json`, then run `node scripts/build-index.mjs`.

**27 assets** · updated 2026-08-08

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

## Stacks

### TanStack Start + Vite + React 19 + Tailwind 4 + Supabase

`stacks/tanstack-start-supabase/` · deployed on Vercel (Nitro preset) · from artspire-v2

> ⚠️ This is NOT plain Vite + React Router. Anything marked framework 'tanstack-start' will not drop into a plain React app without rewriting the server boundary.

## Frontend

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

## Backend

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

## Config

| Asset | Preview | Category | Framework | Reuse | Tests | Tags |
|---|---|---|---|---|---|---|
| [Config presets (prettier, tsconfig, eslint, vitest, shadcn)](stacks/tanstack-start-supabase/config) | — | `config` | agnostic | 🟢 as-is | — | config, prettier, tsconfig, eslint |
