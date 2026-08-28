import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspace";
import { GhostAgent } from "@/lib/ai/agents/ghost";
import type { AgentContext } from "@/lib/ai/core/types";

/* ── POST /api/ai/ghost ───────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) return new Response("Unauthorized", { status: 401 });
    const workspaceId = workspace.workspaceId;

    const { comment, brandVoice, platform } = await req.json();
    if (!comment) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }

    const context: AgentContext = {
      userId: workspaceId,
      workspaceId,
      autonomyMode: "assist",
      supabase,
    };

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
