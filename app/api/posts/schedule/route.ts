import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspace";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
import { verifyExecutionGate } from "@/lib/security/enforcement";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) return new Response("Unauthorized", { status: 401 });
    const workspaceId = workspace.workspaceId;

    // Rate limit post scheduling (30 requests/minute per workspace)
    const guard = await checkRequest(req, requestKey(req, workspaceId), 30);
    if (guard) return guard;

    // Role-based access control: Viewers cannot create or schedule posts
    if (workspace.role === "viewer") {
      return NextResponse.json(
        { error: "Forbidden: Viewers are not permitted to schedule or publish posts." },
        { status: 403 }
      );
    }

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
    const posts = platforms.map((platform: string) => ({
      user_id: workspaceId,
      content,
      platform,
      scheduled_at: scheduledAt || new Date().toISOString(),
      status: scheduledAt ? "scheduled" : "queued",
      socially_score: score || null,
    }));

    const { data, error } = await supabase
      .from("scheduled_posts")
      .insert(posts)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, posts: data });
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
    const supabase = await createClient();
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) return new Response("Unauthorized", { status: 401 });
    const workspaceId = workspace.workspaceId;

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let query = supabase
      .from("scheduled_posts")
      .select("*")
      .eq("user_id", workspaceId)
      .order("scheduled_at", { ascending: true });

    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query = query
        .gte("scheduled_at", start.toISOString())
        .lte("scheduled_at", end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ posts: data });
  } catch (err) {
    console.error("[/api/posts/schedule GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
