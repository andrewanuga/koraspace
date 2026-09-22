import { describe, it, expect } from "vitest";
import { MemoryFormationEngine } from "@/lib/ai/memory/formation";
import { ConsolidationEngine } from "@/lib/ai/memory/consolidation";
import type { SemanticMemory } from "@/lib/ai/memory/types";

describe("E2E Memory Lifecycle", () => {
  it("should complete the full lifecycle: Form -> Classify -> Deduplicate -> Consolidate -> Preserve Provenance", () => {
    // 1. Memory Formation from incoming text
    const text1 = "Our core audience consists of Nigerian fintech founders and CTOs.";
    const eval1 = MemoryFormationEngine.evaluateText(text1);

    expect(eval1.worthRemembering).toBe(true);
    expect(eval1.memoryType).toBe("fact");
    expect(eval1.importance).toBe(5);

    // 2. Simulate stored memories
    const memoryPool: SemanticMemory[] = [
      {
        id: "mem-alpha",
        workspaceId: "lifecycle-ws",
        source: "chat",
        memoryType: "fact",
        importance: 4,
        content: "Our target audience is Nigerian fintech startups.",
        createdAt: "2026-08-01T00:00:00Z",
      },
    ];

    // 3. Check duplication with incoming memory
    const text2 = "Our primary audience is Nigerian fintech startups and founders.";
    const dupCheck = ConsolidationEngine.checkDuplication(text2, memoryPool);

    expect(["near_duplicate", "similar"]).toContain(dupCheck.status);

    // 4. Execute consolidation
    const incomingMemory: SemanticMemory = {
      id: "mem-beta",
      workspaceId: "lifecycle-ws",
      source: "chat",
      memoryType: "fact",
      importance: 5,
      content: text2,
      createdAt: "2026-08-15T00:00:00Z",
    };

    const consolidated = ConsolidationEngine.createConsolidatedPayload(
      [memoryPool[0], incomingMemory],
      "Canonical Audience: Nigerian fintech founders, CTOs, and early-stage startup teams."
    );

    expect(consolidated.importance).toBe(5);
    expect(consolidated.mergedMemoryIds).toEqual(["mem-alpha", "mem-beta"]);
    expect(consolidated.metadata.consolidated).toBe(true);
    expect(consolidated.canonicalContent).toContain("Canonical Audience");
  });
});
