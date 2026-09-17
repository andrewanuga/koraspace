import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function getActiveWorkspace(supabaseStub?: any) {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get("socially_active_workspace")?.value;

  if (!activeWorkspaceId || activeWorkspaceId === user.id) {
    return { workspaceId: user.id, role: "owner" };
  }

  // Fallback to own workspace since we don't have workspace_members in Prisma schema yet
  return { workspaceId: user.id, role: "owner" };
}

export function enforceRole(role: string, required: "manager" | "admin") {
  if (role === "owner") return true;
  if (required === "manager") return role === "manager";
  if (required === "admin") return role === "manager" || role === "admin";
  return false;
}
