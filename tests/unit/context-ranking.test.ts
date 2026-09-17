import { describe, it, expect } from "vitest";
import { ContextRankingEngine } from "@/lib/ai/context/ranking";
import { ContextPriority, type ContextSection } from "@/lib/ai/context/types";
import { estimateTokens, TokenBudgetEngine } from "@/lib/ai/context/budget";

describe("ContextRankingEngine & TokenBudgetEngine", () => {
  const baseSection: ContextSection = {
    id: "sec-1",
    source: "semantic",
    title: "Sample Memory",
    content: "Content",
    priority: ContextPriority.LOW,
    relevanceScore: 0.5,
    importanceScore: 3,
    estimatedTokens: 100,
    isMandatory: false,
    target: "system_prompt",
  };

  it("unconditionally prioritizes mandatory sections regardless of score", () => {
    const normalHighSection: ContextSection = {
      ...baseSection,
      id: "high-score",
      priority: ContextPriority.HIGH,
      relevanceScore: 0.95,
      importanceScore: 5,
      isMandatory: false,
    };

    const mandatoryLowSection: ContextSection = {
      ...baseSection,
      id: "mandatory-low",
      priority: ContextPriority.LOW,
      relevanceScore: 0.1,
      importanceScore: 1,
      isMandatory: true,
    };

    const ranked = ContextRankingEngine.rank([normalHighSection, mandatoryLowSection]);
    expect(ranked[0].section.id).toBe("mandatory-low");
    expect(ranked[1].section.id).toBe("high-score");
  });

  it("produces deterministic ordering across identical inputs", () => {
    const sections: ContextSection[] = [
      { ...baseSection, id: "b-section", priority: ContextPriority.MEDIUM, relevanceScore: 0.7 },
      { ...baseSection, id: "a-section", priority: ContextPriority.MEDIUM, relevanceScore: 0.7 },
      { ...baseSection, id: "c-critical", priority: ContextPriority.CRITICAL, relevanceScore: 0.7 },
    ];

    const run1 = ContextRankingEngine.rank(sections).map((r) => r.section.id);
    const run2 = ContextRankingEngine.rank(sections).map((r) => r.section.id);

    expect(run1).toEqual(run2);
    // Critical comes first
    expect(run1[0]).toBe("c-critical");
    // Between equal score & priority, stable tie-breaker is ID ascending ("a-section" before "b-section")
    expect(run1[1]).toBe("a-section");
    expect(run1[2]).toBe("b-section");
  });

  it("selectWithinBudget retains mandatory sections and drops lower-priority sections when budget is exceeded", () => {
    const mandatory: ContextSection = {
      ...baseSection,
      id: "mandatory-safety",
      priority: ContextPriority.CRITICAL,
      estimatedTokens: 200,
      isMandatory: true,
    };

    const highValue: ContextSection = {
      ...baseSection,
      id: "high-val",
      priority: ContextPriority.HIGH,
      relevanceScore: 0.9,
      estimatedTokens: 300,
      isMandatory: false,
    };

    const lowValue: ContextSection = {
      ...baseSection,
      id: "low-val",
      priority: ContextPriority.LOW,
      relevanceScore: 0.2,
      estimatedTokens: 400,
      isMandatory: false,
    };

    const ranked = ContextRankingEngine.rank([lowValue, highValue, mandatory]);
    // Budget is 450: mandatory (200) + highVal (300) = 500, so only mandatory (200) + ?
    // If budget is 550, mandatory (200) + highVal (300) = 500 <= 550 fits, lowVal (400) dropped
    const result = ContextRankingEngine.selectWithinBudget(ranked, 550);

    expect(result.retained.map((r) => r.section.id)).toEqual(["mandatory-safety", "high-val"]);
    expect(result.pruned.map((p) => p.id)).toEqual(["low-val"]);
    expect(result.totalTokensUsed).toBe(500);
  });

  it("estimates tokens and calculates budget accurately", () => {
    const text = "Short prompt for testing token estimation accurately.";
    const tokens = estimateTokens(text);
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThan(text.length);

    const budget = TokenBudgetEngine.calculateBudget({
      workspaceId: "test-ws",
      messages: [{ role: "user", content: text }],
    });

    expect(budget.totalWindow).toBeGreaterThan(0);
    expect(budget.maxInputBudget).toBeGreaterThan(0);
    expect(budget.availableContextBudget).toBeGreaterThan(0);
  });
});
