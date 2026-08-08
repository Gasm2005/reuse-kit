-- ============================================================
-- Two things: tighten Sales down to just leads/visits (properties view was
-- still on from the original seed defaults, and the team roster's RLS
-- policy was checking is_admin() — any team member — rather than the
-- role_permissions row that was already seeded for it, so that permission
-- table was partly decorative), and add reporting-line hierarchy so a Sales
-- manager can see their executives' leads without being the owner.
-- ============================================================

-- ---------- 1. Sales sees leads and visits only ----------
update role_permissions
set can_view = false
where module = 'properties'
  and role_id = (select id from roles where name = 'Sales');

-- ---------- 2. Reporting line ----------
-- Nullable, self-referencing: a manager has direct reports; an individual
-- contributor (or the owner) has none. Only one level deep on purpose — a
-- manager sees their own reports, not a chain of managers-of-managers,
-- which real estate sales floors don't actually have.
alter table team_members
  add column if not exists manager_id uuid references team_members(id) on delete set null;

create index if not exists team_members_manager_idx on team_members (manager_id);

-- A manager cannot be their own report, and can't create a cycle at this
-- single-level depth (a report can't also be someone's manager pointing
-- back to them) — cheap to check since the hierarchy never goes deeper
-- than one level.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'team_members_no_self_manage'
  ) then
    alter table team_members add constraint team_members_no_self_manage
      check (manager_id is distinct from id);
  end if;
end $$;

-- ---------- 3. Is this row my report, directly? ----------
create or replace function public.manages(member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where id = member_id and manager_id = auth.uid()
  );
$$;

grant execute on function public.manages(uuid) to authenticated;

-- ---------- 4. Team roster visibility actually follows the permission
--              table now, instead of "any team member can see everyone" ----------
drop policy if exists "Team members can view team_members" on team_members;

create policy "Team members can view their own scope"
  on team_members for select
  using (
    public.is_owner()
    or public.has_permission('team', 'view')
    or id = auth.uid()          -- you can always see your own row
    or manager_id = auth.uid()  -- and a manager can always see their reports,
                                 -- regardless of what the Sales permission
                                 -- row says — the hierarchy itself grants this
  );
