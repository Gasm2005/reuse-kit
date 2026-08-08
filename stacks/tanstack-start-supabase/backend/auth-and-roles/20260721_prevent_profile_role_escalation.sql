-- ─── PREVENT PROFILE ROLE SELF-ESCALATION ─────────────────────
-- Security audit finding: the entire admin authorization model relies on
-- `profiles.role = 'admin'` (read by is_admin_user() and the admin login
-- check). The `profiles` table's own RLS was defined outside these
-- migrations (base Supabase project). If any policy lets an authenticated
-- user UPDATE their own row's `role` column, that user could self-promote
-- to 'admin' and gain full access to every admin-only table (all leads,
-- orders, and customer PII).
--
-- This migration adds a defence-in-depth guard: the `role` column may only
-- be changed by trusted server-side code (the service_role key, which
-- bypasses RLS and is used only in *.server.ts) or a database admin.
-- Regular anon/authenticated sessions can still update their profile, but
-- any attempt to change `role` is rejected.
--
-- Safe to run repeatedly (idempotent). Review before applying if your
-- `profiles` table stores the role under a different column name.

alter table public.profiles enable row level security;

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     and current_user not in ('service_role', 'supabase_admin', 'postgres') then
    raise exception 'Not authorized to change profile role';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_profile_role_escalation on public.profiles;
create trigger trg_prevent_profile_role_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_profile_role_escalation();
