-- ============================================================
-- Lead pipeline: real estate stages, outcome tags, source, assignment,
-- an activity log, and round-robin distribution among a manager's reports.
--
-- The old `status` column only had four values (New/Contacted/Closed/
-- Rejected) — nowhere to record "Ready to Visit" vs "Visited", and no way
-- to separately track "Interested but not ready" from "wants an EMI/loan
-- option" without overloading one field for both the sales STAGE and the
-- client's TEMPERAMENT. Those are two different axes, so they're two
-- different columns.
-- ============================================================

-- ---------- 1. Stage — where the lead actually is ----------
alter table leads add column if not exists stage text not null default 'New';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'leads_stage_check') then
    alter table leads add constraint leads_stage_check
      check (stage in (
        'New', 'Contacted', 'Ready to Visit', 'Visited',
        'Negotiating', 'Won', 'Lost'
      ));
  end if;
end $$;

-- ---------- 2. Tags — what kind of client, orthogonal to stage ----------
-- A lead can be both "Visited" (stage) and "May Buy Later" (tag) at once —
-- that's a real, common combination a single status field can't hold.
alter table leads add column if not exists tags text[] not null default '{}';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'leads_tags_check') then
    alter table leads add constraint leads_tags_check
      check (tags <@ array[
        'Interested', 'Not Interested', 'May Buy Later', 'Needs EMI'
      ]::text[]);
  end if;
end $$;

-- ---------- 3. Where it came from ----------
-- Free text, not an enum — "99acres", "Housing.com", "Referral", "Walk-in"
-- shouldn't each need a migration to add. Existing rows all came through
-- the site's own enquiry form.
alter table leads add column if not exists source text not null default 'Website';

-- ---------- 4. Who's working it ----------
alter table leads add column if not exists assigned_to uuid references team_members(id) on delete set null;
create index if not exists leads_assigned_to_idx on leads (assigned_to);
create index if not exists leads_stage_idx on leads (stage);

-- ---------- 5. Carry the old status values over, then retire it ----------
update leads set stage = case status
  when 'New' then 'New'
  when 'Contacted' then 'Contacted'
  when 'Closed' then 'Won'
  when 'Rejected' then 'Lost'
  else 'New'
end
where status is not null;

alter table leads drop column if exists status;

-- ---------- 6. Activity log — calls, remarks, manually-noted conversations ----------
create table if not exists lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  -- Nullable + set null so a removed employee's history stays on the lead
  -- instead of disappearing with them.
  actor_id uuid references team_members(id) on delete set null,
  kind text not null default 'note',  -- 'call', 'note', 'whatsapp', 'email', 'stage_change'
  content text not null,
  created_at timestamptz default now()
);

create index if not exists lead_activities_lead_idx on lead_activities (lead_id, created_at desc);

alter table lead_activities enable row level security;

-- ---------- 7. Who can see which lead ----------
-- Replaces the earlier has_permission-only policies: a Sales person's
-- leads.view permission is real, but should only reach leads actually
-- assigned to them or to someone reporting to them — not the whole table.
-- is_owner() still sees everything regardless.
drop policy if exists "Team members with leads access can view leads" on leads;
drop policy if exists "Team members with leads access can update leads" on leads;
drop policy if exists "Team members with leads access can delete leads" on leads;

create policy "Scoped lead visibility"
  on leads for select
  using (
    public.is_owner()
    or (
      public.has_permission('leads', 'view')
      and (assigned_to = auth.uid() or public.manages(assigned_to) or assigned_to is null)
    )
  );

create policy "Scoped lead updates"
  on leads for update
  using (
    public.is_owner()
    or (
      public.has_permission('leads', 'update')
      and (assigned_to = auth.uid() or public.manages(assigned_to) or assigned_to is null)
    )
  );

create policy "Owner deletes leads"
  on leads for delete
  using (public.is_owner());

-- ---------- 8. Activity log visibility follows the lead it's on ----------
create policy "Activity visible if the lead is"
  on lead_activities for select
  using (
    exists (
      select 1 from leads l
      where l.id = lead_id
        and (
          public.is_owner()
          or (
            public.has_permission('leads', 'view')
            and (l.assigned_to = auth.uid() or public.manages(l.assigned_to))
          )
        )
    )
  );

create policy "Log activity on a lead you can see"
  on lead_activities for insert
  with check (
    exists (
      select 1 from leads l
      where l.id = lead_id
        and (
          public.is_owner()
          or (
            public.has_permission('leads', 'update')
            and (l.assigned_to = auth.uid() or public.manages(l.assigned_to))
          )
        )
    )
  );

-- ---------- 9. Round robin ----------
-- Hands a lead to whichever of a manager's direct reports currently has the
-- fewest OPEN leads (Won/Lost don't count — someone who just closed five
-- deals shouldn't look "busy" and get skipped forever). Ties go to whoever
-- was assigned longest ago. Only the owner or that manager themself can
-- trigger it for that manager's team.
create or replace function public.assign_round_robin(p_lead_id uuid, p_manager_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next_id uuid;
begin
  if not (public.is_owner() or auth.uid() = p_manager_id) then
    raise exception 'Not permitted to distribute leads for that manager.';
  end if;

  select tm.id into v_next_id
  from team_members tm
  where tm.manager_id = p_manager_id
  order by
    (select count(*) from leads l
     where l.assigned_to = tm.id and l.stage not in ('Won', 'Lost')) asc,
    (select max(l.created_at) from leads l where l.assigned_to = tm.id) asc nulls first
  limit 1;

  if v_next_id is null then
    raise exception 'That manager has no one reporting to them yet.';
  end if;

  update leads set assigned_to = v_next_id where id = p_lead_id;

  return v_next_id;
end;
$$;

grant execute on function public.assign_round_robin(uuid, uuid) to authenticated;
