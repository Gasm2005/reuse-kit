# Auth And Roles

> Generated from `assets.json`. Do not edit by hand.

## Supabase auth + role-based admin
🟢 as-is · `tanstack-start` · runs: both
**Preview:** Backend/security asset — nothing to look at, read the code
**Files:** `client.ts`, `admin.server.ts`, `auth-attacher.ts`, `admin.ts`, `useAdmin.ts`, `20260721_prevent_profile_role_escalation.sql`

**Depends on:** `@supabase/supabase-js`
The complete pattern: browser client, service_role client behind a .server.ts boundary, useAdmin hook, profile/role helpers, and a migration that stops a user escalating their own role.
**Adapting it:** client.ts and admin.server.ts are as-is. auth-attacher.ts is TanStack middleware — rewrite for other frameworks. The role-escalation migration should go into EVERY project with a roles column.
**Why it exists:** The service_role key must never reach the browser. The .server.ts suffix plus a server-function boundary is what enforces that; anything VITE_-prefixed is compiled into the client bundle.
**Tags:** auth, supabase, rls, roles, admin, service-role, security
