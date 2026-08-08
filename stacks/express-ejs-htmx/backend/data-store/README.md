# Data Store

> Generated from `assets.json`. Do not edit by hand.

## Atomic JSON file store with backups
🟡 adapt · `commonjs` · runs: server
**Preview:** No UI — read the module
**Files:** `store.js`, `zip.js`, `backup.js`
A whole app's persistence with no database: reads cached in production and re-read in dev, writes atomic-ish (temp file + rename) with a timestamped backup taken first, so any admin action is recoverable from data/backups/. DATA_DIR is overridable, which is how one codebase serves a directory per tenant.
**Adapting it:** READ THE HEADER COMMENT BEFORE USING. It is single-process only — read → mutate → write is synchronous so two requests in one process cannot interleave, but the cache is per-process, so pm2 cluster mode means two workers writing from stale copies and silently losing an order. server.js refuses to boot in that situation rather than let it happen quietly. Fine for a small store; move to Postgres before you need more than one process.
**Tags:** database, json, store, persistence, atomic-write, backup, no-db, single-process
