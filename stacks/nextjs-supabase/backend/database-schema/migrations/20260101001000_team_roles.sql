-- ============================================================
-- Department-based team roles: Owner, Sales, IT, Accounts, and whatever
-- else gets added later — as DATA, not a fixed set of options in code.
--
-- Follows Supabase's own documented RBAC pattern (roles table +
-- role_permissions mapping, https://supabase.com/docs/guides/database/
-- postgres/custom-claims-and-role-based-access-control-rbac) rather than
-- inventing something bespoke: a `roles` table for department names, a
-- `role_permissions` table for what each department can do per module, and
-- `team_members` — one row per person, each with their OWN Supabase Auth
-- login (created by the owner, not self-signup).
--
-- The old `admins` table was a flat email allowlist with no role concept
-- at all — fine for one person, not for a team split across departments
-- with different jobs (a telecaller works leads; they don't touch listings
-- or see accounts data).
-- ============================================================

-- ---------- 1. Departments ----------
create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,   -- 'Owner', 'Sales', 'IT', 'Accounts', ...
  description text,
  created_at timestamptz default now()
);

-- ---------- 2. What each department can do, per area of the app ----------
create table if not exists role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  module text not null,        -- 'leads', 'properties', 'visits', 'team'
  can_view boolean not null default false,
  can_create boolean not null default false,
  can_update boolean not null default false,
  can_delete boolean not null default false,
  primary key (role_id, module)
);

-- ---------- 3. People ----------
-- Keyed by auth.users.id rather than email — that's what a real Supabase
-- Auth account gives us, and it survives someone changing their email
-- later, unlike matching on the email string.
create table if not exists team_members (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references roles(id),
  name text not null,
  phone text,
  email text not null,
  created_at timestamptz default now()
);

create index if not exists team_members_role_idx on team_members (role_id);

alter table roles enable row level security;
alter table role_permissions enable row level security;
alter table team_members enable row level security;

-- ---------- 4. Seed the departments the owner asked for ----------
-- Owner gets every permission on every module by default. Sales/IT/Accounts
-- get a sensible starting point — all adjustable later from the owner's
-- team-management screen without touching a migration, because this is
-- data, not an enum.
insert into roles (name, description) values
  ('Owner', 'Full access to everything.'),
  ('Sales', 'Works leads through the pipeline: calls, remarks, stage updates.'),
  ('IT', 'Manages listings and site content.'),
  ('Accounts', 'Views leads and listings; no edit access.')
on conflict (name) do nothing;

insert into role_permissions (role_id, module, can_view, can_create, can_update, can_delete)
select r.id, m.module, true, true, true, true
from roles r, (values ('leads'), ('properties'), ('visits'), ('team')) as m(module)
where r.name = 'Owner'
on conflict (role_id, module) do nothing;

insert into role_permissions (role_id, module, can_view, can_create, can_update, can_delete)
select r.id, m.module, m.v, m.c, m.u, m.d
from roles r,
  (values
    ('leads',      true,  true,  true,  false),
    ('visits',     true,  true,  true,  false),
    ('properties', true,  false, false, false),
    ('team',       false, false, false, false)
  ) as m(module, v, c, u, d)
where r.name = 'Sales'
on conflict (role_id, module) do nothing;

insert into role_permissions (role_id, module, can_view, can_create, can_update, can_delete)
select r.id, m.module, m.v, m.c, m.u, m.d
from roles r,
  (values
    ('properties', true, true,  true,  true),
    ('leads',      false, false, false, false),
    ('visits',     false, false, false, false),
    ('team',       false, false, false, false)
  ) as m(module, v, c, u, d)
where r.name = 'IT'
on conflict (role_id, module) do nothing;

insert into role_permissions (role_id, module, can_view, can_create, can_update, can_delete)
select r.id, m.module, true, false, false, false
from roles r, (values ('leads'), ('properties')) as m(module)
where r.name = 'Accounts'
on conflict (role_id, module) do nothing;

