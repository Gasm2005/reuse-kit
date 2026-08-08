# Team Management

> Generated from `assets.json`. Do not edit by hand.

## Team management — roster, roles, invites, hierarchy
🟢 as-is · `nextjs` · runs: browser
**Preview:** Behind admin login
**Files:** `team-page.tsx`, `TeamRoster.tsx`, `InviteTeamMemberForm.tsx`

**Depends on:** `@supabase/ssr`, `resend`
412 lines: roster with roles, reporting lines, and an invite flow that creates the Auth account server-side and emails the new member a link to set their own password.
**Adapting it:** The most reusable admin asset in the kit — every multi-user app needs invite-a-teammate, and doing it without exposing the service_role key or emailing a password is the part that takes time to get right.
**Tags:** admin, team, users, roles, rbac, invite, email, hierarchy, reporting-line, multi-user
