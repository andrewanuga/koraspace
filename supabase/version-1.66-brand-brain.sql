-- =========================================================
-- KORASPACE PERSONAL BRAND BRAIN SCHEMA (v1.66)
-- =========================================================

-- 1. BRAND PROFILES
create table if not exists public.brand_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  username text,
  avatar_url text,
  role text default 'Creator',
  niche text,
  target_audience text,
  location text default 'Remote',
  bio text,
  mission text,
  voice_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- 2. CONTENT PREFERENCES
create table if not exists public.brand_content_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  created_at timestamptz default now(),
  unique(user_id, label)
);

-- 3. WRITING STYLE
create table if not exists public.brand_writing_styles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  created_at timestamptz default now(),
  unique(user_id, label)
);

-- 4. BRAND MEMORY
create table if not exists public.brand_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  category text default 'general',
  enabled boolean default true,
  importance integer default 5,
  source text default 'manual',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. KNOWLEDGE BASE
create table if not exists public.brand_knowledge_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  type text default 'note',
  source_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. AI INSIGHTS
create table if not exists public.brand_ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  insight_type text not null,
  title text not null,
  description text,
  priority text default 'medium',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- =========================================================
-- UPDATED AT TRIGGER
-- =========================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists brand_profiles_updated_at on public.brand_profiles;
create trigger brand_profiles_updated_at
  before update on public.brand_profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists brand_memories_updated_at on public.brand_memories;
create trigger brand_memories_updated_at
  before update on public.brand_memories
  for each row execute procedure public.handle_updated_at();

drop trigger if exists brand_knowledge_updated_at on public.brand_knowledge_items;
create trigger brand_knowledge_updated_at
  before update on public.brand_knowledge_items
  for each row execute procedure public.handle_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.brand_profiles enable row level security;
alter table public.brand_content_preferences enable row level security;
alter table public.brand_writing_styles enable row level security;
alter table public.brand_memories enable row level security;
alter table public.brand_knowledge_items enable row level security;
alter table public.brand_ai_insights enable row level security;

-- Policies for brand_profiles
create policy "Users can view their brand profile"
  on public.brand_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their brand profile"
  on public.brand_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their brand profile"
  on public.brand_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete their brand profile"
  on public.brand_profiles for delete
  using (auth.uid() = user_id);

-- Policies for content preferences
create policy "Users manage own content preferences"
  on public.brand_content_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies for writing styles
create policy "Users manage own writing styles"
  on public.brand_writing_styles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies for brand memories
create policy "Users manage own memories"
  on public.brand_memories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies for knowledge base
create policy "Users manage own knowledge"
  on public.brand_knowledge_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies for AI insights
create policy "Users view own AI insights"
  on public.brand_ai_insights for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =========================================================
-- INDEXES
-- =========================================================
create index if not exists brand_profiles_user_id_idx on public.brand_profiles(user_id);
create index if not exists brand_memories_user_id_idx on public.brand_memories(user_id);
create index if not exists brand_knowledge_user_id_idx on public.brand_knowledge_items(user_id);
create index if not exists brand_ai_insights_user_id_idx on public.brand_ai_insights(user_id);
