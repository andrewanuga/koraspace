-- ============================================================
-- KoraSpace Migration: 20260904_admin_and_notifications.sql
-- System Broadcasts, Feature Flags, and User Notifications
-- ============================================================

-- Helper: is_admin function if not already defined
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and plan = 'team'
  );
$$;

-- ── System Broadcasts ─────────────────────────────────────────
create table if not exists public.system_broadcasts (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  type text not null default 'info'
    check (type in ('info', 'warning', 'critical')),
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

alter table public.system_broadcasts enable row level security;

do $$ begin
  create policy "anyone can read active broadcasts"
    on public.system_broadcasts for select using (is_active = true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admins manage broadcasts"
    on public.system_broadcasts for all using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

-- ── Global Feature Flags ──────────────────────────────────────
create table if not exists public.feature_flags (
  key text primary key,
  is_enabled boolean not null default false,
  description text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.feature_flags enable row level security;

do $$ begin
  create policy "anyone can read feature flags"
    on public.feature_flags for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admins manage feature flags"
    on public.feature_flags for all using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

insert into public.feature_flags (key, is_enabled, description) values
  ('ghost_mode_enabled', true, 'Toggle the Ghost Mode autonomous agent feature'),
  ('auto_scheduler', true, 'Toggle the ability to auto-schedule posts'),
  ('competitor_spy', true, 'Toggle the competitor analysis tools')
on conflict (key) do nothing;

-- ── User Notifications ───────────────────────────────────────
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  body text not null,
  type text not null default 'system',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.user_notifications enable row level security;

do $$ begin
  create policy "users can read their own notifications"
    on public.user_notifications for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "users can update their own notifications"
    on public.user_notifications for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "admins manage user_notifications"
    on public.user_notifications for all using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.user_notifications;
exception when duplicate_object then null; when undefined_object then null; end $$;