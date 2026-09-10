import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TeamRole = "owner" | "admin" | "manager" | "member";

function getStatus(lastActiveAt: string | null) {
  if (!lastActiveAt) {
    return "offline";
  }

  const minutes = (Date.now() - new Date(lastActiveAt).getTime()) / 60000;

  if (minutes <= 10) {
    return "online";
  }

  if (minutes <= 90) {
    return "away";
  }

  return "offline";
}

async function getWorkspaceContext() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      workspaceId: null,
      role: null,
    };
  }

  // Personal workspace
  const { data: ownMembership } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("workspace_id", user.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (ownMembership) {
    return {
      supabase,
      user,
      workspaceId: user.id,
      role: (ownMembership.role as TeamRole) ?? "owner",
    };
  }

  // Collaborative workspace
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    supabase,
    user,
    workspaceId: membership?.workspace_id ?? user.id,
    role: (membership?.role as TeamRole) ?? "owner",
  };
}

export async function GET() {
  const { supabase, user, workspaceId, role: currentRole } = await getWorkspaceContext();

  if (!user || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Touch team presence
  try {
    await supabase.rpc("touch_team_presence");
  } catch (err) {
    // Ignore RPC missing in local test
  }

  // Query workspace members
  const { data: memberships, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, user_id, role, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const memberIds = (memberships ?? []).map((m) => m.user_id).filter(Boolean);
  if (!memberIds.includes(workspaceId)) {
    memberIds.push(workspaceId);
  }

  const { data: profiles } = memberIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, department, last_active_at")
        .in("id", memberIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  // Get auth emails safely via admin client if available
  let emailMap = new Map<string, string>();
  try {
    const admin = createAdminClient();
    const { data: authData } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    emailMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  } catch (err) {
    console.error("Admin user list fallback:", err);
  }

  // Ensure owner is represented if not in workspace_members
  const ownerInMembers = (memberships ?? []).some((m) => m.user_id === workspaceId);
  const rawMemberships = [...(memberships ?? [])];

  if (!ownerInMembers) {
    rawMemberships.unshift({
      workspace_id: workspaceId,
      user_id: workspaceId,
      role: "owner",
      created_at: new Date().toISOString(),
    });
  }

  const members = rawMemberships.map((membership) => {
    const profile = profileMap.get(membership.user_id);
    const lastActiveAt = profile?.last_active_at ?? null;

    return {
      userId: membership.user_id,
      fullName: profile?.full_name ?? profile?.username ?? "Team member",
      email: emailMap.get(membership.user_id) || (membership.user_id === user.id ? user.email : "member@workspace.com"),
      avatarUrl: profile?.avatar_url ?? null,
      role: (membership.role as TeamRole) || "member",
      department: profile?.department ?? "Marketing",
      status: getStatus(lastActiveAt),
      lastActiveAt,
      joinedAt: membership.created_at,
    };
  });

  // Invitations
  const { data: invitations } = await supabase
    .from("team_invitations")
    .select("id, email, role, status, created_at, expires_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);

  const now = Date.now();
  const formattedInvitations = (invitations ?? []).map((invitation) => {
    const expired =
      invitation.status === "pending" &&
      new Date(invitation.expires_at).getTime() < now;

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role as TeamRole,
      status: expired ? "expired" : invitation.status,
      createdAt: invitation.created_at,
      expiresAt: invitation.expires_at,
    };
  });

  // Activity
  const { data: activityRows } = await supabase
    .from("team_activity_logs")
    .select("id, actor_id, action, target, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);

  const actorIds = (activityRows ?? []).map((a) => a.actor_id).filter(Boolean);
  const { data: actors } = actorIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", actorIds)
    : { data: [] };

  const actorMap = new Map((actors ?? []).map((a) => [a.id, a]));

  const activity = (activityRows ?? []).map((item) => {
    const actor = actorMap.get(item.actor_id);
    return {
      id: item.id,
      actorName: actor?.full_name ?? "Team member",
      actorAvatarUrl: actor?.avatar_url ?? null,
      action: item.action,
      target: item.target,
      createdAt: item.created_at,
    };
  });

  return NextResponse.json({
    workspaceId,
    currentRole: currentRole || "owner",
    members,
    invitations: formattedInvitations,
    activity,
  });
}
