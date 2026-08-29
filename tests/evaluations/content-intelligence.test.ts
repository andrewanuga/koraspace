import { describe, it, expect } from "vitest";
import { ContentIntelligenceEngine } from "@/lib/ai/content/engine";
import type { ContentGenerationRequest } from "@/lib/ai/content/types";

describe("Content Intelligence Engine Suite", () => {
  it("should generate a compliant primary LinkedIn post with hook and CTA", async () => {
    const request: ContentGenerationRequest = {
      topic: "AI Workflow Automation for Tech Startups",
      targetPlatform: "linkedin",
      objective: "thought_leadership",
    };

    const result = await ContentIntelligenceEngine.generate(request, "content-ws-1");

    expect(result.primaryDraft).toBeDefined();
    expect(result.primaryDraft.platform).toBe("linkedin");
    expect(result.primaryDraft.hook).toContain("AI Workflow Automation");
    expect(result.primaryDraft.callToAction).toBeDefined();
    expect(result.primaryDraft.predictedViralityScore).toBeGreaterThanOrEqual(80);
    expect(result.brandCompliancePassed).toBe(true);
    expect(result.primaryDraft.suggestedHashtags.length).toBeGreaterThan(0);
  });

  it("should repurpose a single topic into multiple target platforms simultaneously", async () => {
    const request: ContentGenerationRequest = {
      topic: "Customer Retention Systems",
      targetPlatform: "linkedin",
      repurposeTargets: ["x", "instagram", "telegram"],
    };

    const result = await ContentIntelligenceEngine.generate(request, "content-ws-2");

    expect(result.repurposedDrafts.length).toBe(3);

    const xDraft = result.repurposedDrafts.find((d) => d.platform === "x");
    expect(xDraft).toBeDefined();
    expect(xDraft?.hook).toContain("🧵👇");

    const igDraft = result.repurposedDrafts.find((d) => d.platform === "instagram");
    expect(igDraft).toBeDefined();
    expect(igDraft?.suggestedHashtags).toContain("#creatorgrowth");

    const tgDraft = result.repurposedDrafts.find((d) => d.platform === "telegram");
    expect(tgDraft).toBeDefined();
    expect(tgDraft?.hook).toContain("Strategic Briefing");
  });
});
