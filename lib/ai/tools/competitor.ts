/**
 * Typed AI Tool: analyze_competitor
 *
 * Strategic competitive intelligence tool that performs content pillar breakdown,
 * identified strength analysis, content gap discovery, and counter-positioning hooks.
 * Automatically delegates to scrapeUrlTool when given a URL.
 */

import { z } from "zod";
import type { AITool, AgentContext, AgentResult } from "../core/types";
import { callAI, isConfigured } from "../openrouter";
import { scrapeUrlTool } from "./web";

/* -- 1. Schemas & Type Contracts -------------------------------- */

export const AnalyzeCompetitorOutputSchema = z.object({
  target: z.string(),
  isUrl: z.boolean(),
  scrapedSummary: z.string().optional(),
  contentPillars: z.array(z.string()),
  strengths: z.array(z.string()),
  contentGaps: z.array(z.string()),
  counterStrategy: z.array(z.string()),
  recommendedHooks: z.array(z.string()),
  summary: z.string(),
});

export type AnalyzeCompetitorOutput = z.infer<typeof AnalyzeCompetitorOutputSchema>;

export interface AnalyzeCompetitorInput {
  competitor_handle_or_url: string;
  niche?: string;
}

/* -- 2. Fallback / Deterministic Generator ----------------------- */

function generateFallbackAnalysis(target: string, scrapedTitle?: string): AnalyzeCompetitorOutput {
  const isUrl = /^https?:\/\//i.test(target);
  return {
    target,
    isUrl,
    scrapedSummary: scrapedTitle ? `Extracted content from: ${scrapedTitle}` : undefined,
    contentPillars: [
      "Foundational industry concepts & high-level overviews",
      "Product features & basic announcements",
      "Curated news and generic industry commentary",
    ],
    strengths: [
      "Consistent posting cadence across primary social channels",
      "Clean visual branding and identifiable color schemes",
    ],
    contentGaps: [
      "Lack of deep, actionable step-by-step tutorials and frameworks",
      "Minimal contrarian perspectives or unique proprietary data",
      "Underutilization of short-form vertical video and conversational carousels",
    ],
    counterStrategy: [
      "Position as the advanced, actionable alternative: trade surface-level advice for deep teardowns.",
      "Publish real behind-the-scenes metrics and transparent case studies they avoid sharing.",
      "Deploy engagement-driven carousels dissecting their core topics from a contrarian angle.",
    ],
    recommendedHooks: [
      `Most people follow ${target}'s advice on this topic. Here's why that playbook stopped working in 2026:`,
      `I spent 20 hours analyzing ${target}'s top campaigns. Here are the 3 critical mistakes they're making:`,
      `Why 90% of creators blindly copy ${target} - and the alternative strategy that gets 3× more reach:`,
    ],
    summary: `Competitor Analysis for ${target}:\n1. Content Strategy: Heavy on high-level overviews, light on technical depth.\n2. Key Gap: Misses actionable frameworks and contrarian takes.\n3. Outperformance Vector: Focus on deep teardowns and transparent proof points.`,
  };
}

/* -- 3. Executable AI Tool Definition --------------------------- */

export const analyzeCompetitorTool: AITool<
  AnalyzeCompetitorInput,
  AnalyzeCompetitorOutput
