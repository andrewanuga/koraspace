-- ==============================================================================
-- KoraSpace Enterprise Automation Engine Schema
-- ==============================================================================

create extension if not exists pgcrypto;

-- 1. Automations Table
create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  trigger_type text,
  trigger_config jsonb not null default '{}'::jsonb,
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{
    "timezone": "UTC",
    "maxRunsPerHour": 100,
    "failurePolicy": "continue"
  }'::jsonb,
  version integer not null default 1,
  last_run_at timestamptz,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  total_runs bigint not null default 0,
  successful_runs bigint not null default 0,
  failed_runs bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists automations_user_id_idx on public.automations(user_id);
create index if not exists automations_status_idx on public.automations(status);
create index if not exists automations_updated_at_idx on public.automations(updated_at desc);

-- 2. Automation Runs Table
create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid not null references public.automations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'running' check (status in ('queued', 'running', 'waiting', 'success', 'failed', 'cancelled')),
  trigger_payload jsonb not null default '{}'::jsonb,
  context jsonb not null default '{}'::jsonb,
  current_step integer not null default 0,
  idempotency_key text,
  error text,
  started_at timestamptz default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists automation_runs_automation_id_idx on public.automation_runs(automation_id);
create index if not exists automation_runs_user_id_idx on public.automation_runs(user_id);
create index if not exists automation_runs_created_at_idx on public.automation_runs(created_at desc);

-- 3. Automation Node Runs Table (Step Execution History)
create table if not exists public.automation_node_runs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.automation_runs(id) on delete cascade,
  node_id text not null,
  node_type text not null,
  status text not null default 'running' check (status in ('waiting', 'running', 'success', 'failed', 'skipped')),
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error text,
  attempts integer not null default 0,
  started_at timestamptz default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists automation_node_runs_run_id_idx on public.automation_node_runs(run_id);
create index if not exists automation_node_runs_node_id_idx on public.automation_node_runs(node_id);

-- 4. Automation Credentials (Never expose to browser)
create table if not exists public.automation_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  name text not null,
  account_id text,
  account_name text,
  encrypted_data text not null,
  scopes text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'expired', 'revoked', 'error')),
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, provider, name)
);

create index if not exists automation_credentials_user_id_idx on public.automation_credentials(user_id);
create index if not exists automation_credentials_provider_idx on public.automation_credentials(provider);

-- 5. Automation Webhooks
create table if not exists public.automation_webhooks (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid not null references public.automations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  secret_hash text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists automation_webhooks_automation_idx on public.automation_webhooks(automation_id);
create index if not exists automation_webhooks_user_id_idx on public.automation_webhooks(user_id);

-- 6. Normalized Automation Events Store (Prevents Duplicate Webhook / Event Replays)
create table if not exists public.automation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  event_type text not null,
  external_event_id text,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(provider, external_event_id)
);

create index if not exists automation_events_user_id_idx on public.automation_events(user_id);
create index if not exists automation_events_provider_idx on public.automation_events(provider);

-- 7. Automation Usage Table
create table if not exists public.automation_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  runs integer not null default 0,
  ai_runs integer not null default 0,
  messages_sent integer not null default 0,
  posts_published integer not null default 0,
  primary key(user_id, period_start)
);

create index if not exists automation_usage_user_id_idx on public.automation_usage(user_id);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

alter table public.automations enable row level security;
alter table public.automation_runs enable row level security;
alter table public.automation_node_runs enable row level security;
alter table public.automation_credentials enable row level security;
alter table public.automation_webhooks enable row level security;
alter table public.automation_events enable row level security;
alter table public.automation_usage enable row level security;

-- Automations Policies
create policy "users can manage own automations"
on public.automations for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Automation Runs Policies
create policy "users can view own runs"
on public.automation_runs for select
using (auth.uid() = user_id);

create policy "users can create own runs"
on public.automation_runs for insert
with check (auth.uid() = user_id);

create policy "users can update own runs"
on public.automation_runs for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Automation Node Runs Policies
create policy "users can view own node runs"
on public.automation_node_runs for select
using (
  exists (
    select 1
    from public.automation_runs r
    where r.id = automation_node_runs.run_id
    and r.user_id = auth.uid()
  )
);

create policy "users can insert own node runs"
on public.automation_node_runs for insert
with check (
  exists (
    select 1
    from public.automation_runs r
    where r.id = automation_node_runs.run_id
    and r.user_id = auth.uid()
  )
);

create policy "users can update own node runs"
on public.automation_node_runs for update
using (
  exists (
    select 1
    from public.automation_runs r
    where r.id = automation_node_runs.run_id
    and r.user_id = auth.uid()
  )
);

-- Automation Credentials Policies
create policy "users can manage own credentials"
on public.automation_credentials for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Automation Webhooks Policies
create policy "users can manage own webhooks"
on public.automation_webhooks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Automation Events Policies
create policy "users can manage own automation events"
on public.automation_events for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Automation Usage Policies
create policy "users can manage own automation usage"
on public.automation_usage for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
