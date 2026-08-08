# Shell And Auth

> Generated from `assets.json`. Do not edit by hand.

## Admin shell + route guard + login
🟡 adapt · `tanstack-start` · runs: browser
**See it running:** [https://artspire-v2.vercel.app/admin/login](https://artspire-v2.vercel.app/admin/login) — Login screen — the panel itself needs credentials
**Files:** `admin-route-guard.tsx`, `login.tsx`, `index.tsx`, `AdminSidebar.tsx`, `AdminHeader.tsx`, `AdminMobileNav.tsx`

**Depends on:** `@supabase/supabase-js`
The admin layout (sidebar, header, mobile nav), the login page, a dashboard, and the route guard that gates every /admin page on useAdmin().
**Adapting it:** Rewrite the nav links. Keep the guard logic: it renders a VISIBLE redirecting state rather than a bare null, so a failed redirect shows the operator an explanation instead of a blank screen.
**Why it exists:** The blank-admin-page bug came from reading the pathname non-reactively — the guard re-rendered but never saw the route change. Read the comments in admin-route-guard.tsx before changing it.
**Tags:** admin, auth, guard, login, sidebar, layout, dashboard, rbac
