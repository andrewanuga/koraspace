-- =========================================================
-- MARKETING STRATEGIES TABLE & SCHEMA (v1.68)
-- =========================================================

create table if not exists public.marketing_strategies (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null,
  created_by uuid not null references auth.users(id) on delete cascade,

  business_goal text,
  target_growth numeric default 0,
  main_kpi text,
  timeframe text default '90',

  content_pillars jsonb not null default '[]'::jsonb,
  posting_frequency jsonb not null default '[]'::jsonb,
  growth_experiments jsonb not null default '[]'::jsonb,

  plan_30 jsonb not null default '[]'::jsonb,
  plan_60 jsonb not null default '[]'::jsonb,
  plan_90 jsonb not null default '[]'::jsonb,

  audience jsonb not null default '[]'::jsonb,
  platform_strategy jsonb not null default '[]'::jsonb,

  status text not null default 'draft'
    check (status in ('draft', 'active', 'archived')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists marketing_strategies_workspace_id_idx
on public.marketing_strategies(workspace_id);

create index if not exists marketing_strategies_created_by_idx
on public.marketing_strategies(created_by);

create index if not exists marketing_strategies_status_idx
on public.marketing_strategies(status);

-- Enable RLS
alter table public.marketing_strategies enable row level security;

-- Policies
drop policy if exists "workspace members can view strategies" on public.marketing_strategies;
create policy "workspace members can view strategies"
on public.marketing_strategies
for select
using (
  created_by = auth.uid()
  or workspace_id = auth.uid()
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = marketing_strategies.workspace_id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "workspace members can create strategies" on public.marketing_strategies;
create policy "workspace members can create strategies"
on public.marketing_strategies
for insert
with check (
  created_by = auth.uid()
  and (
    workspace_id = auth.uid()
    or exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = marketing_strategies.workspace_id
        and wm.user_id = auth.uid()
    )
  )
);

drop policy if exists "workspace members can update strategies" on public.marketing_strategies;
create policy "workspace members can update strategies"
on public.marketing_strategies
for update
using (
  created_by = auth.uid()
  or workspace_id = auth.uid()
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = marketing_strategies.workspace_id
      and wm.user_id = auth.uid()
  )
)
with check (
  created_by = auth.uid()
  or workspace_id = auth.uid()
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = marketing_strategies.workspace_id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "workspace members can delete strategies" on public.marketing_strategies;
create policy "workspace members can delete strategies"
on public.marketing_strategies
for delete
using (
  created_by = auth.uid()
  or workspace_id = auth.uid()
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = marketing_strategies.workspace_id
      and wm.user_id = auth.uid()
  )
);

-- Updated_at trigger function
create or replace function public.set_marketing_strategy_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists marketing_strategies_updated_at on public.marketing_strategies;
create trigger marketing_strategies_updated_at
before update on public.marketing_strategies
for each row
execute function public.set_marketing_strategy_updated_at();