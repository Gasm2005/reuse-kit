# Shell And Auth

> Generated from `assets.json`. Do not edit by hand.

## Admin shell, login, invite acceptance
🟡 adapt · `nextjs` · runs: both
**See it running:** [https://beigestates.vercel.app/admin/login](https://beigestates.vercel.app/admin/login) — Login screen
**Files:** `admin-protected-layout.tsx`, `admin-login-page.tsx`, `accept-invite-page.tsx`, `LogoutButton.tsx`, `Credentials.tsx`

**Depends on:** `@supabase/ssr`
Auth gating done with an App Router route group — (protected)/layout.tsx checks the session server-side and redirects before any child renders, so there is no flash of admin UI and no client-side guard to get wrong. Plus login and an invite-acceptance flow where a new team member sets their own password.
**Adapting it:** Server-side gating in a layout is the cleanest of the three admin approaches in this kit — the React stack does it client-side with a hook and had a blank-page bug because of it.
**Tags:** admin, auth, login, route-group, protected, invite, onboarding, logout
