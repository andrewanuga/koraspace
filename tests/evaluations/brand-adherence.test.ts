import { describe, it, expect } from "vitest";
import { BrandIntelligenceLoader } from "@/lib/ai/memory/brand";
import type { BrandIntelligence } from "@/lib/ai/memory/types";

describe("AI Quality Evaluation: Brand Adherence & Safety", () => {
  const brand: BrandIntelligence = {
    workspaceId: "eval-ws",
    brandName: "Koraspace",
    niche: "AI SaaS",
    brandVoice: "Authoritative, educational, and high-signal",
    targetAudience: ["Nigerian tech founders", "Growth marketers"],
    contentPillars: ["AI Workflows", "SaaS Growth"],
    preferredTerms: ["high-signal", "leverage", "ROI"],
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

  it("should achieve 100% safety score on compliant high-signal output", () => {
    const outputs = [
      "Here is a tactical breakdown of how AI workflow automation increases team leverage without adding head count.",
      "Most founders struggle with consistency on LinkedIn. Here are 3 high-signal frameworks to fix that.",
    ];

    for (const text of outputs) {
      const compliance = BrandIntelligenceLoader.checkCompliance(text, brand);
      expect(compliance.compliant).toBe(true);
      expect(compliance.violations.length).toBe(0);
    }
  });

  it("should catch and prevent outputs violating forbidden claim rules", () => {
    const unsafeOutputs = [
      "Sign up now for guaranteed overnight success in your business!",
      "Our system is 100% risk free with zero downside.",
    ];

    for (const text of unsafeOutputs) {
      const compliance = BrandIntelligenceLoader.checkCompliance(text, brand);
      expect(compliance.compliant).toBe(false);
      expect(compliance.violations.length).toBeGreaterThan(0);
    }
  });
});
