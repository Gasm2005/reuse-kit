# Database Schema

> Generated from `assets.json`. Do not edit by hand.

## Postgres schema — properties, leads pipeline, team hierarchy, RLS
🟡 adapt · `sql` · runs: server
**Preview:** Read the SQL
**Files:** `migrations/ (14 files)`, `supabase-schema.sql`, `supabase-storage-policies.sql`
14 sequenced migrations: initial schema, multi-image and video support, storage policies, admin RLS, visits and rent, indexes, numeric prices, property images and attributes, team roles, TEAM HIERARCHY WITH ROW SCOPING (a manager sees their reports' leads, an agent sees only their own), a lead pipeline with stages, and import-ready lead columns.
**Adapting it:** The team-hierarchy-and-scoping migration is the standout — row-level scoping by reporting line is genuinely hard to write and applies to any CRM. `migrations/` is authoritative; the loose supabase-*.sql files at the root are earlier drafts kept for reference.
**Tags:** schema, migration, rls, properties, leads, pipeline, team, hierarchy, roles, scoping, storage, indexes
