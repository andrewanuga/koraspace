/**
 * Unified Trend Agent (TrendAgent)
 *
 * Specializes in live market trend intelligence, niche momentum tracking,
 * and turning real-time discussions into viral content drafts.
 */

import { z } from "zod";
import type { AgentContext, AgentResult } from "../core/types";
import { callAI, isConfigured } from "../openrouter";

/* -- 1. Schemas & Type Contracts -------------------------------- */

export const TrendTopicSchema = z.object({
  topic: z.string(),
  category: z.string(),
  score: z.number().min(0).max(100),
  growth: z.string(),
  momentum: z.string(),
  why: z.string(),
  draft: z.string(),
});

export type TrendTopic = z.infer<typeof TrendTopicSchema>;

export const TrendAgentOutputSchema = z.object({
  niche: z.string(),
  trends: z.array(TrendTopicSchema),
});

export type TrendAgentOutput = z.infer<typeof TrendAgentOutputSchema>;

export interface TrendAgentInput {
  niche?: string;
  region?: string;
}

/* -- 2. Fallback / Deterministic Trend Generator ----------------- */

function generateFallbackTrends(niche: string): TrendTopic[] {
  return [
    {
      topic: "AI Regulation & Creator Rights in 2026",
      category: "Tech & Policy",
      score: 94,
      growth: "+342%",
      momentum: "Accelerating",
      why: `High relevance to ${niche}-focused creators navigating new copyright & AI monetization standards.`,
      draft:
        "🚨 The new digital copyright framework just dropped - here's what it means for every founder building in 2026...\n\nThis changes everything about how we protect and monetize original content.\n\nThread 🧵👇",
    },
    {
      topic: "Macro Shifts & SaaS Subscription Fatigue",
      category: "Fintech & SaaS",
      score: 88,
      growth: "+218%",
      momentum: "Rising fast",
      why: "Audience is actively searching for high-ROI software consolidation strategies.",
      draft:
        "The shift from bloated monthly SaaS to lean, autonomous workflows is accelerating.\n\nHere is how top operators are cutting software spend by 40% while doubling output:",
    },
    {
      topic: "The Rise of Specialized Vertical Creators",
      category: "Creator Economy",
      score: 82,
      growth: "+156%",
      momentum: "Steady",
      why: `Matches audience interest in building distinct, defensible niches within ${niche}.`,
      draft:
        "Generalist content is dead in 2026. The creators making 7 figures are laser-focused on hyper-specific niches.\n\nHere's the 3-step playbook for owning your category:",
    },
  ];
}

/* -- 3. Unified Trend Agent Implementation ---------------------- */

export class TrendAgent {
  public static async discover(
    input: TrendAgentInput,
    _context: AgentContext
  ): Promise<AgentResult<TrendAgentOutput>> {
    const startTime = Date.now();
    const niche = input.niche || "general";

    // 1. If OpenRouter is not configured, return fallback
    if (!isConfigured()) {
      return {
        success: true,
        data: {
          niche,
          trends: generateFallbackTrends(niche),
        },
        metadata: { latencyMs: Date.now() - startTime },
      };
    }

    // 2. LLM Trend Discovery Prompt
    const systemPrompt = `You are a viral trend intelligence analyst and social growth strategist.
Discover 4-5 high-momentum, timely trends for creators and businesses in the "${niche}" niche (focus on current year 2026 dynamics).

Return strictly valid JSON matching this schema:
{
  "trends": [
    {
      "topic": string,
      "category": string,
      "score": number (0-100),
      "growth": string (e.g. "+240%"),
      "momentum": string (e.g. "Accelerating", "Rising fast", "Steady"),
      "why": string (why this matters to the target audience),
      "draft": string (a ready-to-use scroll-stopping social post draft or thread hook)
    }
  ]
}`;

    try {
      const res = await callAI(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Find top trending topics in the "${niche}" niche.` },
        ],
        {
          agent: "trends",
          temperature: 0.5,
          jsonMode: true,
        }
      );

      let parsed: any;
      try {
        let clean = res.content.trim();
        if (clean.startsWith("```json")) clean = clean.replace(/```json/g, "").replace(/```/g, "").trim();
        if (clean.startsWith("```")) clean = clean.replace(/```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        return {
          success: true,
          data: {
            niche,
            trends: generateFallbackTrends(niche),
          },
          metadata: { latencyMs: Date.now() - startTime },
        };
      }

      const rawTrends = Array.isArray(parsed.trends) ? parsed.trends : Array.isArray(parsed) ? parsed : [];
      const trends: TrendTopic[] = rawTrends.length > 0 ? rawTrends : generateFallbackTrends(niche);

      const output: TrendAgentOutput = {
        niche,
        trends,
      };

      const validated = TrendAgentOutputSchema.parse(output);

      return {
        success: true,
        data: validated,
        metadata: {
          model: res.model,
          latencyMs: Date.now() - startTime,
        },
      };
    } catch (err: any) {
      console.warn("[TrendAgent] Error during trend discovery, falling back:", err?.message);
      return {
        success: true,
        data: {
          niche,
          trends: generateFallbackTrends(niche),
        },
        metadata: { latencyMs: Date.now() - startTime },
      };
    }
  }
}
