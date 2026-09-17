import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspace";
import { ScoreAgent } from "@/lib/ai/agents/score";
import type { AgentContext } from "@/lib/ai/core/types";
=======
import { callAI, isConfigured } from "@/lib/ai/gemini";
import { getActiveWorkspace } from "@/lib/workspace";
import { buildScorePrompt } from "@/lib/ai/prompts";
import { buildBrandContext } from "@/lib/brand/context";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";

/* -- Types ------------------------------------------------------ */

export interface ScoreResponse {
  score: number;
  hookScore: number;
  relevanceScore: number;
  ctaScore: number;
  readabilityScore: number;
  brandFitScore: number;
  engagementScore: number;
  prediction: "high" | "medium" | "low";
  bestTime: string;
  reasoning: string;
  improvements: string[];
}
>>>>>>> main

/* -- POST /api/ai/score ------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) return new Response("Unauthorized", { status: 401 });
    const workspaceId = workspace.workspaceId;

    // Rate limit: 30 requests/min per user.
    const guard = await checkRequest(req, requestKey(req, workspaceId), 30);
    if (guard) return guard;

    const { content, platform } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

<<<<<<< HEAD
    const context: AgentContext = {
      userId: workspaceId,
      workspaceId,
      autonomyMode: "assist",
      supabase,
    };

    const res = await ScoreAgent.evaluate(
=======
    // Get user's model preference and Brand Context
    const [{ data: profile }, brandContext] = await Promise.all([
      supabase
        .from("profiles")
        .select("ai_model")
        .eq("id", workspaceId)
        .single(),
      buildBrandContext(workspaceId).catch(() => null),
    ]);

    // -- No API key → mock ------------------------------------------
    if (!isConfigured()) {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json(mockScore(content));
    }

    // -- Call OpenRouter / Gemini ----------------------------------
    const prompt = buildScorePrompt(content, platform, brandContext);

    const result = await callAI(
      [
        { role: "system", content: "You are KoraSpace's AI Post Scoring Engine. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
>>>>>>> main
      {
        content,
        platform,
      },
      context
    );

<<<<<<< HEAD
    if (res.success && res.data) {
      return NextResponse.json({
        score: res.data.score,
        prediction: res.data.prediction,
        bestTime: res.data.bestTime,
        reasoning: res.data.reasoning,
        improvements: res.data.improvements,
        model: res.metadata?.model,
      });
=======
    // Parse JSON response
    let scoreData: ScoreResponse;
    try {
      const parsed = JSON.parse(result.content.trim().replace(/^```json\s*/i, "").replace(/```$/i, ""));
      scoreData = {
        score: Number(parsed.score ?? 80),
        hookScore: Number(parsed.hookScore ?? parsed.score ?? 80),
        relevanceScore: Number(parsed.relevanceScore ?? parsed.score ?? 85),
        ctaScore: Number(parsed.ctaScore ?? parsed.score ?? 75),
        readabilityScore: Number(parsed.readabilityScore ?? parsed.score ?? 85),
        brandFitScore: Number(parsed.brandFitScore ?? parsed.score ?? 90),
        engagementScore: Number(parsed.engagementScore ?? parsed.score ?? 80),
        prediction: parsed.prediction || (parsed.score >= 75 ? "high" : parsed.score >= 50 ? "medium" : "low"),
        bestTime: parsed.bestTime || "Thursday 8:00 AM WAT",
        reasoning: parsed.reasoning || "Well-balanced social media post with solid engagement metrics.",
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      };
    } catch {
      scoreData = mockScore(content);
>>>>>>> main
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
<<<<<<< HEAD
=======

/* -- Mock fallback ---------------------------------------------- */

function mockScore(content: string): ScoreResponse {
  const length = content.length;
  const hasEmoji = /\p{Emoji}/u.test(content);
  const hasNumbers = /\d/.test(content);
  const hasQuestion = content.includes("?");
  const hasThread = content.includes("🧵") || content.includes("1/");

  let hook = 65;
  let relevance = 75;
  let cta = 60;
  let readability = 70;
  let brandFit = 85;
  let engagement = 65;

  if (hasNumbers) { hook += 15; readability += 10; }
  if (hasQuestion) { cta += 15; engagement += 15; }
  if (hasEmoji) { readability += 10; brandFit += 5; }
  if (hasThread) { hook += 10; engagement += 15; readability += 10; }
  if (length > 100 && length < 500) { relevance += 10; readability += 10; }

  hook = Math.min(hook, 96);
  relevance = Math.min(relevance, 98);
  cta = Math.min(cta, 95);
  readability = Math.min(readability, 96);
  brandFit = Math.min(brandFit, 98);
  engagement = Math.min(engagement, 95);

  const weighted = Math.round(
    hook * 0.25 + relevance * 0.20 + cta * 0.15 + readability * 0.15 + brandFit * 0.10 + engagement * 0.15
  );

  return {
    score: weighted,
    hookScore: hook,
    relevanceScore: relevance,
    ctaScore: cta,
    readabilityScore: readability,
    brandFitScore: brandFit,
    engagementScore: engagement,
    prediction: weighted >= 75 ? "high" : weighted >= 55 ? "medium" : "low",
    bestTime: "Thursday 8:00 AM WAT",
    reasoning:
      weighted >= 75
        ? "Strong scroll-stopping hook, high niche relevance, and clear reader value."
        : "Solid foundational idea - strengthen the opening hook and call-to-action to boost reach.",
    improvements: [
      "Add a concrete metric or result in the first sentence to increase stop-rate",
      "End with a direct conversion prompt or question to spark replies",
      hasThread
        ? "Add a quick takeaway summary in the final tweet"
        : "Format with concise line breaks for mobile readers",
    ],
  };
}


>>>>>>> main
