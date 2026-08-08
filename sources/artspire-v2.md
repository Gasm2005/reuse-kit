# Source: artspire-v2

**Stack:** TanStack Start + Vite + React 19 + Tailwind 4 + Supabase, deployed on Vercel (Nitro).
**Live:** https://artspire-v2.vercel.app
**Harvested:** 2026-08-08

An e-commerce + portfolio site for a handmade-art studio. Shop, cart, checkout with a payment
gateway, commission enquiry forms, blog, admin panel, media library, and a CMS layer for
client-editable content.

## What was taken — and what was left behind

Assets were selected by asking one question of each file: *would I want this again on a different
project, or is it only meaningful here?*

**Taken (27 assets).** See `../README.md` for the full table.

**Deliberately left out:**

| Not taken | Why |
|---|---|
| `vite.config.ts` | Depends on `@lovable.dev/vite-tanstack-config`, a proprietary wrapper that pre-includes plugins. Also carries tslib workarounds specific to Nitro's Vercel preset. Only the Sentry sourcemap block is worth lifting. |
| `src/integrations/supabase/types.ts` | 2,750 generated lines. Regenerate per project with `supabase gen types`. |
| `Header.tsx`, `Footer.tsx`, `NavDrawer.tsx`, `WhatsAppBar.tsx` | **Dead code** — imported by zero files. `SiteChrome` replaced them and they were never deleted. Unused code is not reusable code. |
| `ProductForm.tsx` (664 lines), `ArtworkForm.tsx` (664), `SimplifiedArtworkForm.tsx` (353) | Bound tightly to one schema. |
| `products.ts`, `cart.ts`, `orders.ts`, `leads.ts`, `artworks.ts`, `collections.ts` etc. | Domain data-access. The CRUD shape is worth reading in place; the files are not worth copying. |
| `public/theartspire.css` (~2,300 lines) | One brand's stylesheet. The genuinely portable parts were extracted into `animation-and-scroll/` and `gallery-and-carousel/`. |
| `lovable-error-reporting.ts` | Platform vendor code. |

## Things worth knowing before reusing any of it

- **There is no separate Gallery or Carousel component.** The gallery was written inline in the
  product and artwork route files; the mobile carousel is pure CSS scroll-snap. That is why
  `gallery-and-carousel/` holds two whole route files marked `.reference.tsx` — they are the only
  copies that exist.
- **Tailwind v4.** No `tailwind.config.ts`; config lives in an `@theme` block in `src/styles.css`.
- **shadcn/ui is barely used** — four components. Most UI is hand-written CSS.
- **shadcn's default theme system is not set up** — no `--background`/`--foreground` HSL tokens, no
  dark mode. Custom brand tokens instead.
- **No Supabase edge functions.**

## Incidents that shaped this code

Several assets carry long comments explaining why they are shaped the way they are. Keep those
comments when copying — they are the reason the code is worth more than a fresh rewrite.

- A commission form **silently saved nothing for over 3 hours** in production: the UI sent a display
  label (`"₹2,500–5,000"`) into a column with a CHECK constraint that only allowed codes. Postgres
  returned 23514; the HTTP response was 200. → `forms-and-validation`
- A **paid order was permanently locked out of its own page** because checkout validated that the
  phone field was non-empty but not that it was well-formed. One stray keystroke produced an
  11-digit number nobody could ever retype. → `forms-and-validation`
- **Two public pages were down for every customer** because `const rpc = admin.rpc` detached the
  method from the Supabase client. supabase-js reads `this.rest` internally, so every call threw —
  and because the rate limiter fails open, nothing looked wrong. The UI reported the crash as
  "we couldn't find an order matching that phone number", blaming the customer for correct details.
  → `rate-limiting`, `api-security`
- **Order confirmation emails never arrived**: the send was fire-and-forget, and Vercel freezes a
  serverless function the moment it responds, discarding the pending request. The same function was
  also exposed as a public POST endpoint — an open relay for mail from the site's own domain.
  → `email`
- **Content vanished when hydration failed**, because the reveal animation hid everything by default
  and relied on JS to show it. → `animation-and-scroll`
- **A service card disappeared on tap**: React re-rendered and wiped an imperatively-added
  className. → `header-navbar` (the `data-rv` marker)
- **A confirmation card rendered invisible and off-screen**: it mounted after the observer's first
  pass, and `window.scrollTo` did nothing because Lenis overrides it.
  → `animation-and-scroll` (MutationObserver + `smooth-scroll.ts`)
