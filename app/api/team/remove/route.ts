import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getActiveWorkspace } from "@/lib/workspace";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit team modifications: 20 per minute
    const guard = await checkRequest(req, requestKey(req, workspace.workspaceId), 20);
    if (guard) return guard;

    // Enforce least privilege: Only owner or admin/manager can remove members or invites
    if (workspace.role !== "owner" && workspace.role !== "admin" && workspace.role !== "manager") {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to modify workspace membership." },
        { status: 403 }
      );
    }

    const { id, type } = await req.json();
    if (!id || !type) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const workspaceId = workspace.workspaceId;

    if (type === "invite") {
      const { error } = await supabase.from("workspace_invites")
        .delete()
        .eq("id", id)
        .eq("workspace_id", workspaceId);
      if (error) throw error;
    } else if (type === "member") {
      // Prevent deleting the workspace owner
      const { data: targetMember } = await supabase
        .from("workspace_members")
        .select("role")
        .eq("id", id)
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (targetMember?.role === "owner") {
        return NextResponse.json({ error: "Cannot remove the workspace owner." }, { status: 403 });
      }

      const { error } = await supabase.from("workspace_members")
        .delete()
        .eq("id", id)
        .eq("workspace_id", workspaceId);
      if (error) throw error;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to remove" }, { status: 500 });
  }
}
