import { describe, it, expect } from "vitest";
import { CostTracker } from "@/lib/ai/core/cost";

describe("CostTracker & Token Accounting", () => {
  it("should calculate correct cost for OpenAI GPT-4o mini", () => {
    const usage = {
      prompt_tokens: 2000,
      completion_tokens: 500,
      total_tokens: 2500,
    };

    const cost = CostTracker.calculateCost("openai/gpt-4o-mini", usage);
    // (2 * 0.00015) + (0.5 * 0.0006) = 0.0003 + 0.0003 = 0.0006
    expect(cost.promptCostUsd).toBe(0.0003);
    expect(cost.completionCostUsd).toBe(0.0003);
    expect(cost.totalCostUsd).toBe(0.0006);
  });

  it("should return zero cost for free models", () => {
    const usage = {
      prompt_tokens: 5000,
      completion_tokens: 1500,
      total_tokens: 6500,
    };

    const cost = CostTracker.calculateCost("google/gemma-4-26b-a4b-it:free", usage);
    expect(cost.totalCostUsd).toBe(0);
  });

  it("should accurately estimate tokens from string length", () => {
    const text = "This is a sample sentence with thirty-two characters.";
    const estimated = CostTracker.estimateTokens(text);
    expect(estimated).toBe(Math.ceil(text.length / 4));
  });
});
