# Source: ethnic-luxe-template (Ecommerce Template)

**Stack:** Node + Express + EJS + htmx, JSON file store (no database).
**Deps:** express, ejs, cookie-parser, multer, sharp, ffmpeg-static, nodemailer — that is all.
**Harvested:** 2026-08-08 from `C:\Users\Harshit\Desktop\Ecommerce Templeate`
**Upstream:** https://github.com/Gasm2005/Ecommerce

A resellable D2C storefront + admin, built to be sold many times: licence keys, plan gating,
per-client provisioning, and a theme contract. 11,200 lines of backend across 47 modules, ~100 EJS
views, and an admin panel that is more complete than most SaaS dashboards.

## ⚖️ Licence — read this before shipping any of it

**The source repo has no LICENSE file.** That means no permission is granted in writing to copy,
modify or redistribute it. For a private reference library this is a practical non-issue; before any
of this goes into work you deliver to a paying client, confirm you own the code or are licensed for
it. This kit records where every file came from precisely so that question stays answerable.

## 🔒 Deliberately NOT copied — sensitive

| Excluded | Why |
|---|---|
| `.license-keys/private.pem` | The **Ed25519 licence signing key**. Whoever holds it can mint licences for any store on any plan. It must never leave the machine that issues them. Generate your own keypair. |
| `.license-keys/issued.json` | Record of issued licences. |
| `clients/raja-data/` | A real client's **live store data** — customers, orders, their own secrets. |
| `clients/raja-wholesale.config.json` | A real client's configuration. |
| `config/site.config.json` | Contains a real business's **GSTIN, PAN, bank account number and UPI ID**. The config *shape* is documented in `provision.js`, which is included. |
| `data/`, `backups/`, `node_modules/` | Runtime state, not source. |

Only source code was taken.

## What makes this worth keeping

The comments explain *why*, with real domain reasoning, and that is most of the value. Some examples
worth reading even if you never use the code:

- **`invoice.js`** — prices are GST-inclusive, so tax is *extracted* (`taxable = total / (1 + rate)`),
  never added on top. Same state → CGST + SGST at half rate each; different state → IGST at full
  rate; never both. One strictly sequential invoice series, because a gap has to be explainable.
- **`gstin.js`** — validates format *and* checksum, because a wrong GSTIN flows into GSTR-1, the
  buyer's input credit never appears, and someone loses a week on the phone.
- **`gst-return.js`** — GSTR-1 working papers pre-summarised into the portal's own tables (B2CS,
  B2CL, HSN, DOCS). A CA filing for a D2C store does not want a list of orders.
- **`pincode.js`** — three layers so a checkout field never spins: growing local cache → India Post's
  free API → a built-in prefix table, so the state is answerable offline even with no network.
- **`cod.js`** — COD is three separate switches, because "offer COD", "full COD" and "partial
  advance" are three different risk decisions. Full COD carries the whole RTO risk.
- **`delivery.js`** — priced by zone, because a boutique in Lucknow can hand-deliver locally the same
  afternoon for free, and paying a courier ₹199 to take three days would be worse for everyone.
- **`variants.js`** — one stock number per product is honest for made-to-order, and wrong for retail:
  a kurti with stock 12 is not twelve XL.
- **`returns.js`** — only a refund actually *marked* here moves money in the P&L, so the dashboard
  shows what was paid back, not what was asked for.
- **`hx.js`** — 33 lines. HTTP headers must be ASCII, so an htmx toast saying "Refunded ₹50,000"
  crashes `res.setHeader` and kills the whole request. Any rupee-denominated htmx app hits this.
- **`store.js`** — states its own limit plainly: single process only, and `server.js` refuses to boot
  under pm2 cluster mode rather than silently lose an order to two workers with stale caches.
- **`auth.js`** — scrypt + HMAC-signed cookie, zero npm dependencies, stateless sessions. No
  passport, no express-session, no Redis — which is what makes many small stores on one box viable.
- **`license.js`** — Ed25519-signed licence tokens verified offline. A client can read a licence but
  cannot mint one, and cannot edit "starter" into "scale" without the signature failing.
- **`provision.js`** — exists because doing fifty launches by hand is where a shop goes live still
  named after the template, with the handover password still working, or issuing invoices under
  someone else's GSTIN.

## How it compares to the React stack in this kit

| | artspire-v2 (TanStack + Supabase) | ethnic-luxe (Express + EJS + htmx) |
|---|---|---|
| Rendering | React SSR + hydration | Server-rendered HTML, htmx swaps fragments |
| Data | Postgres + RLS | JSON files, single process |
| Interactivity | Client state | Server returns HTML; no client state, no bundle |
| Admin | Basic CRUD screens | Dense, complete, inline-editing admin |
| India/GST | none | invoicing, GSTIN, GSTR-1, pincode, COD, zones |
| Emails | 1 template | 9 templates |
| Multi-tenant | none | licence keys, plans, provisioning, themes |
| Tests | 51 (vitest) | `test/` dir, node:test |

They are complements, not competitors. The React stack is the better answer when a project needs a
rich client-side UI; this one is the better answer for a commerce site that should be fast, cheap to
host, and boring to operate — and it is far ahead on Indian commerce compliance.

## Best things to steal first

1. **`india-gst/`** — nobody wants to write GST invoicing twice, and it is easy to get subtly wrong.
2. **`india-logistics/`** — pincode, COD and delivery zones, ready to go.
3. **`admin-panel/express-ejs-htmx/styles-and-scripts/`** — a complete dense admin UI with **no
   component library at all**.
4. **`htmx-fragments/`** — read the pattern before reaching for React on a commerce site.
5. **`auth-and-sessions/`** — 330 lines, zero dependencies, stateless.
6. **`email-templates/`** — nine templates against the React stack's one.
7. **`hx.js`** — thirty-three lines that prevent a bug that looks like a server crash.
