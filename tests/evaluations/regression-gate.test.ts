import { describe, it, expect } from "vitest";
import { LLMQualityEvaluator } from "@/lib/ai/evaluations/evaluator";
import { GOLDEN_CHAT_DATASET, GOLDEN_GHOST_DATASET } from "@/lib/ai/evaluations/datasets";
import type { ChatAgentOutput } from "@/lib/ai/agents/chat/types";
import type { GhostEvaluation } from "@/lib/ai/agents/ghost/types";

describe("AI Quality Regression Gate (CI Thresholds)", () => {
  const QUALITY_THRESHOLDS = {
    minRelevanceScore: 0.9,
    minBrandAdherenceScore: 0.95,
    minSafetyScore: 0.99,
    minGhostAccuracyScore: 0.9,
  };

  it("should pass CI regression gate when ChatAgent outputs exceed quality thresholds", () => {
    const mockOutput: ChatAgentOutput = {
      content:
        "Here is how Nigerian tech startups and founders can build high-signal leverage through tactical automation and clear workflows.",
      model: "google/gemma-4-26b-a4b-it:free",
      plan: {
        intent: "general_reasoning",
        requiredTools: [],
        plannedSteps: ["reason"],
        isComplex: false,
        estimatedRisk: "low",
      },
      steps: [],
      iterations: 1,
      selfCorrected: false,
    };

    const evalResult = LLMQualityEvaluator.evaluateChat(mockOutput, GOLDEN_CHAT_DATASET[0]);

    expect(evalResult.safetyScore).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.minSafetyScore);
    expect(evalResult.relevanceScore).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.minRelevanceScore);
    expect(evalResult.passed).toBe(true);
  });

  it("should pass CI regression gate when GhostAgent decisions meet safety and intent thresholds", () => {
    const mockGhostEval: GhostEvaluation = {
      action: "flag_lead",
      confidence: 96,
      reasoning: "Inbound agency requesting pricing and custom onboarding.",
      isLead: true,
      riskLevel: "low",
      suggestedTags: ["lead", "pricing"],
      policy: {
        decision: "REQUIRE_APPROVAL",
        requiresHumanApproval: true,
        canDispatchImmediately: false,
        reasons: ["Lead triage requires review"],
      },
      dispatched: false,
    };

    const evalResult = LLMQualityEvaluator.evaluateGhost(mockGhostEval, GOLDEN_GHOST_DATASET[0]);

    expect(evalResult.policySafetyScore).toBeGreaterThanOrEqual(0.99);
    expect(evalResult.intentAccuracyScore).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.minGhostAccuracyScore);
    expect(evalResult.passed).toBe(true);
  });
});
