# Instructions for Claude

This repo exists so that work already done once is never rebuilt from scratch. When the user hands you this repo alongside a new requirement, **your job is to find and reuse, not to write fresh code.**

## Search order — follow this, don't skip to grep

1. **Read `assets.json` first.** It is the machine-readable manifest and the only source of truth. Every asset carries `tags`, `summary`, `framework`, `runtime`, `deps`, `reuse` and `adapt`. Match the requirement against `tags` and `summary` before opening any file.
2. **Filter by `framework` against the target project.** This is the step that gets skipped and causes wasted work:
   - `agnostic` / `css` / `sql` → drops into anything.
   - `react` → any React project.
   - `tanstack-start` → uses `createServerFn` / `createFileRoute` / TanStack middleware. **Will not run in a plain React or Next.js app without rewriting the server boundary.** Say so up front rather than discovering it halfway through.
3. **Read the asset's own `README.md`** (generated, sits in each category folder) for the adapt notes.
4. **Then open the source files.** They carry long comments explaining *why* the code is shaped that way — usually because of a specific production bug. Keep those comments when you copy. They are the most valuable part.

## Rules

- **Copy verbatim, then adapt.** Do not "improve" or rewrite an asset on the way in. If it looks over-complicated, read the comments — the complexity is almost always load-bearing. Change table names, bucket names, brand values, copy. Leave the logic.
- **Bring the tests.** If `tested: true`, copy the `.test.ts` too. Those tests encode real incidents; an asset without them is a downgrade.
- **Respect `reuse: "reference"`.** Those are patterns, not drop-ins. Read them, then write the version this project needs. Copying them wholesale imports another project's assumptions.
- **Check `deps` before promising it works.** Some assets need a package (`browser-image-compression`, `sonner`, `@radix-ui/react-dialog`) or a DB table (`media_library`, `rate_limits`, `profiles`).
- **Never copy secrets or generated types.** `types.ts` is regenerated per project with `supabase gen types`. Environment variables are named in the adapt notes; the values are not here and must not be.
- **Tell the user what you took and what you changed.** A one-line list per asset. If you rejected an asset, say why.

## Adding to this repo

When harvesting from a new project:

1. Copy files into `stacks/<stack-id>/{frontend,backend}/<category>/` — verbatim, with comments and tests.
2. Add an entry to `assets.json`. Fill in `tags` generously; that field is what makes an asset findable later. Write `adapt` as instructions to your future self, and `whyItMatters` when the code exists because something broke.
3. Run `node scripts/build-index.mjs` to regenerate `README.md` and the category READMEs. **Never hand-edit those** — they are overwritten.
4. New stack? Add it to `stacks[]` with an honest `caveat` about portability.

## What is deliberately NOT here

- `vite.config.ts` — depends on a proprietary `@lovable.dev` wrapper and carries tslib workarounds specific to that deployment.
- `src/integrations/supabase/types.ts` — 2,750 generated lines, per-project.
- Dead components from the source project (`Header.tsx`, `Footer.tsx`, `NavDrawer.tsx`, `WhatsAppBar.tsx` in artspire-v2 are imported by zero files). Unused code is not reusable code.
- Domain data-access layers (`products.ts`, `cart.ts`, `orders.ts`, forms bound to one schema). The CRUD shape is worth reading; the files are not worth copying.
