import { describe, it, expect } from "vitest";
import {
  ContextCompressionEngine,
  compactText,
  trimOversizedContent,
} from "@/lib/ai/context/compression";
import { ContextRankingEngine } from "@/lib/ai/context/ranking";
import { ContextPriority, type ContextSection } from "@/lib/ai/context/types";

describe("ContextCompressionEngine", () => {
  const baseSection: ContextSection = {
    id: "sec-base",
    source: "semantic",
    title: "Base Section",
    content: "Content",
    priority: ContextPriority.LOW,
    relevanceScore: 0.5,
    importanceScore: 3,
    estimatedTokens: 50,
    isMandatory: false,
    target: "system_prompt",
  };

  it("compactText normalizes whitespace while preserving markdown code blocks", () => {
    const raw = "Line 1   with   spaces\n\n\n\nLine 2\n```\nconst x =    1;\n\nconst y = 2;\n```\n\n\nLine 3";
    const compacted = compactText(raw);

    expect(compacted).toContain("Line 1 with spaces");
    expect(compacted).not.toContain("\n\n\n\n");
    expect(compacted).toContain("const x =    1;"); // preserved indentation in code
    expect(compacted).toContain("Line 3");
  });

  it("trimOversizedContent trims text deterministically and adds truncation notice", () => {
    const longText = "Word ".repeat(600); // ~600 words, ~750 tokens
    const result = trimOversizedContent(longText, 200);

    expect(result.trimmed).toBe(true);
    expect(result.newTokens).toBeLessThanOrEqual(210);
    expect(result.content).toContain("[... content truncated to fit context window ...]");
  });

  it("mandatory sections survive compression even when budget is zero or tight", () => {
    const mandatorySection: ContextSection = {
      ...baseSection,
      id: "mandatory-rules",
      content: "Critical safety rules that must never be dropped under any circumstance.",
      estimatedTokens: 80,
      priority: ContextPriority.CRITICAL,
      isMandatory: true,
    };

    const ranked = ContextRankingEngine.rank([mandatorySection]);
    // Budget is only 20 tokens, but section is 80
    const result = ContextCompressionEngine.compress(ranked, { targetBudget: 20 });

    expect(result.retained.length).toBe(1);
    expect(result.retained[0].section.id).toBe("mandatory-rules");
    expect(result.mandatoryTokens).toBe(80);
    expect(result.mandatoryOverflow).toBe(true);
    expect(result.overflowTokens).toBe(60);
  });

  it("removes lowest-ranked sections first under token pressure", () => {
    const highRanked: ContextSection = {
      ...baseSection,
      id: "high-ranked",
      priority: ContextPriority.HIGH,
      relevanceScore: 0.9,
      estimatedTokens: 100,
    };

    const lowRanked: ContextSection = {
      ...baseSection,
      id: "low-ranked",
      priority: ContextPriority.LOW,
      relevanceScore: 0.1,
      estimatedTokens: 100,
    };

    const ranked = ContextRankingEngine.rank([lowRanked, highRanked]);
    // Target budget: 120 (can only fit one section)
    const result = ContextCompressionEngine.compress(ranked, { targetBudget: 120 });

    expect(result.retained.map((r) => r.section.id)).toEqual(["high-ranked"]);
    expect(result.pruned.map((p) => p.id)).toEqual(["low-ranked"]);
    expect(result.totalTokens).toBeLessThanOrEqual(120);
  });

  it("leaves already-valid context unchanged and without prunes", () => {
    const sec1: ContextSection = { ...baseSection, id: "sec-1", estimatedTokens: 40 };
    const sec2: ContextSection = { ...baseSection, id: "sec-2", estimatedTokens: 50 };

    const ranked = ContextRankingEngine.rank([sec1, sec2]);
    const result = ContextCompressionEngine.compress(ranked, { targetBudget: 500 });

    expect(result.retained.length).toBe(2);
    expect(result.pruned.length).toBe(0);
    expect(result.overflowTokens).toBe(0);
  });

  it("handles negative or zero budget safely without crashing", () => {
    const sec: ContextSection = { ...baseSection, id: "sec-1", estimatedTokens: 50 };
    const ranked = ContextRankingEngine.rank([sec]);

    const result = ContextCompressionEngine.compress(ranked, { targetBudget: -50 });
    expect(result.retained.length).toBe(0);
    expect(result.pruned.length).toBe(1);
  });

  it("produces deterministic output across multiple runs on identical input", () => {
    const sections: ContextSection[] = [
      { ...baseSection, id: "b", estimatedTokens: 80, priority: ContextPriority.MEDIUM },
      { ...baseSection, id: "a", estimatedTokens: 80, priority: ContextPriority.MEDIUM },
      { ...baseSection, id: "m", estimatedTokens: 80, priority: ContextPriority.HIGH, isMandatory: true },
    ];

    const ranked = ContextRankingEngine.rank(sections);
    const run1 = ContextCompressionEngine.compress(ranked, { targetBudget: 180 });
    const run2 = ContextCompressionEngine.compress(ranked, { targetBudget: 180 });

    expect(run1.retained.map((r) => r.section.id)).toEqual(run2.retained.map((r) => r.section.id));
    expect(run1.pruned.map((p) => p.id)).toEqual(run2.pruned.map((p) => p.id));
    expect(run1.totalTokens).toEqual(run2.totalTokens);
  });
});
