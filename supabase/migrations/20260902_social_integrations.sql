-- ============================================================
-- KoraSpace Migration: 20260902_social_integrations.sql
-- Supported platforms, social accounts, metrics, inbox, posts,
-- campaigns, bots, messaging, trends, and AI persona.
-- ============================================================

do $$ begin
  if not exists (select 1 from pg_type where typname = 'social_platform') then
    create type social_platform as enum (
      'instagram','youtube','x','linkedin','facebook','threads',
      'snapchat','reddit','telegram','whatsapp'
    );
  end if;
end $$;

-- ── CONNECTED SOCIAL ACCOUNTS ───────────────────────────────
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform social_platform not null,
  account_type text not null default 'personal'
    check (account_type in ('personal','business','creator','page','channel','bot')),
  external_id text not null,
  handle text,
  display_name text,
  avatar_url text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text[] not null default '{}',
  status text not null default 'connected'
    check (status in ('connected','expired','revoked','error')),
  followers int not null default 0,
  following int not null default 0,
  runs_ads boolean not null default false,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  meta jsonb not null default '{}'::jsonb,
  unique (user_id, platform, external_id)
);
create index if not exists social_accounts_user on public.social_accounts(user_id, platform);
create index if not exists idx_social_accounts_external_id on public.social_accounts(external_id);

-- ── SOCIAL ACCOUNT METRICS (daily performance tracking) ─────
create table if not exists public.social_account_metrics (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.social_accounts(id) on delete cascade,
  date date not null default current_date,
  followers integer not null default 0,
  impressions integer not null default 0,
  engagements integer not null default 0,
  ai_suggestions jsonb default null,
  ai_generated_at timestamptz default null,
  created_at timestamptz not null default now(),
  unique(account_id, date)
);
create index if not exists idx_social_account_metrics_account_date on public.social_account_metrics(account_id, date desc);

-- ── INBOX MESSAGES ──────────────────────────────────────────
create table if not exists public.social_inbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.social_accounts(id) on delete cascade,
  platform social_platform not null,
  thread_id text,
  external_id text,
  external_msg_id text,
  kind text not null default 'comment'
    check (kind in ('dm','comment','mention','reply','group')),
  author_name text,
  sender_id text,
  sender_name text,
  sender_handle text,
  sender_avatar text,
  content text not null,
  is_comment boolean not null default false,
  status text not null default 'unread'
    check (status in ('unread','read','replied','flagged','archived')),
  sentiment text check (sentiment in ('positive','neutral','negative','urgent')),
  category text default 'general',
  assigned_bot text,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists social_inbox_feed on public.social_inbox(user_id, status, received_at desc);

-- ── POSTS + PERFORMANCE SNAPSHOTS ───────────────────────────
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.social_accounts(id) on delete cascade,
  platform social_platform not null,
  external_id text,
  content text not null,
  media_urls text[] not null default '{}',
  post_url text,
  status text not null default 'published'
    check (status in ('draft','scheduled','published','failed')),
  posted_at timestamptz,
  impressions int not null default 0,
  reach int not null default 0,
  likes int not null default 0,
  comments int not null default 0,
  shares int not null default 0,
  clicks int not null default 0,
  engagement numeric(6,3) not null default 0,
  virality_score int not null default 0,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (account_id, external_id)
);
create index if not exists social_posts_perf on public.social_posts(user_id, posted_at desc);

-- ── AD CAMPAIGNS + ANALYTICS ────────────────────────────────
create table if not exists public.social_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.social_accounts(id) on delete cascade,
  platform social_platform not null,
  external_id text,
  name text not null,
  objective text,
  status text not null default 'active'
    check (status in ('active','paused','ended','draft')),
  currency text not null default 'NGN',
  budget numeric(14,2) not null default 0,
  spend numeric(14,2) not null default 0,
  revenue numeric(14,2) not null default 0,
  impressions int not null default 0,
  clicks int not null default 0,
  conversions int not null default 0,
  ctr numeric(6,3) not null default 0,
  cpc numeric(12,2) not null default 0,
  roas numeric(8,2) not null default 0,
  ab_variant text,
  start_date date,
  end_date date,
  ai_recommendation text,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.social_campaigns add column if not exists revenue numeric(14,2) not null default 0;
