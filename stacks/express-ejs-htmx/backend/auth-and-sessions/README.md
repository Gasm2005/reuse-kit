# Auth And Sessions

> Generated from `assets.json`. Do not edit by hand.

## Dependency-free admin auth (scrypt + signed cookie)
🟢 as-is · `commonjs` · runs: server
**Preview:** Not deployed — run it: npm i && npm start, then http://localhost:3000 — /admin/login shows first-run setup
**Files:** `auth.js`, `secrets.js`
330 lines, zero npm dependencies: scrypt for password hashing and an HMAC-signed cookie for the session, both from node:crypto. Sessions are stateless, so a restart logs nobody out and there is no session store to run. First boot with no users shows a one-time owner-setup form.
**Adapting it:** Bring your own user storage. Nothing else to change.
**Why it exists:** No passport, no express-session, no Redis — which is what makes it viable to run many small stores on one box.
**Tags:** auth, login, session, scrypt, hmac, cookie, stateless, no-dependencies, security
