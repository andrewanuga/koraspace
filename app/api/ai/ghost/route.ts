import { NextRequest, NextResponse } from "next/server";
import { GhostAgent } from "@/lib/ai/agents/ghost";
import { authorizeAIRoute, toAuthErrorResponse } from "@/lib/ai/core/route-auth";

/* ── POST /api/ai/ghost ───────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeAIRoute("inbox:read");
    if (!auth.authorized) {
      return toAuthErrorResponse(auth);
    }
    const { context } = auth;

    const { comment, brandVoice, platform } = await req.json();
    if (!comment) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }

    const res = await GhostAgent.evaluate(
      {
        message: comment,
        brandVoice,
        platform,
        isComment: true,
      },
      context
    );

    if (res.success && res.data) {
      return NextResponse.json({
        action: res.data.action,
        reply: res.data.reply,
        reason: res.data.reasoning,
        confidence: res.data.confidence / 100,
        is_lead: res.data.isLead,
        risk_level: res.data.riskLevel,
        policy: res.data.policy,
        dispatched: res.data.dispatched,
        action_id: res.data.actionId,
        model: res.metadata?.model,
      });
    }

    return NextResponse.json(
      { error: res.error?.message || "Ghost Mode error" },
      { status: 500 }
    );
  } catch (err) {
    console.error("[/api/ai/ghost]", err);
    return NextResponse.json({ error: "Ghost Mode error" }, { status: 500 });
  }
}
