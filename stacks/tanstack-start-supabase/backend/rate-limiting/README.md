# Rate Limiting

> Generated from `assets.json`. Do not edit by hand.

## Serverless-safe rate limiting
🟢 as-is · `agnostic` · runs: server · ✅ 6 tests
**Preview:** Backend/security asset — nothing to look at, read the code
**Files:** `rate-limit.ts`, `rate-limit.test.ts`, `20260721_rate_limit_order_lookups.sql`

**Depends on:** `@supabase/supabase-js`
Postgres-backed sliding window (in-memory counters do not survive across serverless invocations). Fails OPEN so a limiter outage never locks real users out.
**Adapting it:** Apply the migration, then call isWithinRateLimit(client, key, max, windowSeconds).
**Why it exists:** The tests exist because detaching client.rpc from the Supabase client (const rpc = admin.rpc) throws on every call — supabase-js reads this.rest internally. Combined with fail-open, that silently disabled rate limiting AND broke two public pages. The first test asserts the RPC actually ran, not just that the function returned.
**Tags:** rate-limit, throttle, security, brute-force, serverless, postgres
