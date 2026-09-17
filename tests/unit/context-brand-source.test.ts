import { describe, it, expect, vi } from "vitest";
import { BrandSource } from "@/lib/ai/context/sources/brand";
import { ContextPriority, type ContextRequest } from "@/lib/ai/context/types";
import { BrandIntelligenceLoader } from "@/lib/ai/memory/brand";

describe("BrandSource Adapter", () => {
  const brandSource = new BrandSource();

  it("fails gracefully without throwing if workspaceId is missing", async () => {
    const request = {
      workspaceId: "",
      messages: [{ role: "user", content: "hello" }],
    } as ContextRequest;

    const result = await brandSource.fetch(request);
    expect(result.success).toBe(false);
    expect(result.sections).toEqual([]);
    expect(result.error).toContain("Missing workspaceId");
  });

  it("correctly partitions brand intelligence into mandatory guardrails and high-priority identity", async () => {
    const mockBrand = {
      workspaceId: "ws-test-123",
      brandName: "Acme AI",
      brandVoice: "Authoritative & witty",
      niche: "DevTools",
      targetAudience: ["Engineers"],
      contentPillars: ["System Design", "LLMs"],
      preferredTerms: ["deterministic", "production-ready"],
      forbiddenTerms: ["get rich quick", "100% guarantee"],
      ctaPreferences: ["Leave your thoughts"],
      brandGuidelines: ["Be concise."],
      styleTraits: {
        formality: "balanced" as const,
        emojiUse: "occasional" as const,
        sentenceLength: "short, punchy" as const,
        exclaimRate: 0,
        avgWordsPerSentence: 12,
      },
      sampleCount: 10,
    };

    vi.spyOn(BrandIntelligenceLoader, "load").mockResolvedValueOnce(mockBrand);

    const request: ContextRequest = {
      workspaceId: "ws-test-123",
      messages: [{ role: "user", content: "Write a post" }],
    };

    const result = await brandSource.fetch(request);

    expect(result.success).toBe(true);
    expect(result.sections.length).toBe(2);

    // Section 1: Guardrails
    const guardrailSec = result.sections.find((s) => s.id.startsWith("brand-guardrails"));
    expect(guardrailSec).toBeDefined();
    expect(guardrailSec?.isMandatory).toBe(true);
    expect(guardrailSec?.priority).toBe(ContextPriority.CRITICAL);
    expect(guardrailSec?.content).toContain("get rich quick");

    // Section 2: Identity
    const identitySec = result.sections.find((s) => s.id.startsWith("brand-identity"));
    expect(identitySec).toBeDefined();
    expect(identitySec?.isMandatory).toBe(false);
    expect(identitySec?.priority).toBe(ContextPriority.HIGH);
    expect(identitySec?.content).toContain("Acme AI");
    expect(identitySec?.content).toContain("DevTools");
  });

  it("handles loader exceptions gracefully without crashing", async () => {
    vi.spyOn(BrandIntelligenceLoader, "load").mockRejectedValueOnce(
      new Error("Database connection timeout")
    );

    const request: ContextRequest = {
      workspaceId: "ws-error",
      messages: [{ role: "user", content: "test" }],
    };

    const result = await brandSource.fetch(request);

    expect(result.success).toBe(false);
    expect(result.sections).toEqual([]);
    expect(result.error).toContain("Database connection timeout");
  });
});
