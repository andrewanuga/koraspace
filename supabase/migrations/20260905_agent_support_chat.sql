-- ============================================================
-- KoraSpace Migration: 20260905_agent_support_chat.sql
-- Support chats, support messages, and support tickets
-- ============================================================

-- 1. Create support_chats table
create table if not exists public.support_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_chats_user_id_idx on public.support_chats(user_id);

-- 2. Create support_messages table
create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.support_chats(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists support_messages_chat_id_idx on public.support_messages(chat_id);
create index if not exists support_messages_created_at_idx on public.support_messages(created_at);

-- 3. Create support_tickets table
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null default 'help'
    check (category in ('bug','feature','help','other')),
  message text not null,
  email text,
  status text not null default 'open'
    check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);

create index if not exists support_tickets_user on public.support_tickets(user_id, created_at desc);

-- 4. RLS
alter table public.support_chats enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_tickets enable row level security;

do $$ begin
  create policy "Users can view their own support chats" 
    on public.support_chats for select 
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can create their own support chats" 
    on public.support_chats for insert 
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update their own support chats"
    on public.support_chats for update
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can view messages in their chats" 
    on public.support_messages for select 
    using (exists (select 1 from public.support_chats where support_chats.id = support_messages.chat_id and support_chats.user_id = auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert messages in their chats" 
    on public.support_messages for insert 
    with check (exists (select 1 from public.support_chats where support_chats.id = support_messages.chat_id and support_chats.user_id = auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own support_tickets" on public.support_tickets for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;