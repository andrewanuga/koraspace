-- ============================================================
-- KoraSpace Migration: 20260906_scheduled_ai_tasks.sql
-- Time-based AI triggers that run autonomously
-- ============================================================

create table if not exists public.scheduled_ai_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  prompt text not null,
  platform text,
  trigger_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'running', 'completed', 'failed')),
  result_text text,
  media_urls text[] default array[]::text[],
  created_at timestamptz not null default now()
);

alter table public.scheduled_ai_tasks add column if not exists media_urls text[] default array[]::text[];

create index if not exists idx_scheduled_ai_tasks_due 
  on public.scheduled_ai_tasks(status, trigger_at);

alter table public.scheduled_ai_tasks enable row level security;

do $$ begin
  create policy "Users manage own scheduled ai tasks"
    on public.scheduled_ai_tasks for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;