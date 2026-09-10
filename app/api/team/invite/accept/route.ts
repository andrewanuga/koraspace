import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const email = user.email.trim().toLowerCase();
    const admin = createAdminClient();

    // Find pending invitations for the authenticated email
    const { data: invitations, error } = await admin
      .from("team_invitations")
      .select("id, workspace_id, email, role, status, expires_at")
      .eq("email", email)
      .eq("status", "pending");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!invitations?.length) {
      return NextResponse.json({ accepted: 0 });
    }

    let accepted = 0;

    for (const invitation of invitations) {
      if (new Date(invitation.expires_at).getTime() < Date.now()) {
        await admin
          .from("team_invitations")
          .update({ status: "expired" })
          .eq("id", invitation.id);
        continue;
      }

      // Check existing membership to prevent duplicates
      const { data: existing } = await admin
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", invitation.workspace_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existing) {
        const { error: memberError } = await admin
          .from("workspace_members")
          .insert({
            workspace_id: invitation.workspace_id,
            user_id: user.id,
            role: invitation.role,
          });

        if (memberError) {
          continue;
        }
      }

      await admin
        .from("team_invitations")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", invitation.id);

      await admin.from("team_activity_logs").insert({
        workspace_id: invitation.workspace_id,
        actor_id: user.id,
        action: "accepted an invitation to join the workspace",
      });

      accepted++;
    }

    return NextResponse.json({ accepted });
  } catch (error: any) {
    console.error("Error in /api/team/invite/accept:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process invitations." },
      { status: 500 }
    );
  }
}
