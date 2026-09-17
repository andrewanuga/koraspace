import { NextRequest, NextResponse } from "next/server";
import { TrendAgent } from "@/lib/ai/agents/trend";
import { authorizeAIRoute, toAuthErrorResponse } from "@/lib/ai/core/route-auth";

/* ── GET /api/ai/trends ───────────────────────────────────────── */

export async function GET(req: NextRequest) {
  try {
    const auth = await authorizeAIRoute("social:read");
    if (!auth.authorized) {
      return toAuthErrorResponse(auth);
    }
    const { context, workspaceId, supabase } = auth;

    const { searchParams } = new URL(req.url);
    const niche = searchParams.get("niche") || "general";

    // Get user's model preference
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_model, niche")
      .eq("id", workspaceId)
      .single();

    const userNiche = niche !== "general" ? niche : profile?.niche || "general";

    const res = await TrendAgent.discover({ niche: userNiche }, context);

    if (res.success && res.data) {
      return NextResponse.json({
        trends: res.data.trends,
        model: res.metadata?.model,
      });
    }

    return NextResponse.json(
      { error: res.error?.message || "Failed to fetch trends." },
      { status: 500 }
    );
  } catch (err) {
    console.error("[/api/ai/trends]", err);
    return NextResponse.json(
      { error: "Failed to fetch trends." },
      { status: 500 }
    );
  }
}
