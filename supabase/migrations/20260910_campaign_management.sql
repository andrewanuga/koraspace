-- ============================================================
-- KoraSpace Campaign Management Enhancements
-- ============================================================

-- Ensure columns exist on dm_campaigns
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'dm_campaigns' and column_name = 'audience_filter') then
    alter table public.dm_campaigns add column audience_filter jsonb not null default '{}'::jsonb;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'dm_campaigns' and column_name = 'message_sequence') then
    alter table public.dm_campaigns add column message_sequence jsonb not null default '[]'::jsonb;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'dm_campaigns' and column_name = 'updated_at') then
    alter table public.dm_campaigns add column updated_at timestamptz not null default now();
  end if;
end $$;

-- Performance Indexes
create index if not exists idx_dm_campaigns_user_id_created_at
  on public.dm_campaigns(user_id, created_at desc);

create index if not exists idx_dm_campaigns_user_id_status
  on public.dm_campaigns(user_id, status);

create index if not exists idx_dm_campaign_leads_campaign_id
  on public.dm_campaign_leads(campaign_id);

create index if not exists idx_dm_campaign_leads_campaign_status
  on public.dm_campaign_leads(campaign_id, status);

create index if not exists idx_dm_campaign_leads_last_contacted
  on public.dm_campaign_leads(last_contacted_at);

-- Ensure RLS is enabled
alter table public.dm_campaigns enable row level security;
alter table public.dm_campaign_leads enable row level security;
