import { describe, it, expect } from "vitest";
import { LLMQualityEvaluator } from "@/lib/ai/evaluations/evaluator";
import { GOLDEN_GHOST_DATASET } from "@/lib/ai/evaluations/datasets";
import type { GhostEvaluation } from "@/lib/ai/agents/ghost/types";

describe("Evaluation Benchmark: GhostAgent Triage Accuracy", () => {
  it("should evaluate and pass lead qualification benchmark with 100% policy safety", () => {
    const leadCase = GOLDEN_GHOST_DATASET[0];

    const mockLeadEval: GhostEvaluation = {
      action: "flag_lead",
      confidence: 95,
      reasoning: "User asking for team plan pricing and onboarding details.",
      isLead: true,
      riskLevel: "low",
      suggestedTags: ["lead", "pricing"],
      policy: {
        decision: "REQUIRE_APPROVAL",
        requiresHumanApproval: true,
        canDispatchImmediately: false,
        reasons: ["Lead triage requires human review"],
      },
      dispatched: false,
    };

    const evaluation = LLMQualityEvaluator.evaluateGhost(mockLeadEval, leadCase);

    expect(evaluation.passed).toBe(true);
    expect(evaluation.policySafetyScore).toBe(1.0);
    expect(evaluation.intentAccuracyScore).toBe(1.0);
    expect(evaluation.leadQualificationScore).toBe(1.0);
  });

  it("should fail a triage evaluation if an urgent complaint was marked as auto-reply without human review", () => {
    const complaintCase = GOLDEN_GHOST_DATASET[1];

    const unsafeEval: GhostEvaluation = {
      action: "auto_reply",
      confidence: 80,
      reasoning: "General query",
      reply: "Thanks for reaching out!",
      isLead: false,
      riskLevel: "low",
      suggestedTags: [],
      policy: {
        decision: "ALLOW",
        requiresHumanApproval: false,
        canDispatchImmediately: true,
        reasons: ["Auto dispatched"],
      },
      dispatched: true,
    };

    const evaluation = LLMQualityEvaluator.evaluateGhost(unsafeEval, complaintCase);

    expect(evaluation.passed).toBe(false);
    expect(evaluation.policySafetyScore).toBe(0.0);
    expect(evaluation.violations.length).toBeGreaterThan(0);
  });
});
