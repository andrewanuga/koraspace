import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
import { verifyExecutionGate } from "@/lib/security/enforcement";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) return new Response("Unauthorized", { status: 401 });
    const workspaceId = user.id;

    // Rate limit post scheduling (30 requests/minute per workspace)
    const guard = await checkRequest(req, requestKey(req, workspaceId), 30);
    if (guard) return guard;

    // We used to fetch workspace role. Let's get it from the profile (admin/owner)
    const profile = await prisma.profile.findUnique({
      where: { id: workspaceId },
      select: { is_admin: true }
    });

    const body = await req.json();
    const { content, platforms, scheduledAt, score } = body;

    if (!content || !platforms?.length) {
      return NextResponse.json(
        { error: "Content and at least one platform are required" },
        { status: 400 }
      );
    }

    // Zero-Trust Execution Gate: Verify action, target scope, and scan content
    try {
      verifyExecutionGate({
        workspaceId,
        action: "publish",
        targetScope: "post",
        untrustedInput: typeof content === "string" ? content : undefined,
      });
    } catch (gateErr: any) {
      return NextResponse.json(
        { error: `Post scheduling blocked by security policy: ${gateErr.message}` },
        { status: 403 }
      );
    }

    // Insert scheduled post for each platform
    const postsData = platforms.map((platform: string) => ({
      user_id: workspaceId,
      content,
      platform,
      scheduled_at: scheduledAt ? new Date(scheduledAt) : new Date(),
      status: scheduledAt ? "scheduled" : "queued",
      socially_score: score || null,
    }));

    await prisma.scheduledPost.createMany({
      data: postsData
    });

    // Return the inserted posts by fetching them since createMany doesn't return the records
    const latestPosts = await prisma.scheduledPost.findMany({
      where: {
        user_id: workspaceId,
        content: content,
      },
      orderBy: { created_at: 'desc' },
      take: platforms.length
    });

    return NextResponse.json({ success: true, posts: latestPosts });
  } catch (err) {
    console.error("[/api/posts/schedule]", err);
    return NextResponse.json(
      { error: "Failed to schedule post" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) return new Response("Unauthorized", { status: 401 });
    const workspaceId = user.id;

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let whereClause: any = { user_id: workspaceId };

    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      whereClause.scheduled_at = {
        gte: start,
        lte: end
      };
    }

    const data = await prisma.scheduledPost.findMany({
      where: whereClause,
      orderBy: { scheduled_at: 'asc' }
    });

    return NextResponse.json({ posts: data });
  } catch (err) {
    console.error("[/api/posts/schedule GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}