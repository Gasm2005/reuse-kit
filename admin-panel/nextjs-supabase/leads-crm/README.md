# Leads Crm

> Generated from `assets.json`. Do not edit by hand.

## Leads CRM — list, detail, manual add, CSV import
🟡 adapt · `nextjs` · runs: browser
**Preview:** Behind admin login
**Files:** `leads-list-page.tsx`, `lead-detail-page.tsx`, `LeadsManager.tsx`, `LeadDetail.tsx`, `AddLeadForm.tsx`

**Depends on:** `@supabase/ssr`
687 lines of working CRM: lead list with filters, a detail view with stage transitions, assignment, notes and activity history, and manual add — scoped by the team hierarchy so an agent sees only their own leads.
**Adapting it:** Pairs with the team-hierarchy migration; that scoping is what makes this more than a table.
**Tags:** admin, crm, leads, pipeline, stages, assignment, notes, activity, csv-import
