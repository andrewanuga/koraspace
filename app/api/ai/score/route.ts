import { NextRequest, NextResponse } from "next/server";
import { ScoreAgent } from "@/lib/ai/agents/score";
import { authorizeAIRoute, toAuthErrorResponse } from "@/lib/ai/core/route-auth";

/* ── POST /api/ai/score ───────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeAIRoute("content:score");
    if (!auth.authorized) {
      return toAuthErrorResponse(auth);
    }
    const { context } = auth;

    const { content, platform } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const res = await ScoreAgent.evaluate(
      {
        content,
        platform,
      },
      context
    );

    if (res.success && res.data) {
      return NextResponse.json({
        score: res.data.score,
        prediction: res.data.prediction,
        bestTime: res.data.bestTime,
        reasoning: res.data.reasoning,
        improvements: res.data.improvements,
        model: res.metadata?.model,
      });
    }

    return NextResponse.json(
      { error: res.error?.message || "Scoring failed. Please try again." },
      { status: 500 }
    );
  } catch (err) {
    console.error("[/api/ai/score]", err);
    return NextResponse.json(
      { error: "Scoring failed. Please try again." },
      { status: 500 }
    );
  }
}
