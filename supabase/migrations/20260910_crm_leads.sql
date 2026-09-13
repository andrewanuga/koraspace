-- ============================================================
-- KoraSpace CRM: DM Campaigns & Leads
-- ============================================================

create extension if not exists "pgcrypto";

-- 1. Ensure dm_campaigns table exists
create table if not exists public.dm_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  platform text not null default 'instagram',
  description text default '',
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Ensure dm_campaign_leads table exists
create table if not exists public.dm_campaign_leads (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.dm_campaigns(id) on delete cascade,
  recipient_handle text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'replied', 'closed')),
  lead_score integer not null default 50 check (lead_score >= 0 and lead_score <= 100),
  notes text default '',
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Add columns safely if tables existed prior without them
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'dm_campaign_leads' and column_name = 'lead_score') then
    alter table public.dm_campaign_leads add column lead_score integer not null default 50 check (lead_score >= 0 and lead_score <= 100);
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'dm_campaign_leads' and column_name = 'notes') then
    alter table public.dm_campaign_leads add column notes text default '';
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'dm_campaign_leads' and column_name = 'updated_at') then
    alter table public.dm_campaign_leads add column updated_at timestamptz not null default now();
  end if;
end $$;

-- 4. Indexes for high performance
create index if not exists dm_campaigns_user_id_idx on public.dm_campaigns(user_id);
create index if not exists dm_campaigns_platform_idx on public.dm_campaigns(platform);
create index if not exists dm_campaign_leads_campaign_id_idx on public.dm_campaign_leads(campaign_id);
create index if not exists dm_campaign_leads_status_idx on public.dm_campaign_leads(status);
create index if not exists dm_campaign_leads_lead_score_idx on public.dm_campaign_leads(lead_score);
create index if not exists dm_campaign_leads_created_at_idx on public.dm_campaign_leads(created_at desc);

-- 5. Updated_at Trigger
create or replace function public.set_dm_crm_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dm_campaigns_updated_at on public.dm_campaigns;
create trigger dm_campaigns_updated_at
before update on public.dm_campaigns
for each row
execute function public.set_dm_crm_updated_at();

drop trigger if exists dm_campaign_leads_updated_at on public.dm_campaign_leads;
create trigger dm_campaign_leads_updated_at
before update on public.dm_campaign_leads
for each row
execute function public.set_dm_crm_updated_at();

-- 6. Row Level Security
alter table public.dm_campaigns enable row level security;
alter table public.dm_campaign_leads enable row level security;

-- Policies for dm_campaigns
drop policy if exists "Users can view their own campaigns" on public.dm_campaigns;
create policy "Users can view their own campaigns"
on public.dm_campaigns for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own campaigns" on public.dm_campaigns;
create policy "Users can insert their own campaigns"
on public.dm_campaigns for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own campaigns" on public.dm_campaigns;
create policy "Users can update their own campaigns"
on public.dm_campaigns for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own campaigns" on public.dm_campaigns;
create policy "Users can delete their own campaigns"
on public.dm_campaigns for delete
using (auth.uid() = user_id);

-- Policies for dm_campaign_leads
drop policy if exists "Users can view leads of their campaigns" on public.dm_campaign_leads;
create policy "Users can view leads of their campaigns"
on public.dm_campaign_leads for select
using (
  exists (
    select 1 from public.dm_campaigns c
    where c.id = dm_campaign_leads.campaign_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists "Users can insert leads into their campaigns" on public.dm_campaign_leads;
create policy "Users can insert leads into their campaigns"
on public.dm_campaign_leads for insert
with check (
  exists (
    select 1 from public.dm_campaigns c
    where c.id = dm_campaign_leads.campaign_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists "Users can update leads of their campaigns" on public.dm_campaign_leads;
create policy "Users can update leads of their campaigns"
on public.dm_campaign_leads for update
using (
  exists (
    select 1 from public.dm_campaigns c
    where c.id = dm_campaign_leads.campaign_id
      and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.dm_campaigns c
    where c.id = dm_campaign_leads.campaign_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete leads of their campaigns" on public.dm_campaign_leads;
create policy "Users can delete leads of their campaigns"
on public.dm_campaign_leads for delete
using (
  exists (
    select 1 from public.dm_campaigns c
    where c.id = dm_campaign_leads.campaign_id
      and c.user_id = auth.uid()
  )
);