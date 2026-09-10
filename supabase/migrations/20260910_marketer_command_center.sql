-- =========================================================
-- KORASPACE MARKETER COMMAND CENTER BACKEND SCHEMA (v1.67)
-- =========================================================

-- 1. ADD MISSING COLUMNS TO SOCIAL CAMPAIGNS IF NOT PRESENT
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'social_campaigns' and column_name = 'revenue') then
    alter table public.social_campaigns add column revenue numeric default 0;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'social_campaigns' and column_name = 'workspace_id') then
    alter table public.social_campaigns add column workspace_id uuid;
  end if;
end $$;

-- 2. CAMPAIGN DAILY METRICS (For time-series charts & historical performance)
create table if not exists public.campaign_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.social_campaigns(id) on delete cascade,
  workspace_id uuid not null,
  date date not null,
  spend numeric default 0,
  impressions integer default 0,
  reach integer default 0,
  clicks integer default 0,
  engagements integer default 0,
  conversions integer default 0,
  revenue numeric default 0,
  created_at timestamptz default now(),
  unique(campaign_id, date)
);

-- 3. WORKSPACE ACTIVITY LOG (For agency command center activity feed)
create table if not exists public.workspace_activity (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  user_id uuid references auth.users(id) on delete set null,
  type text not null, -- 'campaign_launched', 'budget_updated', 'post_published', 'client_joined', 'strategy_generated', etc.
  entity_type text,   -- 'campaign', 'post', 'client', 'integration', 'strategy'
  entity_id text,
  title text not null,
  description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 4. MARKETING TASKS & UPCOMING DELIVERABLES
create table if not exists public.marketing_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  assigned_to uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  type text default 'general', -- 'campaign_review', 'client_meeting', 'creative_approval', 'budget_audit'
  status text default 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority text default 'medium', -- 'low', 'medium', 'high', 'urgent'
  due_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================
-- UPDATED AT TRIGGER FOR MARKETING TASKS
-- =========================================================
drop trigger if exists marketing_tasks_updated_at on public.marketing_tasks;
create trigger marketing_tasks_updated_at
  before update on public.marketing_tasks
  for each row execute procedure public.handle_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.campaign_daily_metrics enable row level security;
alter table public.workspace_activity enable row level security;
alter table public.marketing_tasks enable row level security;

-- Policies for campaign_daily_metrics
drop policy if exists "Members can view campaign daily metrics" on public.campaign_daily_metrics;
create policy "Members can view campaign daily metrics"
  on public.campaign_daily_metrics for select
  using (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = campaign_daily_metrics.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists "Members can insert campaign daily metrics" on public.campaign_daily_metrics;
create policy "Members can insert campaign daily metrics"
  on public.campaign_daily_metrics for insert
  with check (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = campaign_daily_metrics.workspace_id
        and wm.user_id = auth.uid()
    )
  );

-- Policies for workspace_activity
drop policy if exists "Members can view workspace activity" on public.workspace_activity;
create policy "Members can view workspace activity"
  on public.workspace_activity for select
  using (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_activity.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists "Members can insert workspace activity" on public.workspace_activity;
create policy "Members can insert workspace activity"
  on public.workspace_activity for insert
  with check (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_activity.workspace_id
        and wm.user_id = auth.uid()
    )
  );

-- Policies for marketing_tasks
drop policy if exists "Members can view marketing tasks" on public.marketing_tasks;
create policy "Members can view marketing tasks"
  on public.marketing_tasks for select
  using (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = marketing_tasks.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists "Members can manage marketing tasks" on public.marketing_tasks;
create policy "Members can manage marketing tasks"
  on public.marketing_tasks for all
  using (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = marketing_tasks.workspace_id
        and wm.user_id = auth.uid()
    )
  )
  with check (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = marketing_tasks.workspace_id
        and wm.user_id = auth.uid()
    )
  );

-- =========================================================
-- INDEXES
-- =========================================================
create index if not exists campaign_daily_metrics_workspace_idx on public.campaign_daily_metrics(workspace_id, date);
create index if not exists campaign_daily_metrics_campaign_idx on public.campaign_daily_metrics(campaign_id, date);
create index if not exists workspace_activity_workspace_idx on public.workspace_activity(workspace_id, created_at desc);
create index if not exists marketing_tasks_workspace_idx on public.marketing_tasks(workspace_id, due_at);
