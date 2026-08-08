# Api Routes

> Generated from `assets.json`. Do not edit by hand.

## Route handlers — leads, CSV import, team invites, visits
🟡 adapt · `nextjs` · runs: server
**Preview:** Exercised by the admin panel
**Files:** `api-leads-route.ts`, `api-leads-import-route.ts`, `api-team-invite-route.ts`, `api-team-id-route.ts`, `api-visits-route.ts`

**Depends on:** `next`, `@supabase/ssr`, `resend`
Working route handlers with authorization done properly — each verifies the caller from their own session before acting: lead create and list, bulk CSV lead import, team member invite (creates the Auth account via the admin client and emails the invite), member update/delete, and visit booking.
**Adapting it:** Renamed from Next's conventional route.ts. The invite flow is the piece worth studying: it is the one legitimate use of the service_role key, and it checks ownership first.
**Tags:** api, route-handler, rest, leads, csv-import, invite, email, authorization, server
