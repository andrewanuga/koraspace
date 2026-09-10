create extension if not exists "pgcrypto";

-- =========================================================
-- AUTOMATIONS
-- =========================================================

create table if not exists public.marketing_automations (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  description text not null default '',

  type text not null default 'lead_nurturing'
    check (
      type in (
        'lead_nurturing',
        're_engagement',
        'social_posting',
        'welcome',
        'ecommerce',
        'event_follow_up',
        'product_launch',
        'feedback',
        'custom'
      )
    ),

  status text not null default 'draft'
    check (
      status in (
        'active',
        'paused',
        'draft'
      )
    ),

  trigger_type text not null default 'manual'
    check (
      trigger_type in (
        'manual',
        'lead_created',
        'lead_stage_changed',
        'form_submitted',
        'campaign_started',
        'event_registered',
        'cart_abandoned',
        'schedule',
        'webhook'
      )
    ),

  trigger_config jsonb not null default '{}'::jsonb,

  steps jsonb not null default '[]'::jsonb,

  contacts_count integer not null default 0,
  conversion_rate numeric(8,2) not null default 0,
  avg_time text not null default '—',

  last_run_at timestamptz,
  next_run_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- AUTOMATION RUNS
-- =========================================================

create table if not exists public.marketing_automation_runs (
  id uuid primary key default gen_random_uuid(),

  automation_id uuid not null
    references public.marketing_automations(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  status text not null default 'completed'
    check (
      status in (
        'running',
        'completed',
        'failed',
        'cancelled'
      )
    ),

  contacts_processed integer not null default 0,
  conversions integer not null default 0,

  started_at timestamptz not null default now(),
  completed_at timestamptz,

  error_message text
);

-- =========================================================
-- INDEXES
-- =========================================================

create index if not exists marketing_automations_user_id_idx
  on public.marketing_automations(user_id);

create index if not exists marketing_automations_status_idx
  on public.marketing_automations(status);

create index if not exists marketing_automations_type_idx
  on public.marketing_automations(type);

create index if not exists marketing_automations_updated_at_idx
  on public.marketing_automations(updated_at desc);

create index if not exists marketing_automation_runs_automation_id_idx
  on public.marketing_automation_runs(automation_id);

create index if not exists marketing_automation_runs_user_id_idx
  on public.marketing_automation_runs(user_id);

-- =========================================================
-- UPDATED_AT
-- =========================================================

create or replace function public.set_marketing_automation_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists marketing_automations_updated_at
on public.marketing_automations;

create trigger marketing_automations_updated_at
before update on public.marketing_automations
for each row
execute function public.set_marketing_automation_updated_at();

-- =========================================================
-- RLS
-- =========================================================

alter table public.marketing_automations enable row level security;
alter table public.marketing_automation_runs enable row level security;

drop policy if exists "Users can view their automations"
on public.marketing_automations;

create policy "Users can view their automations"
on public.marketing_automations
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their automations"
on public.marketing_automations;

create policy "Users can create their automations"
on public.marketing_automations
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their automations"
on public.marketing_automations;

create policy "Users can update their automations"
on public.marketing_automations
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their automations"
on public.marketing_automations;

create policy "Users can delete their automations"
on public.marketing_automations
for delete
using (auth.uid() = user_id);

-- Runs

drop policy if exists "Users can view their automation runs"
on public.marketing_automation_runs;

create policy "Users can view their automation runs"
on public.marketing_automation_runs
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their automation runs"
on public.marketing_automation_runs;

create policy "Users can create their automation runs"
on public.marketing_automation_runs
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their automation runs"
on public.marketing_automation_runs;

create policy "Users can update their automation runs"
on public.marketing_automation_runs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