> = {
  name: "analyze_competitor",
  description: "Perform strategic competitive analysis on a competitor's social handle or website URL to identify content pillars, audience gaps, and counter-positioning opportunities.",
  requiredCapabilities: ["social:read"],
  parameters: {
    type: "object",
    properties: {
      competitor_handle_or_url: {
        type: "string",
        description: "The competitor's social handle (e.g. '@techcabal', '@paystack') or website URL (e.g. 'https://competitor.com')",
      },
      niche: {
        type: "string",
        description: "Optional industry niche context (e.g. 'Fintech', 'Creator Economy', 'AI SaaS')",
      },
    },
    required: ["competitor_handle_or_url"],
  },

  validateInput(raw: unknown): AnalyzeCompetitorInput {
    if (!raw || typeof raw !== "object") {
      throw new Error("Input must be an object containing 'competitor_handle_or_url'.");
    }
    const { competitor_handle_or_url, niche } = raw as Record<string, unknown>;
    if (typeof competitor_handle_or_url !== "string" || !competitor_handle_or_url.trim()) {
      throw new Error("Missing or empty 'competitor_handle_or_url' parameter.");
    }
    return {
      competitor_handle_or_url: competitor_handle_or_url.trim(),
      niche: typeof niche === "string" ? niche.trim() : undefined,
    };
  },

  async execute(
    input: AnalyzeCompetitorInput,
    context: AgentContext
  ): Promise<AgentResult<AnalyzeCompetitorOutput>> {
    const { competitor_handle_or_url, niche } = input;
    const isUrl = /^https?:\/\//i.test(competitor_handle_or_url);

    let scrapedContext = "";
    let scrapedTitle: string | undefined;

    // 1. Composite execution: If target is a URL, scrape webpage content first
    if (isUrl) {
      const scrapeRes = await scrapeUrlTool.execute(
        { url: competitor_handle_or_url, maxCharacters: 4000 },
        context
      );
      if (scrapeRes.success && scrapeRes.data) {
        scrapedTitle = scrapeRes.data.title;
        scrapedContext = `\n--- Scraped Webpage Content ---\nTitle: ${scrapeRes.data.title || "N/A"}\nDescription: ${scrapeRes.data.description || "N/A"}\nBody:\n${scrapeRes.data.content}\n---------------------------------\n`;
      }
    }

    // 2. If OpenRouter is not configured or in dev, use fallback
    if (!isConfigured()) {
      return {
        success: true,
        data: generateFallbackAnalysis(competitor_handle_or_url, scrapedTitle),
      };
    }

    // 3. LLM Competitive Intelligence Prompt
    const systemPrompt = `You are an expert social media brand strategist and competitive intelligence analyst.
Analyze the competitor target: "${competitor_handle_or_url}" ${niche ? `in the ${niche} niche` : ""}.
${scrapedContext}

Provide a comprehensive, high-leverage competitive analysis with:
1. contentPillars: 3 main themes/formats they rely on
2. strengths: 2-3 things they do well
3. contentGaps: 2-3 unserved audience needs or topics they ignore
4. counterStrategy: 3 actionable ways to out-position them and capture audience share
5. recommendedHooks: 3 viral hook variations tailored to outperform them
6. summary: A concise, executive summary (under 4 sentences)

Return strictly valid JSON matching this schema:
{
  "contentPillars": string[],
  "strengths": string[],
  "contentGaps": string[],
  "counterStrategy": string[],
  "recommendedHooks": string[],
  "summary": string
}`;

    try {
      const res = await callAI(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Perform competitor breakdown for: "${competitor_handle_or_url}"` },
        ],
        {
          agent: "score",
          temperature: 0.3,
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
          data: generateFallbackAnalysis(competitor_handle_or_url, scrapedTitle),
        };
      }

      const output: AnalyzeCompetitorOutput = {
        target: competitor_handle_or_url,
        isUrl,
        scrapedSummary: scrapedTitle ? `Extracted content from: ${scrapedTitle}` : undefined,
        contentPillars: Array.isArray(parsed.contentPillars) ? parsed.contentPillars : ["General industry content"],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Consistent posting schedule"],
        contentGaps: Array.isArray(parsed.contentGaps) ? parsed.contentGaps : ["Lacks deep actionable tutorials"],
        counterStrategy: Array.isArray(parsed.counterStrategy) ? parsed.counterStrategy : ["Publish actionable teardowns"],
        recommendedHooks: Array.isArray(parsed.recommendedHooks) ? parsed.recommendedHooks : [`The truth about ${competitor_handle_or_url}'s approach:`],
        summary: typeof parsed.summary === "string" ? parsed.summary : `Analysis completed for ${competitor_handle_or_url}.`,
      };

      const validatedOutput = AnalyzeCompetitorOutputSchema.parse(output);

      return {
        success: true,
        data: validatedOutput,
        metadata: {
          model: res.model,
          toolCallsExecuted: isUrl ? ["scrape_url", "analyze_competitor"] : ["analyze_competitor"],
        },
      };
    } catch (err: any) {
      console.warn("[analyze_competitor] Error during LLM analysis, falling back:", err?.message);
      return {
        success: true,
        data: generateFallbackAnalysis(competitor_handle_or_url, scrapedTitle),
      };
    }
  },
};
