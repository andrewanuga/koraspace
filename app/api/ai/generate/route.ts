import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { callAI, isConfigured } from "@/lib/ai/gemini";
import { buildGeneratePrompt } from "@/lib/ai/prompts";
import { buildBrandContext } from "@/lib/brand/context";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
import { scanForPromptInjection } from "@/lib/security/enforcement";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface GenerateBody {
  prompt?: string;
  platform?: string;
  framework?: string;
  tone?: string;
  context?: string;
  type?: "caption" | "thread" | "reply" | "hashtags" | "bio" | "idea" | "variations" | "repurpose" | "brand";
  useTrends?: boolean;
  imageUrls?: string[];
}

/* -------------------------------------------------------------------------- */
/*                            POST /api/ai/generate                           */
/* -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  try {
    // Auth guard
    const session = await auth();
    const user = session?.user;
    if (!user) return new Response("Unauthorized", { status: 401 });
    const workspaceId = user.id;

    // Rate limit: 30 requests/min per user.
    const guard = await checkRequest(req, requestKey(req, workspaceId), 30);
    if (guard) return guard;

    const body: GenerateBody = await req.json();
    const { prompt, platform, framework, tone, context, type = "caption", useTrends } = body;

    // Zero-Trust Defense Against Prompt Injection & Evasion
    if (prompt) {
      const scan = scanForPromptInjection(prompt, "Generate Prompt");
      if (!scan.safe) {
        return NextResponse.json({ error: "Security Alert: Prompt flagged for injection attempt.", reason: scan.reason }, { status: 400 });
      }
    }
    if (context) {
      const scan = scanForPromptInjection(context, "Generate Context");
      if (!scan.safe) {
        return NextResponse.json({ error: "Security Alert: Context flagged for injection attempt.", reason: scan.reason }, { status: 400 });
      }
    }

    let finalPrompt = prompt || "";
    let trendUsed = "";

    if (useTrends) {
      // Fetch the top trend from the user's database cache
      const trends = await prisma.trend.findMany({
        where: { user_id: workspaceId },
        orderBy: { score: 'desc' },
        take: 1,
        select: { topic: true, summary: true }
      });
      
      if (trends && trends.length > 0) {
        trendUsed = trends[0].topic;
        finalPrompt = `Trend: ${trendUsed}. Context: ${brandContext}`;
      } else {
        // Fallback if no trends generated yet
        trendUsed = "AI tools in our niche";
        finalPrompt = "Latest AI tools in our niche";
      }
    } else if (!prompt && !context) {
      return NextResponse.json(
        { error: "Prompt or context is required" },
        { status: 400 },
      );
    }

    // Load user's model preference and Brand Brain Context
    const [profile, brandContext] = await Promise.all([
      prisma.profile.findUnique({
        where: { id: workspaceId },
        select: { ai_model: true, ai_temperature: true }
      }),
      buildBrandContext(workspaceId).catch(() => null),
    ]);

    // Build the generation prompt with Brand Brain context
    const systemPrompt = buildGeneratePrompt({
      type,
      platform,
      tone: tone || brandContext?.profile?.voice_summary || undefined,
      context: context || finalPrompt || "",
      framework,
      brandContext,
    });

    const baseUserPrompt = context
      ? `Brand context: ${brandContext}\n\nCreate a compelling ${framework} piece about: ${trendUsed}`
      : `Create a compelling ${framework} piece about: ${trendUsed}`;

    const userMessageContent: any = Array.isArray(body.imageUrls) && body.imageUrls.length > 0
      ? [
          { type: "text", text: baseUserPrompt },
          ...body.imageUrls.filter(Boolean).map((url: string) => ({
            type: "image_url",
            image_url: { url },
          })),
        ]
      : baseUserPrompt;

    // No API key mock
    if (!isConfigured()) {
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json({ content: getMockContent(platform, framework, tone) });
    }

    // Call OpenRouter / Gemini
    const result = await callAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessageContent },
      ],
      {
        agent: "generate",
        model: profile?.ai_model || undefined,
      },
    );

    // Deduct from user's generation quota
    try {
      await prisma.profile.update({
        where: { id: workspaceId },
        data: { generations_used: { increment: 1 } }
      });
    } catch {
      /* ignore quota errors */
    }

    return NextResponse.json({ content: result.content, model: result.model, trendUsed });
  } catch (err) {
    console.error("[/api/ai/generate]", err);
    const errorMessage = err instanceof Error ? err.message : "Generation failed. Please try again.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Mock content for dev */
/* -------------------------------------------------------------------------- */

function getMockContent(platform?: string, framework?: string, tone?: string): string {

  const mocks: Record<string, string> = {
    aida: `🚀 Most founders are sleeping on this growth hack in 2026...\n\nI went from 0 to 10K followers in 60 days without spending a single Naira on ads.\n\nHere's the exact 5-step system I used 👇\n\n1️⃣ Stop posting content. Start sharing insights.\n2️⃣ The 80/20 engagement rule - spend 80% of your time commenting.\n3️⃣ Post at 6am or 8pm WAT. Most creators post during work hours.\n4️⃣ Every thread needs a retention hook at the end.\n5️⃣ Auto-Plug when posts blow up.\n\nWhich step are you missing? 👇`,
    pas: `The biggest problem with social media in 2026?\n\nYou're working 3x harder for half the results.\n\nAlgorithms changed. Attention spans dropped. Competition tripled.\n\nAnd the playbook everyone taught you in 2022 is dead.\n\nHere's what actually works now 👇 [Link in bio]`,
    hook: `"I post every day and still get zero engagement."\n\nI hear this from 9 out of 10 founders I talk to.\n\nHere's the uncomfortable truth:\n\nPosting more is not the solution.\n\nPosting smarter is.\n\nDrop a 🔥 if you want me to break down the system that changed everything for my clients.`,
    story: `18 months ago, I was ready to quit social media entirely.\n\n47 posts. 230 followers. Zero clients.\n\nThen I discovered one thing that changed everything.\n\nI stopped writing for the algorithm and started writing for one person.\n\nMy ideal client. Her exact problem. Her exact words.\n\nNext month? 4 inbound leads from a single thread.\n\nThe lesson: specificity beats volume every single time.`,
  };

  let content = mocks[framework || "aida"] || mocks.aida;
  
  if (platform === "linkedin") {
    content = `Bold first line that stops the scroll.\n\nI've been quiet about this for months, but it's time to share.\n\nHere's what I learned after working with 50+ founders this quarter:\n\n1️⃣ Insight 1\n2️⃣ Insight 2\n3️⃣ Insight 3\n\nThe lesson? Consistency compounds. But only if you're consistent about the RIGHT things.\n\nWhat's your biggest challenge right now? 👇`;
  }

  return `[Mock Mode | Tone: ${tone} | Framework: ${framework}]\n\n${content}`;
}
