# Api Security

> Generated from `assets.json`. Do not edit by hand.

## Verified public access to private records
🟡 adapt · `tanstack-start` · runs: server
**Preview:** Backend/security asset — nothing to look at, read the code
**Files:** `orders-access.server.ts`, `20260717_close_order_pii_exposure.sql`

**Depends on:** `@supabase/supabase-js`
Removes public SELECT entirely, then serves the record through a server function that only returns data after the caller proves ownership (phone match), with rate limiting on top because record numbers are enumerable.
**Adapting it:** Swap orders for your table. Two rules worth keeping: a leaked or guessed record URL alone must never be enough, and a lookup that CRASHED must never be reported to the user as 'no match' — that hides outages and blames the customer for correct details.
**Tags:** security, pii, rls, order-lookup, guest-access, privacy
