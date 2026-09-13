-- =============================================================
-- KORASPACE MARKETING OVERVIEW -- REAL DATA LAYER (v1.0)
-- =============================================================

-- 1. MARKETING OPPORTUNITIES
create table if not exists public.marketing_opportunities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  category text not null default 'strategy'
    check (category in ('scale', 'budget', 'creative', 'roas', 'strategy')),
  title text not null,
  description text not null,
  impact text not null default 'medium'
    check (impact in ('high', 'medium', 'low')),
  action_label text not null default 'Review',
  action_href text,
  dismissed boolean not null default false,
  applied boolean not null default false,
  generated_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists marketing_opportunities_workspace_idx
  on public.marketing_opportunities(workspace_id, created_at desc);
create index if not exists marketing_opportunities_active_idx
  on public.marketing_opportunities(workspace_id, dismissed, applied);

-- 2. CAMPAIGN PERIOD SNAPSHOTS
create table if not exists public.campaign_period_snapshots (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.social_campaigns(id) on delete cascade,
  workspace_id uuid not null,
  period_start date not null,
  period_end date not null,
  spend numeric(14,2) not null default 0,
  revenue numeric(14,2) not null default 0,
  impressions int not null default 0,
  clicks int not null default 0,
  conversions int not null default 0,
  roas numeric(8,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (campaign_id, period_start, period_end)
);

create index if not exists campaign_period_snapshots_workspace_idx
  on public.campaign_period_snapshots(workspace_id, period_start);
create index if not exists campaign_period_snapshots_campaign_idx
  on public.campaign_period_snapshots(campaign_id, period_start desc);

-- 3. WORKSPACE ACTIVITY -- extra columns
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'workspace_activity' and column_name = 'actor_name'
  ) then
    alter table public.workspace_activity add column actor_name text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'workspace_activity' and column_name = 'icon'
  ) then
    alter table public.workspace_activity add column icon text;
  end if;
end $$;

-- 4. MARKETING TASKS -- assigned_by column
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'marketing_tasks' and column_name = 'assigned_by'
  ) then
    alter table public.marketing_tasks
      add column assigned_by uuid references auth.users(id) on delete set null;
  end if;
end $$;

-- 5. ROW LEVEL SECURITY
alter table public.marketing_opportunities enable row level security;
alter table public.campaign_period_snapshots enable row level security;

drop policy if exists "View marketing opportunities" on public.marketing_opportunities;
create policy "View marketing opportunities"
  on public.marketing_opportunities for select
  using (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = marketing_opportunities.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists "Insert marketing opportunities" on public.marketing_opportunities;
create policy "Insert marketing opportunities"
  on public.marketing_opportunities for insert
  with check (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = marketing_opportunities.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists "Update marketing opportunities" on public.marketing_opportunities;
create policy "Update marketing opportunities"
  on public.marketing_opportunities for update
  using (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = marketing_opportunities.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists "View campaign period snapshots" on public.campaign_period_snapshots;
create policy "View campaign period snapshots"
  on public.campaign_period_snapshots for select
  using (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = campaign_period_snapshots.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists "Insert campaign period snapshots" on public.campaign_period_snapshots;
create policy "Insert campaign period snapshots"
  on public.campaign_period_snapshots for insert
  with check (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = campaign_period_snapshots.workspace_id
        and wm.user_id = auth.uid()
    )
  );