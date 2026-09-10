-- ============================================================
-- KoraSpace Team Management (v1.70)
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- TEAM INVITATIONS
-- ------------------------------------------------------------

create table if not exists public.team_invitations (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.profiles(id)
    on delete cascade,

  email text not null,

  invited_by uuid not null
    references auth.users(id)
    on delete cascade,

  role text not null default 'member'
    check (role in ('admin', 'manager', 'member')),

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'accepted',
        'revoked',
        'expired'
      )
    ),

  created_at timestamptz not null default now(),

  expires_at timestamptz not null
    default (now() + interval '7 days'),

  accepted_at timestamptz,

  revoked_at timestamptz
);

create index if not exists team_invitations_workspace_idx
on public.team_invitations (
  workspace_id,
  created_at desc
);

create unique index if not exists team_invitations_pending_unique
on public.team_invitations (
  workspace_id,
  lower(email)
)
where status = 'pending';


-- ------------------------------------------------------------
-- TEAM ACTIVITY
-- ------------------------------------------------------------

create table if not exists public.team_activity_logs (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.profiles(id)
    on delete cascade,

  actor_id uuid not null
    references auth.users(id)
    on delete cascade,

  action text not null,

  target text,

  created_at timestamptz not null default now()
);

create index if not exists team_activity_workspace_idx
on public.team_activity_logs (
  workspace_id,
  created_at desc
);


-- ------------------------------------------------------------
-- PROFILE TEAM FIELDS
-- ------------------------------------------------------------

alter table public.profiles
add column if not exists last_active_at timestamptz;

alter table public.profiles
add column if not exists department text;


-- ------------------------------------------------------------
-- WORKSPACE ACCESS HELPERS
-- ------------------------------------------------------------

create or replace function public.is_team_workspace_member(
  p_workspace_id uuid
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    p_workspace_id = auth.uid()
    or exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = p_workspace_id
        and wm.user_id = auth.uid()
    );
$$;


create or replace function public.team_workspace_role(
  p_workspace_id uuid
)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (
      select wm.role::text
      from public.workspace_members wm
      where wm.workspace_id = p_workspace_id
        and wm.user_id = auth.uid()
      limit 1
    ),
    case
      when p_workspace_id = auth.uid()
      then 'owner'
      else null
    end
  );
$$;


grant execute on function
public.is_team_workspace_member(uuid)
to authenticated;

grant execute on function
public.team_workspace_role(uuid)
to authenticated;


-- ------------------------------------------------------------
-- INVITATION RLS
-- ------------------------------------------------------------

alter table public.team_invitations
enable row level security;

drop policy if exists team_invites_select on public.team_invitations;
create policy team_invites_select
on public.team_invitations
for select
to authenticated
using (
  public.is_team_workspace_member(workspace_id)
);

drop policy if exists team_invites_insert on public.team_invitations;
create policy team_invites_insert
on public.team_invitations
for insert
to authenticated
with check (
  public.team_workspace_role(workspace_id) in ('owner', 'admin')
  and invited_by = auth.uid()
);

drop policy if exists team_invites_update on public.team_invitations;
create policy team_invites_update
on public.team_invitations
for update
to authenticated
using (
  public.team_workspace_role(workspace_id) in ('owner', 'admin')
)
with check (
  public.team_workspace_role(workspace_id) in ('owner', 'admin')
);


-- ------------------------------------------------------------
-- ACTIVITY RLS
-- ------------------------------------------------------------

alter table public.team_activity_logs
enable row level security;

drop policy if exists team_activity_select on public.team_activity_logs;
create policy team_activity_select
on public.team_activity_logs
for select
to authenticated
using (
  public.is_team_workspace_member(workspace_id)
);

drop policy if exists team_activity_insert on public.team_activity_logs;
create policy team_activity_insert
on public.team_activity_logs
for insert
to authenticated
with check (
  public.is_team_workspace_member(workspace_id)
  and actor_id = auth.uid()
);


-- ------------------------------------------------------------
-- PRESENCE
-- ------------------------------------------------------------

create or replace function public.touch_team_presence()
returns void
language sql
security invoker
as $$
  update public.profiles
  set last_active_at = now()
  where id = auth.uid();
$$;

grant execute on function
public.touch_team_presence()
to authenticated;