-- ---------- 5. Bring the existing owner into the new structure ----------
-- Matches each email already in `admins` to its Supabase Auth account and
-- gives it the Owner role. If this finds nobody, the migration fails loudly
-- instead of silently locking everyone out of /admin — is_admin()/is_owner()
-- are about to start reading from team_members instead of the old table.
-- The live `admins` table is just (email, created_at) — no name/phone ever
-- got added to it, so there's nothing to carry over beyond the email match.
insert into team_members (id, role_id, name, phone, email)
select u.id, (select id from roles where name = 'Owner'), a.email, null, a.email
from admins a
join auth.users u on u.email = a.email
on conflict (id) do nothing;

do $$
begin
  if (select count(*) from admins) > 0 and (select count(*) from team_members) = 0 then
    raise exception
      'No admins.email matched an auth.users account — check the owner has actually signed in at /admin/login at least once before this migration runs.';
  end if;
end $$;

-- ---------- 6. Helper functions ----------
-- is_admin() keeps its name (every existing policy calls it) but now means
-- "is any team member, any department" instead of "is on the old flat list".
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.team_members where id = auth.uid());
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members tm
    join public.roles r on r.id = tm.role_id
    where tm.id = auth.uid() and r.name = 'Owner'
  );
$$;

-- Fine-grained check for the modules table above — "can this person create
-- a lead", "can this person delete a property" — used by the leads/visits
-- policies that come in the next migration.
create or replace function public.has_permission(p_module text, p_action text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select case p_action
        when 'view' then rp.can_view
        when 'create' then rp.can_create
        when 'update' then rp.can_update
        when 'delete' then rp.can_delete
        else false
      end
      from public.team_members tm
      join public.role_permissions rp on rp.role_id = tm.role_id
      where tm.id = auth.uid() and rp.module = p_module
    ),
    false
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_owner() to authenticated;
grant execute on function public.has_permission(text, text) to authenticated;

-- ---------- 7. Who can see the team roster ----------
drop policy if exists "Team members can view roles" on roles;
drop policy if exists "Team members can view role_permissions" on role_permissions;
drop policy if exists "Team members can view team_members" on team_members;
drop policy if exists "Owners manage roles" on roles;
drop policy if exists "Owners manage role_permissions" on role_permissions;
drop policy if exists "Owners manage team_members" on team_members;

-- Everyone on the team can see the department list and the roster (needed
-- for "assign to" dropdowns) — but only the owner can change any of it.
create policy "Team members can view roles"
  on roles for select using (public.is_admin());
create policy "Team members can view role_permissions"
  on role_permissions for select using (public.is_admin());
create policy "Team members can view team_members"
  on team_members for select using (public.is_admin());

create policy "Owners manage roles"
  on roles for all using (public.is_owner()) with check (public.is_owner());
create policy "Owners manage role_permissions"
  on role_permissions for all using (public.is_owner()) with check (public.is_owner());
create policy "Owners manage team_members"
  on team_members for all using (public.is_owner()) with check (public.is_owner());

-- ---------- 8. Listings and photos: owner (or IT) territory ----------
-- IT has full CRUD on properties per the seed above; Sales/Accounts don't.
-- Kept as a direct has_permission check rather than is_owner() so IT can
-- actually do the job it was just granted.
drop policy if exists "Admins can manage properties" on properties;
drop policy if exists "Owners can manage properties" on properties;

create policy "Team members with properties access can manage properties"
  on properties for all
  using (public.has_permission('properties', 'update'))
  with check (public.has_permission('properties', 'create'));

drop policy if exists "Admins can upload property photos" on storage.objects;
drop policy if exists "Admins can delete property photos" on storage.objects;
drop policy if exists "Owners can upload property photos" on storage.objects;
drop policy if exists "Owners can delete property photos" on storage.objects;

create policy "Team members with properties access can upload photos"
  on storage.objects for insert
  with check (bucket_id = 'property-photos' and public.has_permission('properties', 'create'));

create policy "Team members with properties access can delete photos"
  on storage.objects for delete
  using (bucket_id = 'property-photos' and public.has_permission('properties', 'delete'));
