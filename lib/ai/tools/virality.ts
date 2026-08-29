/**
 * Typed AI Tool: evaluate_virality
 *
 * Multi-factor content evaluation engine that assesses hook strength, clarity,
 * retention, emotional resonance, CTA, and platform fit with actionable recommendations.
 */

import { z } from "zod";
import type { AITool, AgentContext, AgentResult } from "../core/types";
import { callAI, isConfigured } from "../openrouter";

/* ── 1. Schemas & Type Contracts ──────────────────────────────── */

export const ViralityDimensionScoresSchema = z.object({
  hook: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  emotionalPull: z.number().min(0).max(100),
  retention: z.number().min(0).max(100),
  ctaStrength: z.number().min(0).max(100),
  platformFit: z.number().min(0).max(100),
});

export type ViralityDimensionScores = z.infer<typeof ViralityDimensionScoresSchema>;

export const EvaluateViralityOutputSchema = z.object({
  score: z.number().min(0).max(100),
  tier: z.enum(["low", "medium", "high", "viral_candidate"]),
  dimensions: ViralityDimensionScoresSchema,
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  tips: z.array(z.string()), // Backwards-compatible field
  suggestedHook: z.string().optional(),
});

export type EvaluateViralityOutput = z.infer<typeof EvaluateViralityOutputSchema>;

export interface EvaluateViralityInput {
  post_content: string;
  platform?: "x" | "linkedin" | "instagram" | "tiktok" | "facebook" | "threads";
}

/* ── 2. Weighted Score Calculator ─────────────────────────────── */

export function calculateWeightedScore(dims: ViralityDimensionScores): number {
  const weighted =
    dims.hook * 0.20 +
    dims.clarity * 0.15 +
    dims.emotionalPull * 0.15 +
    dims.retention * 0.20 +
    dims.ctaStrength * 0.15 +
    dims.platformFit * 0.15;

  return Math.round(Math.min(100, Math.max(0, weighted)));
}

export function determineTier(score: number): EvaluateViralityOutput["tier"] {
  if (score >= 85) return "viral_candidate";
  if (score >= 70) return "high";
  if (score >= 50) return "medium";
  return "low";
}

/* ── 3. Deterministic / Offline Evaluator ──────────────────────── */

function evaluateHeuristics(content: string, platform?: string): EvaluateViralityOutput {
  const lower = content.toLowerCase().trim();
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] || "";

  // 1. Hook evaluation
  let hook = 50;
  if (/^(unpopular opinion|stop doing|how i|the truth about|why most|most founders|here's why|don't make)/i.test(firstLine)) {
    hook += 25;
  }
  if (firstLine.includes("?") || /\d+/.test(firstLine)) {
    hook += 15;
  }
  if (firstLine.length < 90 && firstLine.length > 20) {
    hook += 10;
  }
  hook = Math.min(100, Math.max(20, hook));

  // 2. Clarity evaluation
  let clarity = 60;
  const avgLineLength = content.length / Math.max(1, lines.length);
  if (avgLineLength < 120) clarity += 20; // good white space
  if (!/(synergy|utilize|paradigm|moreover|furthermore|heretofore)/i.test(lower)) clarity += 10;
  clarity = Math.min(100, Math.max(25, clarity));

  // 3. Emotional pull
  let emotionalPull = 45;
  if (/(afraid|secret|mistake|regret|excited|shocked|game-changer|insane|wild|brutal|truth)/i.test(lower)) emotionalPull += 25;
  if (/\p{Emoji}/u.test(content)) emotionalPull += 15;
  emotionalPull = Math.min(100, Math.max(20, emotionalPull));

  // 4. Retention
  let retention = 50;
  if (lines.length >= 3) retention += 15;
  if (content.includes("1/") || content.includes("🧵") || content.includes("👇") || content.includes("→") || content.includes("•")) retention += 20;
  if (content.length > 80 && content.length < 1500) retention += 10;
  retention = Math.min(100, Math.max(20, retention));

  // 5. CTA Strength
  let ctaStrength = 35;
  if (/(comment|share|repost|follow|drop a|what do you think|link in|bookmark|save this)/i.test(lower)) ctaStrength += 45;
  if (lower.includes("?")) ctaStrength += 15;
  ctaStrength = Math.min(100, Math.max(15, ctaStrength));

  // 6. Platform fit
  let platformFit = 65;
  if (platform === "x" && content.length <= 280) platformFit += 25;
  if (platform === "linkedin" && (content.includes("→") || lines.length > 4)) platformFit += 20;
  if (platform === "instagram" && content.includes("#")) platformFit += 15;
  platformFit = Math.min(100, Math.max(30, platformFit));

  const dimensions: ViralityDimensionScores = {
    hook,
    clarity,
    emotionalPull,
    retention,
    ctaStrength,
    platformFit,
  };

  const score = calculateWeightedScore(dimensions);
  const tier = determineTier(score);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (hook >= 70) strengths.push("Strong opening hook that arrests scroll attention.");
  else {
    weaknesses.push("Opening line is standard; lacks a strong curiosity gap.");
    recommendations.push("Rewrite the first sentence to introduce tension or a contrarian insight.");
  }

  if (retention >= 70) strengths.push("Excellent use of formatting and line breaks for readability.");
  else {
    weaknesses.push("Text formatting is dense; risk of reader drop-off.");
    recommendations.push("Break dense paragraphs into punchy 1-2 sentence lines with bullet points.");
  }

  if (ctaStrength >= 70) strengths.push("Clear, direct call-to-action.");
  else {
    weaknesses.push("Lacks an explicit prompt for audience engagement.");
    recommendations.push("Add a specific question or 'Drop a comment below' CTA to trigger algorithm ranking.");
  }

  return {
    score,
    tier,
    dimensions,
    strengths,
    weaknesses,
    recommendations,
    tips: recommendations, // Backwards-compatible mapping
    suggestedHook: hook < 70 ? `Stop doing ${firstLine.slice(0, 30)}... Here's what actually works:` : undefined,
  };
}

