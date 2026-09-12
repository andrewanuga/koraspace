-- ============================================================================
-- KORASPACE REPURPOSE FEATURE SCHEMA (v1.65)
-- Migration: 20260907_repurpose_engine.sql
-- Projects, Outputs, AI Analysis, Transcripts & RLS
-- ============================================================================

-- 1. Repurpose Projects Table
create table if not exists public.repurpose_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid,
  title text not null default 'Untitled Repurpose Project',
  source_type text not null check (
    source_type in ('upload', 'library', 'text', 'url')
  ),
  source_name text,
  source_url text,
  source_content text,
  source_metadata jsonb default '{}'::jsonb,
  transcript text,
  transcript_status text default 'none' check (
    transcript_status in ('none', 'processing', 'completed', 'failed')
  ),
  status text not null default 'draft' check (
    status in ('draft', 'analyzing', 'ready', 'generating', 'completed', 'failed')
  ),
  ai_analysis jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Repurpose Outputs Table
create table if not exists public.repurpose_outputs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.repurpose_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  content_type text not null,
  title text,
  content text,
  caption text,
  hashtags text[] default '{}',
  metadata jsonb default '{}'::jsonb,
  status text not null default 'draft' check (
    status in ('draft', 'saved', 'scheduled', 'published')
  ),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Automatic updated_at Triggers
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists repurpose_projects_updated_at on public.repurpose_projects;
create trigger repurpose_projects_updated_at
  before update on public.repurpose_projects
  for each row execute procedure public.handle_updated_at();

drop trigger if exists repurpose_outputs_updated_at on public.repurpose_outputs;
create trigger repurpose_outputs_updated_at
  before update on public.repurpose_outputs
  for each row execute procedure public.handle_updated_at();

-- 4. Row Level Security (RLS)
alter table public.repurpose_projects enable row level security;
alter table public.repurpose_outputs enable row level security;

do $$ begin
  create policy "Users can view their repurpose projects"
    on public.repurpose_projects for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can create repurpose projects"
    on public.repurpose_projects for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update their repurpose projects"
    on public.repurpose_projects for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can delete their repurpose projects"
    on public.repurpose_projects for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can view their repurpose outputs"
    on public.repurpose_outputs for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can create repurpose outputs"
    on public.repurpose_outputs for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update their repurpose outputs"
    on public.repurpose_outputs for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can delete their repurpose outputs"
    on public.repurpose_outputs for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create index if not exists idx_repurpose_projects_user_id on public.repurpose_projects(user_id, updated_at desc);
create index if not exists idx_repurpose_outputs_project_id on public.repurpose_outputs(project_id);
create index if not exists idx_repurpose_outputs_user_id on public.repurpose_outputs(user_id);
