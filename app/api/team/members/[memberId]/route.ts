import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteParams {
  params: Promise<{ memberId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { memberId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, department } = body;

    const validRoles = ["owner", "admin", "manager", "member"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Check target membership record
    const { data: targetMember, error: targetErr } = await admin
      .from("workspace_members")
      .select("id, workspace_id, user_id, role")
      .eq("id", memberId)
      .single();

    if (targetErr || !targetMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const workspaceId = targetMember.workspace_id;

    // Verify caller is owner or admin in this workspace
    const { data: callerMember } = await admin
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .maybeSingle();

    const isOwner = workspaceId === user.id || callerMember?.role === "owner";
    const isAdmin = callerMember?.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
    }

    // Only owner can assign/demote owner role or edit other admins
    if (targetMember.role === "owner" && !isOwner) {
      return NextResponse.json({ error: "Forbidden: only workspace owner can modify an owner" }, { status: 403 });
    }

    if (role) {
      const { error: updateErr } = await admin
        .from("workspace_members")
        .update({ role })
        .eq("id", memberId);

      if (updateErr) throw updateErr;

      // Log activity
      await admin.from("team_activity_logs").insert({
        workspace_id: workspaceId,
        actor_id: user.id,
        action: "role_updated",
        target: `Role updated to ${role}`,
        details: { target_member_id: memberId, target_user_id: targetMember.user_id, new_role: role },
      });
    }

    if (department !== undefined) {
      await admin
        .from("profiles")
        .update({ department })
        .eq("id", targetMember.user_id);
    }

    return NextResponse.json({ success: true, memberId, role, department });
  } catch (err: any) {
    console.error("Error updating team member:", err);
    return NextResponse.json({ error: err.message || "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { memberId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    // Check target membership record
    const { data: targetMember, error: targetErr } = await admin
      .from("workspace_members")
      .select("id, workspace_id, user_id, role")
      .eq("id", memberId)
      .single();

    if (targetErr || !targetMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const workspaceId = targetMember.workspace_id;

    // Cannot remove workspace root owner
    if (targetMember.user_id === workspaceId) {
      return NextResponse.json({ error: "Cannot remove workspace root owner" }, { status: 400 });
    }

    // Verify caller permission
    const { data: callerMember } = await admin
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .maybeSingle();

    const isOwner = workspaceId === user.id || callerMember?.role === "owner";
    const isAdmin = callerMember?.role === "admin";
    const isSelf = targetMember.user_id === user.id;

    if (!isOwner && !isAdmin && !isSelf) {
      return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
    }

    if (targetMember.role === "owner" && !isOwner) {
      return NextResponse.json({ error: "Forbidden: only workspace owner can remove another owner" }, { status: 403 });
    }

    const { error: delErr } = await admin
      .from("workspace_members")
      .delete()
      .eq("id", memberId);

    if (delErr) throw delErr;

    // Log activity
    await admin.from("team_activity_logs").insert({
      workspace_id: workspaceId,
      actor_id: user.id,
      action: isSelf ? "member_left" : "member_removed",
      target: targetMember.user_id,
      details: { target_member_id: memberId, target_user_id: targetMember.user_id },
    });

    return NextResponse.json({ success: true, removed: memberId });
  } catch (err: any) {
    console.error("Error removing team member:", err);
    return NextResponse.json({ error: err.message || "Failed to remove member" }, { status: 500 });
  }
}
