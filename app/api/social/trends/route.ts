import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { callAI, isConfigured } from "@/lib/ai/gemini";
import { buildTrendsPrompt } from "@/lib/ai/prompts";
import { buildBrandContext } from "@/lib/brand/context";

type Hit = {
  title: string;
  url: string;
  source: string;
  snippet: string;
  score?: number;
  momentum?: "Accelerating" | "Rising fast" | "Steady" | "Building" | "Moderate";
  category?: string;
  draft?: string;
};

/**
 * Refresh niche trends for the signed-in user.
 * Uses Tavily web search if configured; otherwise uses KoraSpace's AI engine (Gemini/OpenRouter)
 * with the creator's full Brand Brain context.
 */
export async function POST() {
  const supabase = await createClient();
  const session = await auth();
    const user = session?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: profile }, { data: accounts }, brandContext] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("social_accounts").select("id, platform").eq("user_id", user.id).eq("status", "connected"),
    buildBrandContext(user.id).catch(() => null),
  ]);

  const persona = profile?.persona ?? "creator";
  const niche = brandContext?.profile?.niche || profile?.niche || "Digital Creator";
  const query = `latest ${niche} trends for ${persona}s on social media this week`;

  let hits: Hit[] = [];
  let searched = false;

  // 1. Try Tavily Live Search
  if (process.env.TAVILY_API_KEY) {
    try {
      const r = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query,
          max_results: 6,
          search_depth: "basic",
          topic: "news",
        }),
      });
      const d = await r.json();
      if (d.results?.length) {
        searched = true;
        hits = d.results.map((x: Record<string, string>, i: number) => ({
          title: x.title,
          url: x.url,
          source: new URL(x.url).hostname.replace("www.", ""),
          snippet: x.content?.slice(0, 240) ?? "",
          score: 95 - i * 5,
          momentum: i < 2 ? "Accelerating" : "Building",
        }));
      }
    } catch {
      /* fallback to AI */
    }
  }

  // 2. Try KoraSpace AI Trends Synthesis (Gemini / OpenRouter)
  if (hits.length === 0 && isConfigured()) {
    try {
      const prompt = buildTrendsPrompt(profile, niche);
      const aiRes = await callAI(
        [
          {
            role: "system",
            content: "You are KoraSpace's AI Trend Intelligence Engine. Always return valid JSON matching the schema.",
          },
          { role: "user", content: prompt },
        ],
        { agent: "generate", jsonMode: true }
      );

      const parsed = JSON.parse(aiRes.content.trim().replace(/^```json\s*/i, "").replace(/```$/i, ""));
      if (Array.isArray(parsed.trends) && parsed.trends.length > 0) {
        hits = parsed.trends.map((t: any, i: number) => ({
          title: t.topic || `Trend in ${niche}`,
          url: "",
          source: "Kora AI Signals",
          snippet: t.why || t.summary || `High-opportunity topic in ${niche}.`,
          score: Number(t.score ?? (94 - i * 6)),
          momentum: t.momentum || (i < 2 ? "Accelerating" : "Building"),
          category: t.category,
          draft: t.draft,
        }));
      }
    } catch {
      /* fallback to deterministic seeds */
    }
  }

  // 3. Fallback deterministic seed
  if (hits.length === 0) {
    hits = [
      {
        title: `AI tools reshaping ${niche}`,
        url: "",
        source: "Kora AI",
        snippet: "Autonomous workflows and personalized AI agents are dominating audience attention.",
        score: 94,
        momentum: "Accelerating",
      },
      {
        title: `Short-form video frameworks for ${niche}`,
        url: "",
        source: "Kora AI",
        snippet: "High-retention storytelling reels outpace static posts on algorithmic reach.",
        score: 88,
        momentum: "Rising fast",
      },
      {
        title: `Authentic behind-the-scenes building`,
        url: "",
        source: "Kora AI",
        snippet: "Raw process breakdowns convert 2.4x higher than polished promotional broadcasts.",
        score: 82,
        momentum: "Building",
      },
      {
        title: `Monetization & community loops`,
        url: "",
        source: "Kora AI",
        snippet: "Direct audience-to-revenue models bypassing traditional sponsorship reliance.",
        score: 78,
        momentum: "Steady",
      },
    ];
  }

  // Referral to connected accounts
  const platformHint = (h: Hit): string | null => {
    const t = (h.title + h.snippet).toLowerCase();
    if (t.includes("video") || t.includes("reel") || t.includes("short")) {
      return accounts?.find((a) => ["youtube", "instagram", "tiktok"].includes(a.platform))?.id ?? null;
    }
    return accounts?.[0]?.id ?? null;
  };

  const rows = hits.map((h, i) => ({
    user_id: user.id,
    persona,
    niche,
    ecosystem: niche,
    topic: h.title,
    summary: h.snippet,
    source_url: h.url || null,
    source_name: h.source,
    score: h.score ?? (92 - i * 6),
    momentum: h.momentum ?? (i < 2 ? "Accelerating" : "Building"),
    relevant_platforms: accounts?.map((a) => a.platform) ?? ["x", "linkedin", "instagram"],
    suggested_account_id: platformHint(h),
    draft: h.draft || null,
    expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  }));

  // Replace this user's cache
  await supabase.from("social_trends").delete().eq("user_id", user.id);
  const { data, error } = await supabase.from("social_trends").insert(rows).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ trends: data, searched });
}

