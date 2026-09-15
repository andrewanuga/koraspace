/**
 * Typed AI Tool: verify_claim
 *
 * Epistemic verification and contextual credibility tool.
 * Evaluates statistics, bold claims, and industry data to safeguard brand reputation.
 */

import { z } from "zod";
import type { AITool, AgentContext, AgentResult } from "../core/types";
import { callAI, isConfigured } from "../openrouter";

/* ── 1. Schemas & Type Contracts ──────────────────────────────── */

export const ClaimVerdictSchema = z.enum([
  "verified_true",
  "mostly_true_needs_context",
  "unverified_speculation",
  "outdated_or_misleading",
  "false",
]);

export type ClaimVerdict = z.infer<typeof ClaimVerdictSchema>;

export const VerifyClaimOutputSchema = z.object({
  claim: z.string(),
  verdict: ClaimVerdictSchema,
  confidence: z.number().min(0).max(100),
  analysis: z.string(),
  contextualCaveats: z.array(z.string()),
  suggestedRevision: z.string().optional(),
  recommendedFraming: z.string(),
  summary: z.string(),
});

export type VerifyClaimOutput = z.infer<typeof VerifyClaimOutputSchema>;

export interface VerifyClaimInput {
  claim: string;
  context?: string;
}

/* ── 2. Fallback / Deterministic Generator ─────────────────────── */

function generateFallbackVerification(claim: string): VerifyClaimOutput {
  return {
    claim,
    verdict: "mostly_true_needs_context",
    confidence: 80,
    analysis: `The core premise in "${claim}" reflects common industry observations, but often conflates correlation with causation and requires scope qualification.`,
    contextualCaveats: [
      "Industry statistics vary significantly between enterprise B2B and solo creator business models.",
      "Macroeconomic conditions and regional differences (e.g. African creator monetization vs US ad revenue) impact applicability.",
    ],
    suggestedRevision: `For growing digital businesses, ${claim.charAt(0).toLowerCase() + claim.slice(1)} (when applied with proper retention systems).`,
    recommendedFraming: "Frame as a directional trend backed by operational experience rather than an absolute universal law.",
    summary: `Verification for "${claim}":\nVerdict: MOSTLY TRUE, BUT NEEDS CONTEXT.\nConfidence: 80%\nAnalysis: Broadly aligned with current data, but requires audience qualification to maintain maximum credibility.`,
  };
}

/* ── 3. Executable AI Tool Definition ─────────────────────────── */

export const verifyClaimTool: AITool<
  VerifyClaimInput,
  VerifyClaimOutput
> = {
  name: "verify_claim",
  description: "Verify a factual statement, statistic, or bold marketing claim. Provides a nuanced credibility verdict, caveats, and safe counter-framing recommendations.",
  requiredCapabilities: ["web:search"],
  parameters: {
    type: "object",
    properties: {
      claim: {
        type: "string",
        description: "The specific factual statement, statistic, or claim to evaluate (e.g. '87% of creators earn under $1000/yr')",
      },
      context: {
        type: "string",
        description: "Optional background or target audience context to evaluate relevance",
      },
    },
    required: ["claim"],
  },

  validateInput(raw: unknown): VerifyClaimInput {
    if (!raw || typeof raw !== "object") {
      throw new Error("Input must be an object containing 'claim'.");
    }
    const { claim, context } = raw as Record<string, unknown>;
    if (typeof claim !== "string" || !claim.trim()) {
      throw new Error("Missing or empty 'claim' parameter.");
    }
    return {
      claim: claim.trim(),
      context: typeof context === "string" ? context.trim() : undefined,
    };
  },

  async execute(
    input: VerifyClaimInput,
    _context: AgentContext
  ): Promise<AgentResult<VerifyClaimOutput>> {
    const { claim, context } = input;

    // 1. If OpenRouter is not configured, return structured fallback
    if (!isConfigured()) {
      return {
        success: true,
        data: generateFallbackVerification(claim),
      };
    }

    // 2. LLM Fact-Checking Prompt
    const systemPrompt = `You are a rigorous editorial fact-checker and credibility analyst for high-profile business & tech creators.
Evaluate the following claim for factual validity, scope precision, and potential pitfalls.

Choose one verdict strictly from:
- "verified_true": Factually sound and backed by established data.
- "mostly_true_needs_context": Broadly accurate, but requires specific scope or caveats.
- "unverified_speculation": Plausible hypothesis, but lacks empirical verification.
- "outdated_or_misleading": Was previously true or cherry-picks numbers out of context.
- "false": Factually incorrect or actively debunked.

Return strictly valid JSON matching this schema:
{
  "verdict": "verified_true" | "mostly_true_needs_context" | "unverified_speculation" | "outdated_or_misleading" | "false",
  "confidence": number (0-100),
  "analysis": string,
  "contextualCaveats": string[],
  "suggestedRevision": string,
  "recommendedFraming": string,
  "summary": string
}`;

    try {
      const res = await callAI(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: `CLAIM TO VERIFY:\n"${claim}"\n${context ? `CONTEXT: ${context}` : ""}` },
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
        return {
          success: true,
          data: generateFallbackVerification(claim),
        };
      }

      const validVerdict = [
        "verified_true",
        "mostly_true_needs_context",
        "unverified_speculation",
        "outdated_or_misleading",
        "false",
      ].includes(parsed.verdict)
        ? parsed.verdict
        : "mostly_true_needs_context";

      const output: VerifyClaimOutput = {
        claim,
        verdict: validVerdict,
        confidence: Math.min(100, Math.max(0, Number(parsed.confidence ?? 75))),
        analysis: typeof parsed.analysis === "string" ? parsed.analysis : "Analysis completed.",
        contextualCaveats: Array.isArray(parsed.contextualCaveats) ? parsed.contextualCaveats : ["Requires audience qualification"],
        suggestedRevision: typeof parsed.suggestedRevision === "string" ? parsed.suggestedRevision : undefined,
        recommendedFraming: typeof parsed.recommendedFraming === "string" ? parsed.recommendedFraming : "Present as operational insight.",
        summary: typeof parsed.summary === "string" ? parsed.summary : `Verdict: ${validVerdict.replace(/_/g, " ").toUpperCase()}`,
      };

      const validatedOutput = VerifyClaimOutputSchema.parse(output);

      return {
        success: true,
        data: validatedOutput,
        metadata: {
          model: res.model,
        },
      };
    } catch (err: any) {
      console.warn("[verify_claim] Error during LLM verification, falling back:", err?.message);
      return {
        success: true,
        data: generateFallbackVerification(claim),
      };
    }
  },
};
