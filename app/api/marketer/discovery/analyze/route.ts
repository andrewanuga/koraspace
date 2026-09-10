import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDiscoveryData } from "@/lib/marketer/discovery";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const targetUserId =
      typeof body.workspaceId === "string" && body.workspaceId.trim()
        ? body.workspaceId.trim()
        : user.id;

    const [{ data: posts }, { data: campaigns }] = await Promise.all([
      supabase
        .from("social_posts")
        .select("id, user_id, platform, content, impressions, engagement, likes, comments, shares, created_at")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("social_campaigns")
        .select("id, user_id, name, platform, status, spend, conversions, roas")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const discoveryData = await getDiscoveryData(
      user.id,
      (posts || []) as any,
      (campaigns || []) as any
    );

    return NextResponse.json(discoveryData);
  } catch (error: any) {
    console.error("Error in /api/marketer/discovery/analyze:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze discovery trends." },
      { status: 500 }
    );
  }
}
