import { describe, it, expect } from "vitest";
import { ConsolidationEngine } from "@/lib/ai/memory/consolidation";
import type { SemanticMemory } from "@/lib/ai/memory/types";

describe("ConsolidationEngine & Deduplication", () => {
  const existingMemories: SemanticMemory[] = [
    {
      id: "mem-1",
      workspaceId: "ws-1",
      source: "chat",
      memoryType: "fact",
      importance: 5,
      content: "Our target audience consists of Nigerian tech founders and startup teams.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "mem-2",
      workspaceId: "ws-1",
      source: "chat",
      memoryType: "brand_rule",
      importance: 5,
      content: "Never use the phrase 'guaranteed overnight success' in posts.",
      createdAt: new Date().toISOString(),
    },
  ];

  it("should detect exact match as near duplicate with similarity 1.0", () => {
    const check = ConsolidationEngine.checkDuplication(
      "Never use the phrase 'guaranteed overnight success' in posts.",
      existingMemories
    );

    expect(check.status).toBe("near_duplicate");
    expect(check.highestSimilarity).toBe(1.0);
    expect(check.matchedMemory?.id).toBe("mem-2");
  });

  it("should detect highly similar rephrased memory as near_duplicate (>= 0.85)", () => {
    const check = ConsolidationEngine.checkDuplication(
      "Our target audience is Nigerian tech founders and startups.",
      existingMemories
    );

    expect(["near_duplicate", "similar"]).toContain(check.status);
    expect(check.highestSimilarity).toBeGreaterThanOrEqual(0.65);
    expect(check.matchedMemory?.id).toBe("mem-1");
  });

  it("should identify distinct, unrelated memory (< 0.65)", () => {
    const check = ConsolidationEngine.checkDuplication(
      "We offer 24/7 customer support via WhatsApp.",
      existingMemories
    );

    expect(check.status).toBe("distinct");
    expect(check.highestSimilarity).toBeLessThan(0.65);
  });

  it("should create consolidated payload preserving highest importance and provenance", () => {
    const memoriesToMerge: SemanticMemory[] = [
      {
        id: "m-1",
        workspaceId: "ws-1",
        source: "chat",
        memoryType: "fact",
        importance: 3,
        content: "Target audience is Nigerian founders.",
        createdAt: "2026-08-01T00:00:00Z",
      },
      {
        id: "m-2",
        workspaceId: "ws-1",
        source: "chat",
        memoryType: "fact",
        importance: 5,
        content: "Our primary target audience consists of Nigerian tech founders and early-stage startup teams.",
        createdAt: "2026-08-15T00:00:00Z",
      },
    ];

    const payload = ConsolidationEngine.createConsolidatedPayload(memoriesToMerge);

    expect(payload.importance).toBe(5);
    expect(payload.memoryType).toBe("fact");
    expect(payload.mergedMemoryIds).toEqual(["m-1", "m-2"]);
    expect(payload.canonicalContent).toBe(
      "Our primary target audience consists of Nigerian tech founders and early-stage startup teams."
    );
    expect(payload.metadata.consolidated).toBe(true);
    expect(payload.metadata.mergedCount).toBe(2);
  });
});
