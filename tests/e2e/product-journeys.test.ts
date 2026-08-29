import { describe, it, expect, beforeEach } from "vitest";
import { MemoryFormationEngine } from "@/lib/ai/memory/formation";
import { ContentIntelligenceEngine } from "@/lib/ai/content/engine";
import { GhostPolicyEngine } from "@/lib/ai/agents/ghost/policy";
import { ClosedLoopLearningEngine } from "@/lib/ai/content/learning";
import type { GhostDecision } from "@/lib/ai/agents/ghost/types";
import type { AgentContext } from "@/lib/ai/core/types";
import type { PostPerformanceSummary } from "@/lib/ai/memory/types";

describe("Product-Level End-to-End Golden Journeys", () => {
  const workspaceId = "ws_golden_enterprise_001";

  it("Journey A: New Workspace Onboarding & Brand Memory Ingestion", async () => {
    // 1. User configures brand rule
    const brandRuleText = "Never use the word 'cheap' or 'budget' in our social posts.";
    const evalResult = MemoryFormationEngine.evaluateText(brandRuleText);

    expect(evalResult.worthRemembering).toBe(true);
    expect(evalResult.memoryType).toBe("brand_rule");
    expect(evalResult.extractedTerms?.forbidden).toContain("cheap");

    // 2. User sets audience fact
    const audienceFactText = "Our target audience consists of early-stage SaaS founders and engineering leads.";
    const factResult = MemoryFormationEngine.evaluateText(audienceFactText);

    expect(factResult.worthRemembering).toBe(true);
    expect(factResult.memoryType).toBe("fact");
  });

  it("Journey B: Content Intelligence & Multi-Platform Repurposing", async () => {
    // 1. User requests thought leadership post with repurposing
    const result = await ContentIntelligenceEngine.generate(
      {
        topic: "Engineering Management Systems",
        targetPlatform: "linkedin",
        objective: "thought_leadership",
        repurposeTargets: ["x", "telegram"],
      },
      workspaceId
    );

    // 2. Verify primary LinkedIn draft
    expect(result.primaryDraft.platform).toBe("linkedin");
    expect(result.primaryDraft.hook).toContain("Engineering Management");
    expect(result.primaryDraft.callToAction).toBeDefined();
    expect(result.brandCompliancePassed).toBe(true);

    // 3. Verify repurposed drafts
    expect(result.repurposedDrafts.length).toBe(2);
    const xDraft = result.repurposedDrafts.find((d) => d.platform === "x");
    expect(xDraft).toBeDefined();
    expect(xDraft?.hook).toContain("🧵👇");
  });

  it("Journey C: Ghost Mode Autonomous Social Ingestion & Policy Gating", () => {
    const autoContext: AgentContext = {
      userId: "user_lead_01",
      workspaceId,
      autonomyMode: "auto",
    };

    const leadInput = {
      message: "Can we schedule a demo call for 50 seats?",
      senderName: "Enterprise Buyer",
      platform: "linkedin" as const,
    };

    const leadDecision: GhostDecision = {
      action: "flag_lead",
      confidence: 96,
      reasoning: "High-intent enterprise purchasing inquiry",
      reply: "We'd love to assist you! Our team will reach out directly with scheduling details.",
      isLead: true,
      riskLevel: "low",
      suggestedTags: ["enterprise", "sales_lead"],
    };

    // Policy evaluation ensures high-value lead requires human review
    const policy = GhostPolicyEngine.evaluate(leadDecision, leadInput, autoContext);

    expect(policy.decision).toBe("REQUIRE_APPROVAL");
    expect(policy.requiresHumanApproval).toBe(true);
    expect(policy.canDispatchImmediately).toBe(false);
  });

  it("Journey D: Closed-Loop Analytics & Continuous Learning", () => {
    // 1. Synced historical post outcomes
    const postData: PostPerformanceSummary = {
      id: "post_viral_01",
      platform: "linkedin",
      content: "Most founders manage sprint deadlines backwards. Here are 3 tactical frameworks:\n\n1. Async updates\n2. Blockers first\n3. Bi-weekly retros\n\nWhat is your team's preferred cadence? Comment below.",
      hook: "Most founders manage sprint deadlines backwards.",
      impressions: 25000,
      likes: 850,
      comments: 140,
      shares: 95,
      engagementRate: 5.6,
      postedAt: "2026-08-15",
    };

    // 2. Extract winning structural features
    const features = ClosedLoopLearningEngine.extractFeatures(postData);
    expect(features.hookType).toBe("contrarian");
    expect(features.ctaType).toBe("discussion");
    expect(features.engagementScore).toBeGreaterThan(70);

    // 3. Derive winning patterns for workspace memory
    const patterns = ClosedLoopLearningEngine.deriveWinningPatterns([postData]);
    expect(patterns.bestHookType).toBe("contrarian");
    expect(patterns.bestCtaType).toBe("discussion");
    expect(patterns.topExemplars.length).toBe(1);
  });
});
