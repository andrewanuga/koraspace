-- =========================================================
-- DISCOVERY INTELLIGENCE TABLES & SCHEMA (v1.69)
-- =========================================================

-- 1. Discovery Topics
create table if not exists public.discovery_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null,
  name text not null,
  category text not null default 'General',
  source text not null default 'ai_extracted',
  growth_percent numeric not null default 0,
  momentum_score numeric not null default 0,
  mention_count integer not null default 0,
  engagement_score numeric not null default 0,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discovery_topics_workspace_id_idx on public.discovery_topics(workspace_id);
create index if not exists discovery_topics_growth_percent_idx on public.discovery_topics(growth_percent desc);
alter table public.discovery_topics enable row level security;

-- 2. Discovery Competitors
create table if not exists public.discovery_competitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null,
  name text not null,
  handle text,
  platform text not null default 'instagram',
  profile_url text,
  followers integer default 0,
  engagement_rate numeric default 0,
  posts_last_7_days integer default 0,
  growth_percent numeric default 0,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists discovery_competitors_workspace_id_idx on public.discovery_competitors(workspace_id);
alter table public.discovery_competitors enable row level security;

-- 3. Discovery Signals
create table if not exists public.discovery_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null,
  signal_type text not null default 'trend',
  title text not null,
  description text,
  score numeric not null default 0,
  source text not null default 'platform_analytics',
  platform text,
  topic text,
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists discovery_signals_workspace_id_idx on public.discovery_signals(workspace_id);
alter table public.discovery_signals enable row level security;

-- 4. Discovery Opportunities
create table if not exists public.discovery_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null,
  title text not null,
  description text,
  topic text,
  platform text,
  potential_score text not null default 'High Potential',
  growth_percent numeric default 0,
  status text not null default 'open' check (status in ('open', 'in_progress', 'applied', 'dismissed')),
  source text not null default 'ai_agent',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discovery_opportunities_workspace_id_idx on public.discovery_opportunities(workspace_id);
alter table public.discovery_opportunities enable row level security;

-- =========================================================
-- RLS POLICIES FOR DISCOVERY TABLES
-- =========================================================

-- discovery_topics
drop policy if exists "workspace members can view discovery_topics" on public.discovery_topics;
create policy "workspace members can view discovery_topics"
on public.discovery_topics for select
using (
  user_id = auth.uid()
  or workspace_id = auth.uid()
  or exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = discovery_topics.workspace_id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "workspace members can insert discovery_topics" on public.discovery_topics;
create policy "workspace members can insert discovery_topics"
on public.discovery_topics for insert
with check (
  user_id = auth.uid()
  and (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = discovery_topics.workspace_id
        and wm.user_id = auth.uid()
    )
  )
);

-- discovery_competitors
drop policy if exists "workspace members can view discovery_competitors" on public.discovery_competitors;
create policy "workspace members can view discovery_competitors"
on public.discovery_competitors for select
using (
  user_id = auth.uid()
  or workspace_id = auth.uid()
  or exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = discovery_competitors.workspace_id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "workspace members can insert discovery_competitors" on public.discovery_competitors;
create policy "workspace members can insert discovery_competitors"
on public.discovery_competitors for insert
with check (
  user_id = auth.uid()
  and (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = discovery_competitors.workspace_id
        and wm.user_id = auth.uid()
    )
  )
);

-- discovery_signals
drop policy if exists "workspace members can view discovery_signals" on public.discovery_signals;
create policy "workspace members can view discovery_signals"
on public.discovery_signals for select
using (
  user_id = auth.uid()
  or workspace_id = auth.uid()
  or exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = discovery_signals.workspace_id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "workspace members can insert discovery_signals" on public.discovery_signals;
create policy "workspace members can insert discovery_signals"
on public.discovery_signals for insert
with check (
  user_id = auth.uid()
  and (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = discovery_signals.workspace_id
        and wm.user_id = auth.uid()
    )
  )
);

-- discovery_opportunities
drop policy if exists "workspace members can view discovery_opportunities" on public.discovery_opportunities;
create policy "workspace members can view discovery_opportunities"
on public.discovery_opportunities for select
using (
  user_id = auth.uid()
  or workspace_id = auth.uid()
  or exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = discovery_opportunities.workspace_id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "workspace members can insert discovery_opportunities" on public.discovery_opportunities;
create policy "workspace members can insert discovery_opportunities"
on public.discovery_opportunities for insert
with check (
  user_id = auth.uid()
  and (
    workspace_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = discovery_opportunities.workspace_id
        and wm.user_id = auth.uid()
    )
  )
);
