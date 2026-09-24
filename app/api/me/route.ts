import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/*
 * GET /api/me
 *
 * Returns the authenticated user's profile data needed by the dashboard
 * client (WorkspaceProvider). Uses NextAuth session — NOT Supabase auth.
 */
export async function GET() {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        full_name: true,
        persona: true,
        plan: true,
        is_admin: true,
        onboarded: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    /* Load collaborative workspace memberships via raw SQL */
    let members: Array<{ workspace_id: string; role: string }> = [];
    try {
      members = await prisma.$queryRaw`
        SELECT workspace_id, role
        FROM workspace_members
        WHERE user_id = ${user.id}::uuid
      `;
    } catch {
      /* workspace_members table may not exist yet — gracefully degrade */
      members = [];
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        full_name: profile.full_name,
        persona: profile.persona ?? "creator",
        plan: profile.plan ?? "free",
        is_admin: profile.is_admin ?? false,
        onboarded: profile.onboarded ?? false,
      },
      memberships: members,
    });
  } catch (error) {
    console.error("[GET /api/me]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
