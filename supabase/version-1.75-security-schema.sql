-- ============================================================
-- KORASPACE SECURITY SCHEMA — v1.75
-- Idempotent: safe to run multiple times.
-- Tables: blocked_ips, security_events
-- ============================================================

-- ── Blocked IPs ────────────────────────────────────────────────────────────
create table if not exists public.blocked_ips (
  ip          text        primary key,
  reason      text,
  auto        boolean     not null default false,   -- true = auto-blocked by rate limiter
  blocked_by  uuid        references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz                           -- null = permanent
);

alter table public.blocked_ips enable row level security;

-- Admins can manage all blocked IPs.
do $$ begin
  create policy "admins manage blocked_ips"
    on public.blocked_ips for all using (public.is_admin(auth.uid()));
exception when duplicate_object then null;
end $$;

-- Index for fast IP lookups.
create index if not exists blocked_ips_ip_idx on public.blocked_ips (ip);
create index if not exists blocked_ips_expires_idx on public.blocked_ips (expires_at)
  where expires_at is not null;


-- ── Security Events ─────────────────────────────────────────────────────────
create table if not exists public.security_events (
  id          uuid        primary key default gen_random_uuid(),
  type        text        not null,                 -- e.g. 'rate_limit_exceeded', 'ip_blocked'
  severity    text        not null default 'info'
              check (severity in ('info', 'warning', 'critical')),
  ip          text,
  email       text,
  user_id     uuid        references public.profiles(id) on delete set null,
  path        text,
  detail      text,
  created_at  timestamptz not null default now()
);

alter table public.security_events enable row level security;

-- Only admins can read security events.
do $$ begin
  create policy "admins read security_events"
    on public.security_events for select using (public.is_admin(auth.uid()));
exception when duplicate_object then null;
end $$;

-- Service role can insert (used by the API layer).
do $$ begin
  create policy "service role insert security_events"
    on public.security_events for insert with check (true);
exception when duplicate_object then null;
end $$;

-- Indexes for dashboard queries.
create index if not exists security_events_severity_idx on public.security_events (severity);
create index if not exists security_events_created_at_idx on public.security_events (created_at desc);
create index if not exists security_events_ip_idx on public.security_events (ip) where ip is not null;

-- Enable realtime for the admin security dashboard.
do $$ begin
  alter publication supabase_realtime add table public.security_events;
exception when duplicate_object then null;
       when undefined_object    then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.blocked_ips;
exception when duplicate_object then null;
       when undefined_object    then null;
end $$;


-- ── Auto-cleanup of expired blocks ─────────────────────────────────────────
-- Optionally wire this to a pg_cron job:
--   SELECT cron.schedule('cleanup-expired-blocks', '0 * * * *',
--     $$DELETE FROM public.blocked_ips WHERE expires_at < now()$$);
