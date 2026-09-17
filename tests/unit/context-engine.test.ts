// tests/unit/context-engine.test.ts

import { describe, it, expect, vi } from "vitest";
import { ContextEngine } from "../../lib/ai/context/engine";
import { ContextPriority, type ContextSection, type ContextRequest } from "../../lib/ai/context/types";
import { type SourceResult, type ContextSource } from "../../lib/ai/context/types";

/** Helper to create a mock source */
class MockSource implements ContextSource {
  readonly name: string;
  readonly priority: ContextPriority;
  private result: SourceResult;

  constructor(name: string, priority: ContextPriority, result: SourceResult) {
    this.name = name;
    this.priority = priority;
    this.result = result;
  }

  async fetch(_: ContextRequest, __?: number): Promise<SourceResult> {
    return this.result;
  }
}

function makeSection(overrides: Partial<ContextSection> = {}): ContextSection {
  return {
    id: `section-${Math.random().toString(36).slice(2, 8)}`,
    source: "mock",
    title: "Mock Section",
    content: "Lorem ipsum dolor sit amet.",
    priority: ContextPriority.LOW,
    relevanceScore: 0.5,
    importanceScore: 3,
    estimatedTokens: 30,
    isMandatory: false,
    target: "system_prompt",
    metadata: {},
    ...overrides,
  };
}

describe("ContextEngine integration", () => {
  it("assembles full context when all sources succeed", async () => {
    const sections = [
      makeSection({ priority: ContextPriority.CRITICAL, isMandatory: true, estimatedTokens: 50 }),
      makeSection({ priority: ContextPriority.HIGH, estimatedTokens: 80 }),
      makeSection({ priority: ContextPriority.MEDIUM, estimatedTokens: 70 }),
    ];
    const mockSources: ContextSource[] = sections.map((sec, i) =>
      new MockSource(`src${i}`, sec.priority, {
        source: `src${i}`,
        sections: [sec],
        latencyMs: 10,
        success: true,
      })
    );
    const engine = new ContextEngine(mockSources);
    const request: ContextRequest = {
      workspaceId: "ws-1",
      messages: [],
    } as any;
    const result = await engine.assemble(request);
    expect(result.systemPrompt).toContain(sections[0].content);
    expect(result.retainedSectionIds.length).toBeGreaterThan(0);
    expect(result.prunedSections).toHaveLength(0);
  });

  it("preserves mandatory CRITICAL sections under budget pressure", async () => {
    const mandatory = makeSection({ priority: ContextPriority.CRITICAL, isMandatory: true, estimatedTokens: 1200 });
    const normal = makeSection({ priority: ContextPriority.LOW, estimatedTokens: 50 });
    const mockSources: ContextSource[] = [
      new MockSource("brand", mandatory.priority, { source: "brand", sections: [mandatory], latencyMs: 5, success: true }),
      new MockSource("semantic", normal.priority, { source: "semantic", sections: [normal], latencyMs: 5, success: true }),
    ];
    const engine = new ContextEngine(mockSources);
    const request: ContextRequest = { workspaceId: "ws-1", messages: [] } as any;
    const result = await engine.assemble(request);
    // Mandatory must be retained even if it alone exceeds budget.
    expect(result.retainedSectionIds).toContain(mandatory.id);
    expect(result.compressedSections).toBeDefined();
  });

  it("continues when a single source fails", async () => {
    const good = makeSection({ priority: ContextPriority.HIGH, estimatedTokens: 40 });
    const failingSource: ContextSource = new MockSource("fail", ContextPriority.MEDIUM, {
      source: "fail",
      sections: [],
      latencyMs: 5,
      success: false,
      error: "Intentional failure",
    });
    const engine = new ContextEngine([
      new MockSource("good", good.priority, { source: "good", sections: [good], latencyMs: 5, success: true }),
      failingSource,
    ]);
    const request: ContextRequest = { workspaceId: "ws-1", messages: [] } as any;
    const result = await engine.assemble(request);
    expect(result.retainedSectionIds).toContain(good.id);
    expect(result.prunedSections).toBeDefined();
    // sourceResults should include the failure entry.
    expect((result as any).metadata).toBeDefined();
  });

  it("handles multiple source failures and still produces a valid result", async () => {
    const good = makeSection({ priority: ContextPriority.LOW, estimatedTokens: 30 });
    const fail1 = new MockSource("fail1", ContextPriority.HIGH, {
      source: "fail1",
      sections: [],
      latencyMs: 5,
      success: false,
      error: "boom",
    });
    const fail2 = new MockSource("fail2", ContextPriority.MEDIUM, {
      source: "fail2",
      sections: [],
      latencyMs: 5,
      success: false,
      error: "boom2",
    });
    const engine = new ContextEngine([
      new MockSource("good", good.priority, { source: "good", sections: [good], latencyMs: 5, success: true }),
      fail1,
      fail2,
    ]);
    const request: ContextRequest = { workspaceId: "ws-1", messages: [] } as any;
    const result = await engine.assemble(request);
    expect(result.retainedSectionIds).toContain(good.id);
    // Ensure result is still well‑formed.
    expect(result.systemPrompt).toBeTruthy();
  });

  // Additional tests for ranking, compression and deterministic output can be added similarly.
});
