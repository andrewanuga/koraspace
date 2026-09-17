import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspace";
import { GhostAgent } from "@/lib/ai/agents/ghost";
import type { AgentContext } from "@/lib/ai/core/types";
=======
import { callAI, isConfigured } from "@/lib/ai/gemini";
import { getActiveWorkspace } from "@/lib/workspace";
import { buildGhostSystemPrompt } from "@/lib/ai/prompts";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
>>>>>>> main

/* â”€â”€ POST /api/ai/ghost â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export async function POST(req: NextRequest) {
  try {
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) return new Response("Unauthorized", { status: 401 });
    const workspaceId = workspace.workspaceId;

<<<<<<< HEAD
    const { comment, brandVoice, platform } = await req.json();
=======
    // Rate limit: 30 requests/min per user.
    const guard = await checkRequest(req, requestKey(req, workspaceId), 30);
    if (guard) return guard;

    const { comment, brandVoice, platform, mode = "reply" } = await req.json();
>>>>>>> main
    if (!comment) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }

    const context: AgentContext = {
      userId: workspaceId,
      workspaceId,
      autonomyMode: "assist",
      supabase,
    };

<<<<<<< HEAD
    const res = await GhostAgent.evaluate(
=======
    // â”€â”€ No API key â†’ mock â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (!isConfigured()) {
      const result = mockGhost(comment);
      await logAction(supabase, workspaceId, comment, result, platform);
      return NextResponse.json(result);
    }

    // â”€â”€ Call OpenRouter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const systemPrompt = buildGhostSystemPrompt(
      mode === "classify" ? "classify" : "reply",
      brandVoice,
      platform,
    );

    const aiResult = await callAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: comment },
      ],
>>>>>>> main
      {
        message: comment,
        brandVoice,
        platform,
        isComment: true,
      },
      context
    );

<<<<<<< HEAD
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
=======
    // Parse the JSON response
    let result: GhostResult;
    try {
      result = JSON.parse(aiResult.content);
    } catch {
      // If JSON parsing fails, construct a safe response
      result = mode === "classify"
        ? { action: "auto_reply", reason: "Could not classify â€” defaulting to auto_reply", confidence: 0.5 }
        : { action: "auto_reply", reply: aiResult.content, reason: "Raw AI response", confidence: 0.7 };
>>>>>>> main
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
<<<<<<< HEAD
=======

/* â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface GhostResult {
  action: string;
  reply?: string;
  reason: string;
  confidence?: number;
}

/* â”€â”€ Log to database â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

async function logAction(
  supabase: any,
  userId: string,
  comment: string,
  result: GhostResult,
  platform?: string,
) {
  try {
    await supabase.from("agent_actions").insert({
      user_id: userId,
      comment,
      action: result.action,
      reply: result.reply || null,
      platform: platform || "unknown",
      reason: result.reason,
    });
  } catch {
    // Non-fatal â€” log and continue
  }
}

/* â”€â”€ Mock fallback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function mockGhost(comment: string): GhostResult {
  const lower = comment.toLowerCase();
  const isLead =
    lower.includes("how much") || lower.includes("price") ||
    lower.includes("cost") || lower.includes("work with") || lower.includes("hire");
  const isComplaint =
    lower.includes("failed") || lower.includes("broken") ||
    lower.includes("not working") || lower.includes("problem") || lower.includes("issue");
  const isFluff =
    /^[ðŸ”¥â¤ï¸ðŸ˜ðŸ™ŒðŸ‘âœ¨ðŸ’¯]+$/.test(comment.trim()) ||
    lower === "great post" || lower === "amazing" || lower.includes("love this");

  if (isLead) {
    return {
      action: "flag_lead",
      reason: "Comment contains pricing/collaboration inquiry",
      confidence: 0.9,
    };
  }
  if (isComplaint) {
    return {
      action: "escalate_complaint",
      reason: "Comment indicates product/service issue requiring human attention",
      confidence: 0.85,
    };
  }
  if (isFluff) {
    return {
      action: "auto_reply",
      reply: "Thank you so much! Really appreciate the support ðŸ™Œ Stay tuned for more.",
      reason: "Positive engagement â€” auto-reply appropriate",
      confidence: 0.9,
    };
  }
  return {
    action: "auto_reply",
    reply: "Great point! Drop any questions below ðŸ‘‡",
    reason: "General engagement â€” auto-reply appropriate",
    confidence: 0.75,
  };
}

>>>>>>> main
