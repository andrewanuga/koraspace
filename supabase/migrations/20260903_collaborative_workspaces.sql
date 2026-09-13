-- ============================================================
-- KoraSpace Migration: 20260903_collaborative_workspaces.sql
-- Teams, workspace members, invites, and collaborator RLS policies.
-- ============================================================

-- 1. Add team to the plan enum in profiles
alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles add constraint profiles_plan_check 
  check (plan in ('free', 'basic', 'pro', 'advanced', 'team'));

-- 2. Create workspace_members table
create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'admin', 'manager', 'member')),
  created_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);

create index if not exists workspace_members_user_id_idx on public.workspace_members(user_id);
create index if not exists workspace_members_workspace_id_idx on public.workspace_members(workspace_id);

-- 3. Create workspace_invites table
create table if not exists public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  role text not null default 'member'
    check (role in ('admin', 'manager', 'member')),
  token text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  unique(workspace_id, email)
);

-- 4. Helper function for RLS
create or replace function public.is_workspace_member(owner_id uuid, check_user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.workspace_members 
    where workspace_id = owner_id and user_id = check_user_id
  );
$$;

-- 5. RLS for workspace_members
alter table public.workspace_members enable row level security;

do $$ begin
  create policy "Owners can see their workspace members"
    on public.workspace_members for select
    using (auth.uid() = workspace_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Members can see peers"
    on public.workspace_members for select
    using (public.is_workspace_member(workspace_id, auth.uid()));
exception when duplicate_object then null; end $$;

-- 6. RLS for workspace_invites
alter table public.workspace_invites enable row level security;

do $$ begin
  create policy "Owners can see their invites"
    on public.workspace_invites for select
    using (auth.uid() = workspace_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Members can see invites"
    on public.workspace_invites for select
    using (public.is_workspace_member(workspace_id, auth.uid()));
exception when duplicate_object then null; end $$;