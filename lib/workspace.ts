import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import type { WorkspaceRole } from "./ai/core/rbac";

export interface ActiveWorkspace {
  workspaceId: string;
  role: WorkspaceRole;
  userId: string;
}

const VALID_WORKSPACE_ROLES = new Set<WorkspaceRole>(["owner", "admin", "member", "viewer"]);

export async function getActiveWorkspace(supabase: SupabaseClient): Promise<ActiveWorkspace | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get("socially_active_workspace")?.value;

  if (!activeWorkspaceId || activeWorkspaceId === user.id) {
    return { workspaceId: user.id, role: "owner", userId: user.id };
  }

  // Verify membership
  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", activeWorkspaceId)
    .eq("user_id", user.id)
    .single();

  if (member) {
    if (VALID_WORKSPACE_ROLES.has(member.role as WorkspaceRole)) {
      return { workspaceId: activeWorkspaceId, role: member.role as WorkspaceRole, userId: user.id };
    }
    // Fail-closed if membership role is unrecognized
    return null;
  }

  // Fallback to own workspace if not a member
  return { workspaceId: user.id, role: "owner", userId: user.id };
}

export function enforceRole(role: string, required: "manager" | "admin") {
  if (role === "owner") return true;
  if (required === "manager") return role === "manager";
  if (required === "admin") return role === "manager" || role === "admin";
  return false;
}
