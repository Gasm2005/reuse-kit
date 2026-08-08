-- ============================================================
-- ADMIN LOCKDOWN — run this once in Supabase SQL Editor.
--
-- Problem this fixes: the original policies allowed ANY logged-in
-- Supabase user to add/edit/delete properties and read every lead.
-- Since email signup is on by default, that meant anyone who signed
-- up got full admin access.
--
-- After this, only emails listed in the `admins` table can write.
--
-- ⚠️ EDIT THE INSERT AT THE BOTTOM BEFORE RUNNING — if you skip it,
-- nobody will be an admin and you'll lock yourself out of the panel.
-- ============================================================

-- ---------- 1. Who counts as an admin ----------
create table if not exists admins (
  email text primary key,
  created_at timestamptz default now()
);

-- No policies on purpose: nothing reads this table directly. Only the
-- security-definer function below touches it, and that runs as the
-- table owner so RLS doesn't apply to it.
alter table admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = (auth.jwt() ->> 'email')
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- ---------- 2. Properties ----------
drop policy if exists "Authenticated users can manage properties" on properties;

-- Public read stays as it is — the website needs it.
create policy "Admins can manage properties"
  on properties for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- 3. Leads ----------
drop policy if exists "Authenticated users can view leads" on leads;
drop policy if exists "Authenticated users can update leads" on leads;
drop policy if exists "Authenticated users can delete leads" on leads;

-- Anonymous insert stays — that's the public enquiry form.
create policy "Admins can view leads"
  on leads for select
  using (public.is_admin());

create policy "Admins can update leads"
  on leads for update
  using (public.is_admin());

create policy "Admins can delete leads"
  on leads for delete
  using (public.is_admin());

-- ---------- 4. Property photo storage ----------
drop policy if exists "Authenticated users can upload property photos" on storage.objects;
drop policy if exists "Authenticated users can delete property photos" on storage.objects;

create policy "Admins can upload property photos"
  on storage.objects for insert
  with check (bucket_id = 'property-photos' and public.is_admin());

create policy "Admins can delete property photos"
  on storage.objects for delete
  using (bucket_id = 'property-photos' and public.is_admin());

-- ---------- 5. ⚠️ ADD YOURSELF ----------
-- Replace this with the exact email you log in to /admin/login with.
-- Add more rows if more than one person needs access.
insert into admins (email) values
  ('kaifbegmirza7497@gmail.com')
on conflict (email) do nothing;

-- ---------- 6. One more manual step ----------
-- Supabase Dashboard → Authentication → Sign In / Providers →
-- turn OFF "Allow new users to sign up". Otherwise strangers can still
-- create accounts; they just won't be able to do anything with them.
