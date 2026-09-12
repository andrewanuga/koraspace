import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatEvaluator } from "@/lib/ai/agents/chat/evaluator";
import type { BrandIntelligence } from "@/lib/ai/memory/types";
import type { AgentContext } from "@/lib/ai/core/types";
import { defaultToolRegistry } from "@/lib/ai/tools/index";
import * as openrouter from "@/lib/ai/openrouter";

describe("ChatEvaluator (Evaluation & Guardrail Pipeline)", () => {
  const brand: BrandIntelligence = {
    workspaceId: "ws-test",
    brandName: "Koraspace",
    brandVoice: "Authoritative and concise",
    targetAudience: ["Tech founders"],
    contentPillars: ["AI Automation"],
    preferredTerms: ["high-signal"],
    forbiddenTerms: ["guaranteed overnight success", "get rich quick", "100% risk free"],
    ctaPreferences: ["Leave a thought below"],
    brandGuidelines: ["Be factual and direct"],
    styleTraits: {
      formality: "balanced",
      emojiUse: "occasional",
      sentenceLength: "medium",
      exclaimRate: 0,
      avgWordsPerSentence: 14,
    },
    sampleCount: 3,
  };

  const context: AgentContext = {
    userId: "test-user",
    workspaceId: "ws-test",
    autonomyMode: "assist",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should pass through clean content without modifications when self-correction is off", async () => {
    const inputContent = "Here is a high-signal breakdown of our new AI automation workflow for modern teams.";
    const result = await ChatEvaluator.evaluateAndRefine(
      inputContent,
      brand,
      context,
      {
        aiMessages: [{ role: "user", content: "Write a post" }],
        startingIteration: 1,
        requireSelfCorrection: false,
      }
    );

    expect(result.content).toBe(inputContent);
    expect(result.selfCorrected).toBe(false);
    expect(result.steps).toHaveLength(0);
    expect(result.finalIterations).toBe(1);
    expect(result.complianceReport?.compliant).toBe(true);
  });

  it("should trigger virality rewrite when score is below 65", async () => {
    const inputContent = "This is a generic post that lacks a strong hook or compelling structure for social.";

    vi.spyOn(defaultToolRegistry, "execute").mockResolvedValueOnce({
      success: true,
      data: {
        overallScore: 52,
        breakdown: { hook: 40, clarity: 60, cta: 55 },
      },
    } as any);

    const callAISpy = vi.spyOn(openrouter, "callAI").mockResolvedValueOnce({
      content: "Revised high-impact post with an authoritative hook and clear takeaways.",
    } as any);

    const result = await ChatEvaluator.evaluateAndRefine(
      inputContent,
      brand,
      context,
      {
        aiMessages: [{ role: "user", content: "Write a post" }],
        startingIteration: 2,
        requireSelfCorrection: true,
        model: "test-model",
      }
    );

    expect(result.selfCorrected).toBe(true);
    expect(result.content).toBe("Revised high-impact post with an authoritative hook and clear takeaways.");
    expect(result.finalIterations).toBe(3);
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].type).toBe("self_correction");
    expect(result.steps[0].stepIndex).toBe(3);
    expect(result.steps[0].thought).toContain("scored 52/100");

    expect(callAISpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: "assistant", content: inputContent }),
        expect.objectContaining({ role: "system", content: expect.stringContaining("Self-Correction Trigger") }),
      ]),
      expect.objectContaining({ temperature: 0.5, model: "test-model" })
    );
  });

  it("should not trigger virality rewrite when score is 65 or above", async () => {
    const inputContent = "This is an effective post with strong clarity and an engaging opening hook.";

    vi.spyOn(defaultToolRegistry, "execute").mockResolvedValueOnce({
      success: true,
      data: {
        overallScore: 78,
        breakdown: { hook: 80, clarity: 75, cta: 80 },
      },
    } as any);

    const callAISpy = vi.spyOn(openrouter, "callAI");

    const result = await ChatEvaluator.evaluateAndRefine(
      inputContent,
      brand,
      context,
      {
        aiMessages: [{ role: "user", content: "Write a post" }],
        startingIteration: 1,
        requireSelfCorrection: true,
      }
    );

    expect(result.selfCorrected).toBe(false);
    expect(result.content).toBe(inputContent);
    expect(result.steps).toHaveLength(0);
    expect(result.finalIterations).toBe(1);
    expect(callAISpy).not.toHaveBeenCalled();
  });

  it("should trigger brand compliance sanitization when forbidden terms are present", async () => {
    const violatingContent = "Our framework provides guaranteed overnight success for any creator looking to scale.";

    const callAISpy = vi.spyOn(openrouter, "callAI").mockResolvedValueOnce({
      content: "Our framework provides a proven roadmap for any creator looking to scale sustainably.",
    } as any);

    const result = await ChatEvaluator.evaluateAndRefine(
      violatingContent,
      brand,
      context,
      {
        aiMessages: [{ role: "user", content: "Write a post" }],
        startingIteration: 1,
        requireSelfCorrection: false,
      }
    );

    expect(result.content).toBe("Our framework provides a proven roadmap for any creator looking to scale sustainably.");
    expect(result.finalIterations).toBe(2);
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].type).toBe("self_correction");
    expect(result.steps[0].stepIndex).toBe(2);
    expect(result.steps[0].thought).toContain("Brand compliance violation detected");
    expect(result.steps[0].thought).toContain("guaranteed overnight success");

    expect(callAISpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: "assistant", content: violatingContent }),
        expect.objectContaining({ role: "system", content: expect.stringContaining("Compliance Guardrail Trigger") }),
      ]),
      expect.objectContaining({ temperature: 0.3 })
    );
  });

  it("should execute sequential corrections: virality rewrite followed by brand compliance sanitization", async () => {
    const initialDraft = "Try our tool today to get rich quick and expand your audience across all channels.";

    // Pass 1: Virality check returns low score
    vi.spyOn(defaultToolRegistry, "execute").mockResolvedValueOnce({
      success: true,
      data: {
        overallScore: 45,
        breakdown: { hook: 30, clarity: 50 },
      },
    } as any);

    // Rewrite still contains forbidden term "get rich quick"
    const callAISpy = vi.spyOn(openrouter, "callAI")
      .mockResolvedValueOnce({
        content: "Here is the blueprint to get rich quick with proven audience growth strategies.",
      } as any)
      .mockResolvedValueOnce({
        content: "Here is the blueprint for sustainable audience growth with proven retention strategies.",
      } as any);

    const result = await ChatEvaluator.evaluateAndRefine(
      initialDraft,
      brand,
      context,
      {
        aiMessages: [{ role: "user", content: "Write a post" }],
        startingIteration: 1,
        requireSelfCorrection: true,
      }
    );

    expect(result.selfCorrected).toBe(true);
    expect(result.content).toBe("Here is the blueprint for sustainable audience growth with proven retention strategies.");
    expect(result.finalIterations).toBe(3); // 1 start + 1 virality + 1 compliance
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].stepIndex).toBe(2);
    expect(result.steps[0].thought).toContain("scored 45/100");
    expect(result.steps[1].stepIndex).toBe(3);
    expect(result.steps[1].thought).toContain("get rich quick");
    expect(callAISpy).toHaveBeenCalledTimes(2);
  });
});
