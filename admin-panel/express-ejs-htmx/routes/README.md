# Routes

> Generated from `assets.json`. Do not edit by hand.

## Admin routes + access gate
🟡 adapt · `commonjs` · runs: server
**Preview:** Not deployed — run it: npm i && npm start, then http://localhost:3000 — /admin
**Files:** `admin.js`, `admin-content.js`, `gate.js`

**Depends on:** `express`
1,750 lines wiring the whole admin: every page, every htmx fragment endpoint, and the gate that enforces both authentication and plan entitlement.
**Adapting it:** The gate pattern (auth AND plan in one place) is the reusable part.
**Tags:** admin, routes, express, gate, authorization, plan-gating
