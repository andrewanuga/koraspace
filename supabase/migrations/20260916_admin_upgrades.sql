-- ============================================================
-- KORASPACE ADMIN & SECURITY OPERATIONS UPGRADE (v1.0)
-- Migration: 20260916_admin_upgrades.sql
-- ============================================================

-- 1. Helper function: updated is_admin check with fallback
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and (is_admin = true or plan = 'team')
  );
$$;

-- 2. Enhanced support_tickets columns
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'support_tickets' and column_name = 'admin_reply') then
    alter table public.support_tickets add column admin_reply text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'support_tickets' and column_name = 'admin_id') then
    alter table public.support_tickets add column admin_id uuid references public.profiles(id) on delete set null;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'support_tickets' and column_name = 'priority') then
    alter table public.support_tickets add column priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical'));
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'support_tickets' and column_name = 'updated_at') then
    alter table public.support_tickets add column updated_at timestamptz not null default now();
  end if;
end $$;

-- 3. Enhanced system_broadcasts columns
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'system_broadcasts' and column_name = 'target_plan') then
    alter table public.system_broadcasts add column target_plan text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'system_broadcasts' and column_name = 'target_persona') then
    alter table public.system_broadcasts add column target_persona text;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'system_broadcasts' and column_name = 'style') then
    alter table public.system_broadcasts add column style text not null default 'banner' check (style in ('banner', 'toast', 'modal'));
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'system_broadcasts' and column_name = 'link_url') then
    alter table public.system_broadcasts add column link_url text;
  end if;
end $$;

-- 4. Admin RLS policies for support_tickets
do $$ begin
  create policy "admins can view all support tickets"
    on public.support_tickets for select
    using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admins can update all support tickets"
    on public.support_tickets for update
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

-- 5. Additional indexes
create index if not exists idx_support_tickets_status on public.support_tickets (status, created_at desc);
create index if not exists idx_support_tickets_priority on public.support_tickets (priority);
create index if not exists idx_system_broadcasts_active_expires on public.system_broadcasts (is_active, expires_at);
