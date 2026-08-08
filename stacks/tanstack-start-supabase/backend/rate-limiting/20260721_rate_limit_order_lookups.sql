-- ─── RATE LIMITING FOR PUBLIC ORDER LOOKUPS ───────────────────
-- Security audit finding: /track-order (getOrderByNumberVerified) is gated
-- only by a phone-number match over ENUMERABLE order numbers
-- (ART-YYYYMMDD-NNNN), with no throttling. An attacker who knows a target's
-- phone number could brute-force order numbers to harvest their orders + PII.
--
-- This adds a generic, serverless-safe token-bucket-ish counter in the DB
-- (in-memory counters don't survive across Vercel lambdas). The
-- orders-access.server.ts server functions call check_rate_limit() keyed by
-- client IP before each lookup.

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now()
);

-- Locked down: only the SECURITY DEFINER function below (and service_role)
-- ever touch this table. No public policies → anon/authenticated cannot
-- read or tamper with the counters directly.
alter table public.rate_limits enable row level security;

-- Returns TRUE if the action is allowed, FALSE if the caller has exceeded
-- p_max actions within the rolling p_window_seconds window for p_key.
create or replace function public.check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_count integer;
begin
  insert into public.rate_limits (key, count, window_start)
  values (p_key, 1, v_now)
  on conflict (key) do update
    set count = case
                  when rate_limits.window_start < v_now - make_interval(secs => p_window_seconds)
                  then 1
                  else rate_limits.count + 1
                end,
        window_start = case
                  when rate_limits.window_start < v_now - make_interval(secs => p_window_seconds)
                  then v_now
                  else rate_limits.window_start
                end
  returning count into v_count;

  return v_count <= p_max;
end;
$$;
