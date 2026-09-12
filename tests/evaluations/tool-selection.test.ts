import { describe, it, expect } from "vitest";
import { ChatPlanner } from "@/lib/ai/agents/chat/planner";
import { GOLDEN_CHAT_DATASET } from "@/lib/ai/evaluations/datasets";

describe("Evaluation Benchmark: Tool Selection Accuracy", () => {
  it("should accurately select scrape_url and analyze_competitor for competitor research", () => {
    const competitorCase = GOLDEN_CHAT_DATASET[1];
    const plan = ChatPlanner.plan([{ role: "user", content: competitorCase.userPrompt }]);

    for (const tool of competitorCase.expectedTools) {
      expect(plan.requiredTools).toContain(tool);
    }
  });

  it("should accurately select verify_claim for fact-checking requests", () => {
    const claimCase = GOLDEN_CHAT_DATASET[2];
    const plan = ChatPlanner.plan([{ role: "user", content: claimCase.userPrompt }]);

    for (const tool of claimCase.expectedTools) {
      expect(plan.requiredTools).toContain(tool);
    }
  });
});