create index if not exists social_campaigns_user on public.social_campaigns(user_id, status);

-- ── SOCIAL BOTS (per connected account / workspace) ─────────
create table if not exists public.social_bots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid references public.social_accounts(id) on delete cascade,
  platform social_platform,
  name text not null,
  kind text not null
    check (kind in ('ghost','engagement','repurpose','monetize','triage','messaging','scheduler','summarizer')),
  role text default 'general',
  status text not null default 'paused' check (status in ('active','paused')),
  autonomy text not null default 'assist' check (autonomy in ('assist','auto')),
  actions_count int not null default 0,
  last_run_at timestamptz,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists social_bots_user on public.social_bots(user_id);
create index if not exists idx_social_bots_user_id_status on public.social_bots(user_id, status);

-- ── MANAGED CHATS (Telegram / WhatsApp groups + DMs) ────────
create table if not exists public.managed_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.social_accounts(id) on delete cascade,
  platform social_platform not null,
  chat_id text not null,
  chat_type text not null default 'group' check (chat_type in ('dm','group','channel')),
  title text,
  flagged_important boolean not null default false,
  auto_reply_enabled boolean not null default false,
  auto_reply_prompt text,
  summarize_enabled boolean not null default false,
  last_summary text,
  last_summary_at timestamptz,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (account_id, chat_id)
);

-- ── SCHEDULED MESSAGES ──────────────────────────────────────
create table if not exists public.scheduled_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.social_accounts(id) on delete cascade,
  chat_id uuid references public.managed_chats(id) on delete cascade,
  platform social_platform not null,
  target text,
  body text not null,
  media_url text,
  send_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','sent','failed','cancelled')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists scheduled_messages_due on public.scheduled_messages(status, send_at);

-- ── NICHE TRENDS ────────────────────────────────────────────
create table if not exists public.social_trends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  persona text,
  niche text,
  ecosystem text,
  topic text not null,
  summary text,
  source_url text,
  source_name text,
  score int,
  momentum text,
  relevant_platforms text[] not null default '{}',
  suggested_account_id uuid references public.social_accounts(id) on delete set null,
  draft text,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '12 hours')
);
create index if not exists social_trends_scope on public.social_trends(user_id, expires_at desc);

-- ── AI PERSONA ──────────────────────────────────────────────
create table if not exists public.ai_persona (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  tone_summary text,
  style_traits jsonb not null default '{}'::jsonb,
  sample_count int not null default 0,
  updated_at timestamptz not null default now()
);

-- ── AI MESSAGE MEMORY ───────────────────────────────────────
create table if not exists public.ai_message_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null default 'chat' check (source in ('chat','inbox','dm','group')),
  platform text,
  role text not null check (role in ('user','contact','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists ai_message_memory_user on public.ai_message_memory(user_id, created_at desc);

-- ── ROW-LEVEL SECURITY ──────────────────────────────────────
alter table public.social_accounts       enable row level security;
alter table public.social_account_metrics enable row level security;
alter table public.social_inbox           enable row level security;
alter table public.social_posts           enable row level security;
alter table public.social_campaigns       enable row level security;
alter table public.social_bots            enable row level security;
alter table public.managed_chats          enable row level security;
alter table public.scheduled_messages     enable row level security;
alter table public.social_trends          enable row level security;
alter table public.ai_persona             enable row level security;
alter table public.ai_message_memory      enable row level security;

do $$ begin
  create policy "own social_accounts" on public.social_accounts for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own social_account_metrics" on public.social_account_metrics for all
    using (account_id in (select id from public.social_accounts where user_id = auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own social_inbox" on public.social_inbox for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own social_posts" on public.social_posts for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own social_campaigns" on public.social_campaigns for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own social_bots" on public.social_bots for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own managed_chats" on public.managed_chats for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own scheduled_messages" on public.scheduled_messages for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own social_trends" on public.social_trends for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own ai_persona" on public.ai_persona for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own ai_message_memory" on public.ai_message_memory for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Enable Realtime
do $$ begin
  alter publication supabase_realtime add table public.social_inbox;
exception when duplicate_object then null; when undefined_object then null; end $$;
