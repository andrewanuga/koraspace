import { describe, it, expect } from "vitest";
import { BrandIntelligenceLoader } from "@/lib/ai/memory/brand";
import type { BrandIntelligence } from "@/lib/ai/memory/types";

describe("BrandIntelligence & Guardrails", () => {
  const brand: BrandIntelligence = {
    workspaceId: "ws-test",
    brandName: "Koraspace",
    niche: "AI & Automation",
    brandVoice: "Authoritative, educational, and high-signal",
    targetAudience: ["Nigerian tech founders", "Growth marketers"],
    contentPillars: ["AI Workflows", "SaaS Growth"],
    preferredTerms: ["high-signal", "leverage"],
    forbiddenTerms: ["guaranteed overnight success", "get rich quick", "100% risk free"],
    ctaPreferences: ["Leave a thought in the comments"],
    brandGuidelines: ["Provide verified metrics."],
    styleTraits: {
      formality: "balanced",
      emojiUse: "occasional",
      sentenceLength: "medium",
      exclaimRate: 0,
      avgWordsPerSentence: 14,
    },
    sampleCount: 5,
  };

  it("should format structured system prompt section", () => {
    const formatted = BrandIntelligenceLoader.formatPromptSection(brand);

    expect(formatted).toContain("WORKSPACE BRAND INTELLIGENCE");
    expect(formatted).toContain("Nigerian tech founders");
    expect(formatted).toContain("guaranteed overnight success");
    expect(formatted).toContain("AI Workflows");
  });

  it("should flag content containing forbidden guardrail terms", () => {
    const report = BrandIntelligenceLoader.checkCompliance(
      "Get our new tool for guaranteed overnight success in 24 hours!",
      brand
    );

    expect(report.compliant).toBe(false);
    expect(report.violations.length).toBeGreaterThan(0);
    expect(report.violations[0]).toContain("guaranteed overnight success");
  });

  it("should approve compliant content with zero violations", () => {
    const report = BrandIntelligenceLoader.checkCompliance(
      "Here is a tactical breakdown of how AI automation increases team leverage.",
      brand
    );

    expect(report.compliant).toBe(true);
    expect(report.violations.length).toBe(0);
  });
});
