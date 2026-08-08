-- ============================================================
-- Rental terms on properties + a site-visit booking table.
-- Run once in Supabase SQL Editor, BEFORE the sample-properties seed.
--
-- The SQL Editor wraps the whole script in one transaction, so a single
-- failing statement rolls back everything — including the alter tables.
-- That's why every create is guarded with a matching drop: re-running this
-- file is always safe.
-- ============================================================

-- ---------- 1. Rental terms ----------
-- Null on sale listings. Kept as text like the price column so "2 months
-- rent" or "₹50,000" both work — an amount isn't always a plain number.
alter table properties add column if not exists deposit text;
alter table properties add column if not exists maintenance text;
alter table properties add column if not exists furnishing text;
alter table properties add column if not exists available_from date;

-- ---------- 2. Site visit bookings ----------
create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  -- Nullable with on delete set null so removing a listing doesn't wipe the
  -- record of someone who asked to see it.
  property_id uuid references properties(id) on delete set null,
  property_title text not null,
  name text not null,
  mobile text not null,
  preferred_date date not null,
  preferred_slot text not null,
  notes text,
  status text default 'Requested', -- Requested, Confirmed, Done, Cancelled
  created_at timestamptz default now()
);

create index if not exists visits_created_at_idx on visits (created_at desc);
create index if not exists visits_status_idx on visits (status);

alter table visits enable row level security;

-- ---------- 3. Policies ----------
-- public.is_admin() comes from supabase-migration-admin-rls.sql. If that
-- hasn't been run yet this block raises a clear error instead of a confusing
-- "function does not exist" halfway down.
do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception
      'public.is_admin() is missing — run supabase-migration-admin-rls.sql first';
  end if;
end $$;

drop policy if exists "Anyone can request a visit" on visits;
drop policy if exists "Admins can view visits" on visits;
drop policy if exists "Admins can update visits" on visits;
drop policy if exists "Admins can delete visits" on visits;

-- Anyone can request a visit — same as the public enquiry form.
create policy "Anyone can request a visit"
  on visits for insert
  with check (true);

create policy "Admins can view visits"
  on visits for select
  using (public.is_admin());

create policy "Admins can update visits"
  on visits for update
  using (public.is_admin());

create policy "Admins can delete visits"
  on visits for delete
  using (public.is_admin());