/* ── 4. Executable AI Tool Definition ─────────────────────────── */

export const evaluateViralityTool: AITool<
  EvaluateViralityInput,
  EvaluateViralityOutput
> = {
  name: "evaluate_virality",
  description: "Critique and evaluate a drafted post across 6 dimensions (hook, clarity, emotional pull, retention, CTA, platform fit) with structured scores and improvement recommendations.",
  parameters: {
    type: "object",
    properties: {
      post_content: {
        type: "string",
        description: "The full text of the draft post to evaluate",
      },
      platform: {
        type: "string",
        enum: ["x", "linkedin", "instagram", "tiktok", "facebook", "threads"],
        description: "Target platform to calibrate scoring criteria and character dynamics",
      },
    },
    required: ["post_content"],
  },

  validateInput(raw: unknown): EvaluateViralityInput {
    if (!raw || typeof raw !== "object") {
      throw new Error("Input must be an object containing 'post_content' or 'content'.");
    }
    const { post_content, content, platform } = raw as Record<string, unknown>;
    const text = typeof post_content === "string" ? post_content : typeof content === "string" ? content : "";
    if (!text.trim()) {
      throw new Error("Missing or empty 'post_content' or 'content' parameter.");
    }
    return {
      post_content: text.trim(),
      platform: typeof platform === "string" ? (platform as EvaluateViralityInput["platform"]) : undefined,
    };
  },

  async execute(
    input: EvaluateViralityInput,
    _context: AgentContext
  ): Promise<AgentResult<EvaluateViralityOutput>> {
    const { post_content, platform } = input;

    // 1. If OpenRouter is not configured or in dev, use robust heuristics
    if (!isConfigured()) {
      const heuristicResult = evaluateHeuristics(post_content, platform);
      return {
        success: true,
        data: heuristicResult,
      };
    }

    // 2. LLM Evaluator via OpenRouter
    const systemPrompt = `You are an elite social media content evaluator and viral strategist.
Analyze the following post draft for ${platform || "social media"}.
Evaluate these 6 core dimensions strictly on a 0-100 scale:
1. hook: Opening line ability to stop the scroll (0-100)
2. clarity: Readability, simplicity, single-topic focus (0-100)
3. emotionalPull: Empathy, curiosity, tension, inspiration (0-100)
4. retention: Formatting, pacing, whitespace, bullet structure (0-100)
5. ctaStrength: Clear engagement prompt or discussion question (0-100)
6. platformFit: Conformity to best practices for ${platform || "social platforms"} (0-100)

Return strictly valid JSON matching this schema:
{
  "hook": number,
  "clarity": number,
  "emotionalPull": number,
  "retention": number,
  "ctaStrength": number,
  "platformFit": number,
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[],
  "suggestedHook": string
}`;

    try {
      const res = await callAI(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: `POST DRAFT TO EVALUATE:\n"${post_content}"` },
        ],
        {
          agent: "score",
          temperature: 0.2,
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
        // Fallback to heuristic evaluation if JSON parse fails
        return {
          success: true,
          data: evaluateHeuristics(post_content, platform),
        };
      }

      const rawDimensions = {
        hook: Number(parsed.hook ?? 65),
        clarity: Number(parsed.clarity ?? 70),
        emotionalPull: Number(parsed.emotionalPull ?? 60),
        retention: Number(parsed.retention ?? 65),
        ctaStrength: Number(parsed.ctaStrength ?? 50),
        platformFit: Number(parsed.platformFit ?? 70),
      };

      const validatedDimensions = ViralityDimensionScoresSchema.parse(rawDimensions);
      const score = calculateWeightedScore(validatedDimensions);
      const tier = determineTier(score);

      const output: EvaluateViralityOutput = {
        score,
        tier,
        dimensions: validatedDimensions,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Clear topical focus"],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : ["Could improve call to action"],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ["Strengthen the opening hook"],
        tips: Array.isArray(parsed.recommendations) ? parsed.recommendations : ["Strengthen the opening hook"],
        suggestedHook: typeof parsed.suggestedHook === "string" ? parsed.suggestedHook : undefined,
      };

      const validatedOutput = EvaluateViralityOutputSchema.parse(output);

      return {
        success: true,
        data: validatedOutput,
        metadata: {
          model: res.model,
        },
      };
    } catch (err: any) {
      console.warn("[evaluate_virality] LLM evaluation error, falling back to heuristics:", err?.message);
      return {
        success: true,
        data: evaluateHeuristics(post_content, platform),
      };
    }
  },
};
