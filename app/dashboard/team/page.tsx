import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TeamClient } from "./TeamClient";

export default async function TeamPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, persona, full_name, role, department, avatar_url, username")
    .eq("id", user.id)
    .single();

  const admin = createAdminClient();

  // Touch current user presence
  try {
    await admin.rpc("touch_team_presence", { p_user_id: user.id });
  } catch {
    // Graceful fallback
    await admin
      .from("profiles")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", user.id);
  }

  const workspaceId = user.id;

  // 1. Fetch workspace members
  const { data: rawMembers } = await admin
    .from("workspace_members")
    .select(
      `
      id,
      workspace_id,
      user_id,
      role,
      created_at
    `
    )
    .eq("workspace_id", workspaceId);

  // Collect member user IDs
  const memberUserIds = new Set<string>();
  memberUserIds.add(user.id);
  rawMembers?.forEach((m) => memberUserIds.add(m.user_id));

  // Fetch profiles for all members
  const { data: memberProfiles } = await admin
    .from("profiles")
    .select("id, full_name, username, avatar_url, role, department, last_active_at")
    .in("id", Array.from(memberUserIds));

  const profileMap = new Map((memberProfiles || []).map((p) => [p.id, p]));

  // Ensure owner is represented
  const membersList = [...(rawMembers || [])];
  const hasOwner = membersList.some((m) => m.user_id === user.id);
  if (!hasOwner) {
    membersList.unshift({
      id: `owner-${user.id}`,
      workspace_id: user.id,
      user_id: user.id,
      role: "owner",
      created_at: new Date().toISOString(),
    });
  }

  const members = membersList.map((m) => {
    const prof = profileMap.get(m.user_id);
    const lastActive = prof?.last_active_at ? new Date(prof.last_active_at) : null;
    let status: "online" | "away" | "offline" = "offline";
    if (lastActive) {
      const diffMinutes = (Date.now() - lastActive.getTime()) / (1000 * 60);
      if (diffMinutes <= 10) status = "online";
      else if (diffMinutes <= 90) status = "away";
    }

    return {
      id: m.id,
      workspace_id: m.workspace_id,
      user_id: m.user_id,
      role: m.role || "member",
      full_name: prof?.full_name || prof?.username || "Team Member",
      username: prof?.username || "member",
      avatar_url: prof?.avatar_url || null,
      department: prof?.department || "Marketing",
      last_active_at: prof?.last_active_at || null,
      created_at: m.created_at,
      status,
      is_current_user: m.user_id === user.id,
    };
  });

  // 2. Fetch pending invitations
  const { data: invitations } = await admin
    .from("team_invitations")
    .select("id, email, role, department, status, created_at, expires_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // 3. Fetch recent activity logs
  const { data: activityLogs } = await admin
    .from("team_activity_logs")
    .select(
      `
      id,
      actor_id,
      action,
      details,
      created_at
    `
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(20);

  const actorIds = Array.from(new Set(activityLogs?.map((l) => l.actor_id) || []));
  const { data: actorProfiles } = actorIds.length
    ? await admin.from("profiles").select("id, full_name, avatar_url").in("id", actorIds)
    : { data: [] };

  const actorMap = new Map((actorProfiles || []).map((a) => [a.id, a]));

  const formattedActivity = (activityLogs || []).map((l) => ({
    id: l.id,
    actor_name: actorMap.get(l.actor_id)?.full_name || "Team Member",
    actor_avatar: actorMap.get(l.actor_id)?.avatar_url || null,
    action: l.action,
    details: l.details,
    created_at: l.created_at,
  }));

  return (
    <TeamClient
      currentUser={{
        id: user.id,
        name: profile?.full_name || "Marketer",
        email: user.email || "",
        role: "owner",
        avatar_url: profile?.avatar_url || null,
      }}
      initialMembers={members}
      initialInvitations={invitations || []}
      initialActivity={formattedActivity}
    />
  );
}
