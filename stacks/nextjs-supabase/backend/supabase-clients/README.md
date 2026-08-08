# Supabase Clients

> Generated from `assets.json`. Do not edit by hand.

## The four Supabase clients for Next.js (@supabase/ssr)
🟢 as-is · `nextjs` · runs: both
**Preview:** No UI — read the modules
**Files:** `client.ts`, `server.ts`, `public.ts`, `admin.ts`, `middleware.ts`

**Depends on:** `@supabase/ssr`, `@supabase/supabase-js`
The whole @supabase/ssr setup in 132 lines: a browser client, a cookie-aware server client for Server Components and route handlers, an anon client for public reads, a service_role admin client, and the middleware that refreshes the session on every request.
**Adapting it:** This is the single most reusable asset in the Next.js stack — every Supabase + Next project needs exactly these four, and getting the cookie handling wrong is the usual cause of sessions that silently drop. admin.ts carries the rule in a comment: service_role bypasses RLS entirely, so never import it from a Client Component, and only call it from a route handler that has already verified the caller from their OWN session rather than anything the client claims.
**Tags:** supabase, ssr, auth, session, cookies, middleware, service-role, rls, security
