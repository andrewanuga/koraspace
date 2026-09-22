/**
 * Unified Score Agent (ScoreAgent)
 *
 * Specializes in content virality evaluation, posting schedule optimization,
 * and actionable copywriting improvements.
 */

import { z } from "zod";
import type { AgentContext, AgentResult } from "../core/types";
import { evaluateViralityTool, EvaluateViralityOutput, EvaluateViralityInput } from "../tools/virality";

/* -- 1. Schemas & Contracts ------------------------------------- */

export const ScoreAgentOutputSchema = z.object({
  score: z.number().min(0).max(100),
  prediction: z.enum(["high", "medium", "low", "viral_candidate"]),
  bestTime: z.string(),
  reasoning: z.string(),
  improvements: z.array(z.string()),
  evaluation: z.any().optional(), // Full virality dimensions if available
});

export type ScoreAgentOutput = z.infer<typeof ScoreAgentOutputSchema>;

export interface ScoreAgentInput {
  content: string;
  platform?: EvaluateViralityInput["platform"];
}

/* -- 2. Unified Score Agent Implementation ---------------------- */

export class ScoreAgent {
  public static async evaluate(
    input: ScoreAgentInput,
    context: AgentContext
  ): Promise<AgentResult<ScoreAgentOutput>> {
    const startTime = Date.now();
    const { content, platform = "x" } = input;

    // Delegate to evaluateViralityTool
    const viralityRes = await evaluateViralityTool.execute(
      { post_content: content, platform },
      context
    );

    if (viralityRes.success && viralityRes.data) {
      const v = viralityRes.data;

      // Predict optimal timing based on platform
      let bestTime = "Thursday 8:00am WAT";
      if (platform === "linkedin") bestTime = "Tuesday 8:30am WAT";
      if (platform === "instagram") bestTime = "Wednesday 7:00pm WAT";
      if (platform === "tiktok") bestTime = "Friday 6:00pm WAT";

      const prediction: ScoreAgentOutput["prediction"] =
        v.score >= 85 ? "viral_candidate" : v.score >= 70 ? "high" : v.score >= 50 ? "medium" : "low";

      const reasoning =
        v.strengths.length > 0
          ? `${v.strengths[0]} ${v.weaknesses.length > 0 ? `However, ${v.weaknesses[0].toLowerCase()}` : ""}`
          : "Evaluated across multi-factor virality dimensions.";

      const output: ScoreAgentOutput = {
        score: v.score,
        prediction,
        bestTime,
        reasoning,
        improvements: v.recommendations.length > 0 ? v.recommendations : v.tips,
        evaluation: v,
      };

      return {
        success: true,
        data: output,
        metadata: {
          latencyMs: Date.now() - startTime,
          model: viralityRes.metadata?.model,
        },
      };
    }

    return {
      success: false,
      error: viralityRes.error || {
        code: "SCORING_FAILED",
        message: "Failed to evaluate content virality.",
      },
    };
  }
}
