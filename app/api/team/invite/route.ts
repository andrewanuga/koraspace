import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
import { teamInviteSchema } from "@/lib/security/schemas";
const INVITABLE_ROLES = new Set(["admin", "manager", "member"]);

async function getContext() {
  const session = await auth();
    const user = session?.user;

  if (!user) {
    return {
      supabase,
      user: null,
      workspaceId: null,
      role: null,
    };
  }

  const { data: own } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("workspace_id", user.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (own) {
    return {
      supabase,
      user,
      workspaceId: user.id,
      role: own.role,
    };
  }

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
    role: membership?.role ?? "owner",
  };
}

export async function POST(request: NextRequest) {
  const { supabase, user, workspaceId, role: actorRole } = await getContext();

  if (!user || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 20 invite requests/min per user.
  const guard = await checkRequest(request, requestKey(request, user.id), 20);
  if (guard) return guard;

  if (actorRole !== "owner" && actorRole !== "admin") {
    return NextResponse.json(
      { error: "Only owners and admins can invite members." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = teamInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.issues.map((i) => `${i.path}: ${i.message}`) },
      { status: 400 }
    );
  }
  const { email, role } = parsed.data;

  if (email === user.email?.toLowerCase()) {
    return NextResponse.json(
      { error: "You are already part of this workspace." },
      { status: 409 }
    );
  }

  // Check existing pending invitation
  const { data: pendingInvite } = await supabase
    .from("team_invitations")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingInvite) {
    return NextResponse.json(
      { error: "There is already a pending invitation for this email." },
      { status: 409 }
    );
  }
  // Search for an existing KoraSpace account
  const { data: users, error: usersError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersError) {
    return NextResponse.json(
      { error: "Unable to check existing account status." },
      { status: 500 }
    );
  }

  const existingUser = users.users.find(
    (candidate) => candidate.email?.toLowerCase() === email
  );

  // Existing KoraSpace user: Add immediately
  if (existingUser) {
    const { data: alreadyMember } = await supabase
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", workspaceId)
      .eq("user_id", existingUser.id)
      .maybeSingle();

    if (alreadyMember) {
      return NextResponse.json(
        { error: "This person is already a team member." },
        { status: 409 }
      );
    }

    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspaceId,
        user_id: existingUser.id,
        role,
      });

    if (memberError) {
      return NextResponse.json(
        { error: memberError.message },
        { status: 500 }
      );
    }

    await admin.from("team_invitations").insert({
      workspace_id: workspaceId,
      email,
      invited_by: user.id,
      role,
      status: "accepted",
      accepted_at: new Date().toISOString(),
    });

    await admin.from("team_activity_logs").insert({
      workspace_id: workspaceId,
      actor_id: user.id,
      action: "added",
      target: email,
    });

    return NextResponse.json({
      success: true,
      type: "added",
      message: "Team member added successfully.",
    });
  }

  // New user: Send Supabase invitation email
  const redirectTo = `${
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  }/auth/callback?next=/dashboard/team`;

  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        invited_workspace_id: workspaceId,
        invited_workspace_role: role,
      },
    });

  if (inviteError || !invited.user) {
    return NextResponse.json(
      { error: inviteError?.message ?? "Unable to send invitation." },
      { status: 500 }
    );
  }

  const { data: invitation, error: invitationError } = await admin
    .from("team_invitations")
    .insert({
      workspace_id: workspaceId,
      email,
      invited_by: user.id,
      role,
      status: "pending",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("id")
    .single();

  if (invitationError) {
    return NextResponse.json(
      { error: invitationError.message },
      { status: 500 }
    );
  }

  await admin.from("team_activity_logs").insert({
    workspace_id: workspaceId,
    actor_id: user.id,
    action: "invited",
    target: email,
  });

  return NextResponse.json({
    success: true,
    type: "invited",
    invitationId: invitation.id,
    message: "Invitation sent successfully.",
  });
}

export async function DELETE(request: NextRequest) {
  const { supabase, user, workspaceId, role } = await getContext();

  if (!user || !workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (role !== "owner" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Invitation id is required." },
      { status: 400 }
    );
  }

  const { data: invitation } = await supabase
    .from("team_invitations")
    .select("id, email, status")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!invitation) {
    return NextResponse.json(
      { error: "Invitation not found." },
      { status: 404 }
    );
  }

  if (invitation.status !== "pending") {
    return NextResponse.json(
      { error: "Invitation is no longer pending." },
      { status: 409 }
    );
  }
  const { error } = await admin
    .from("team_invitations")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await admin.from("team_activity_logs").insert({
    workspace_id: workspaceId,
    actor_id: user.id,
    action: "revoked the invitation for",
    target: invitation.email,
  });

  return NextResponse.json({ success: true });
}

