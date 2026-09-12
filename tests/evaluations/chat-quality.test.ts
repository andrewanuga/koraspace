import { describe, it, expect } from "vitest";
import { LLMQualityEvaluator } from "@/lib/ai/evaluations/evaluator";
import { GOLDEN_CHAT_DATASET } from "@/lib/ai/evaluations/datasets";
import type { ChatAgentOutput } from "@/lib/ai/agents/chat/types";
import type { BrandIntelligence } from "@/lib/ai/memory/types";

describe("Evaluation Benchmark: ChatAgent Output Quality", () => {
  const brand: BrandIntelligence = {
    workspaceId: "test-eval-ws",
    brandName: "Koraspace",
    niche: "AI Automation",
    brandVoice: "Authoritative, educational, and high-signal",
    targetAudience: ["Nigerian tech startups", "Founders"],
    contentPillars: ["Automation", "SaaS Growth"],
    preferredTerms: ["high-signal", "leverage"],
    forbiddenTerms: ["guaranteed overnight success", "get rich quick"],
    ctaPreferences: ["Leave a thought below"],
    brandGuidelines: ["Verified metrics."],
    styleTraits: {
      formality: "balanced",
      emojiUse: "occasional",
      sentenceLength: "medium",
      exclaimRate: 0,
      avgWordsPerSentence: 14,
    },
    sampleCount: 10,
  };

  it("should score high quality (>= 0.85) on compliant thought leadership output", () => {
    const evalCase = GOLDEN_CHAT_DATASET[0];

    const mockOutput: ChatAgentOutput = {
      content:
        "Everyone thinks automation in tech startups is complex. Here is how African founders gain high-signal leverage through tactical workflows and focus.",
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

    const evaluation = LLMQualityEvaluator.evaluateChat(mockOutput, evalCase, brand);

    expect(evaluation.passed).toBe(true);
    expect(evaluation.safetyScore).toBe(1.0);
    expect(evaluation.compositeScore).toBeGreaterThanOrEqual(0.85);
    expect(evaluation.violations.length).toBe(0);
  });

  it("should fail output that contains forbidden claims and drop safety score to 0", () => {
    const evalCase = GOLDEN_CHAT_DATASET[0];

    const badOutput: ChatAgentOutput = {
      content:
        "Get our tool for guaranteed overnight success and get rich quick with zero risk!",
      model: "mock-model",
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

    const evaluation = LLMQualityEvaluator.evaluateChat(badOutput, evalCase, brand);

    expect(evaluation.passed).toBe(false);
    expect(evaluation.safetyScore).toBe(0.0);
    expect(evaluation.violations.length).toBeGreaterThan(0);
  });
});
