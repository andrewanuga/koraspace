import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { callAI, isConfigured } from "@/lib/ai/gemini";
import { getActiveWorkspace } from "@/lib/workspace";
import { buildIdeasPrompt } from "@/lib/ai/prompts";
import { buildBrandContext } from "@/lib/brand/context";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
import { scanForPromptInjection } from "@/lib/security/enforcement";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) return new Response("Unauthorized", { status: 401 });
    const workspaceId = user.id;

    // Rate limit: 30 requests/min per user
    const guard = await checkRequest(req, requestKey(req, workspaceId), 30);
    if (guard) return guard;

    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Zero-Trust security scan
    const scan = scanForPromptInjection(prompt, "Idea Generation Prompt");
    if (!scan.safe) {
      return NextResponse.json(
        { error: "Security Alert: Prompt flagged for injection attempt.", reason: scan.reason },
        { status: 400 }
      );
    }

    // Fetch user profile preferences, Brand Brain context, and active trends
    const [profile, brandContext, trends] = await Promise.all([
      prisma.profile.findUnique({
        where: { id: workspaceId },
        select: { ai_model: true }
      }),
      buildBrandContext(workspaceId).catch(() => null),
      prisma.socialTrend.findMany({
        where: { user_id: workspaceId },
        select: { topic: true, summary: true },
        orderBy: { score: "desc" },
        take: 4,
      }).catch(() => []),
    ]);

    // Dev mock fallback if no API key
    if (!isConfigured()) {
      await new Promise((r) => setTimeout(r, 600));
      return NextResponse.json({
        ideas: [
          `The contrarian truth about ${prompt.trim()} that most creators overlook`,
          `5 actionable steps to master ${prompt.trim()} in 30 days`,
          `How I built an audience with ${prompt.trim()} starting with 0 followers`,
          `Why ${prompt.trim()} is the highest-leverage skill in 2026`,
        ],
      });
    }

    const ideasPrompt = buildIdeasPrompt(prompt.trim(), brandContext, trends);

    const result = await callAI(
      [
        {
          role: "system",
          content: "You are the KoraSpace AI Idea Intelligence Strategist. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: ideasPrompt,
        },
      ],
      {
        agent: "generate",
        model: profile?.ai_model || undefined,
        jsonMode: true,
      }
    );

    let parsedIdeas: string[] = [];
    try {
      const parsed = JSON.parse(result.content.trim().replace(/^```json\s*/i, "").replace(/```$/i, ""));
      if (Array.isArray(parsed.ideas)) {
        parsedIdeas = parsed.ideas.filter((x: any) => typeof x === "string");
      }
    } catch {
      parsedIdeas = [
        `A controversial take about ${prompt.trim()}`,
        `5 mistakes creators make with ${prompt.trim()}`,
        `How I would start with ${prompt.trim()} from zero`,
        `The future of ${prompt.trim()} in 2026`,
      ];
    }

    if (parsedIdeas.length === 0) {
      parsedIdeas = [
        `The contrarian truth about ${prompt.trim()}`,
        `5 high-impact frameworks for ${prompt.trim()}`,
        `How to scale your output in ${prompt.trim()}`,
        `What nobody tells you about ${prompt.trim()}`,
      ];
    }

    return NextResponse.json({
      ideas: parsedIdeas,
      model: result.model,
    });
  } catch (err) {
    console.error("[/api/ideas/generate]", err);
    return NextResponse.json(
      { error: "Failed to generate ideas. Please try again." },
      { status: 500 }
    );
  }
}
