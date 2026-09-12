import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspace";
import { ScoreAgent } from "@/lib/ai/agents/score";
import type { AgentContext } from "@/lib/ai/core/types";

/* ── POST /api/ai/score ───────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) return new Response("Unauthorized", { status: 401 });
    const workspaceId = workspace.workspaceId;

    const { content, platform } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const context: AgentContext = {
      userId: workspaceId,
      workspaceId,
      autonomyMode: "assist",
      supabase,
    };

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
