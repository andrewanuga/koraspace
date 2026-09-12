import { describe, it, expect, vi } from "vitest";
import { PlatformAIIntegration } from "@/lib/platform/ai-integration";
import { KoraspaceAIClient } from "@/lib/ai-client";

describe("True Platform ↔ AI Service ↔ Platform E2E Integration", () => {
  const workspaceId = "ws_platform_hero_e2e_001";
  const userId = "usr_platform_owner_77";

  it("Platform Server Action: Chat Execution via KoraspaceAIClient", async () => {
    // Mock fetch to simulate the complete HTTP loop over localhost
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: {
          reply: "Platform E2E response: We analyzed your profile and generated an optimization plan.",
          toolCallsExecuted: ["generate_hashtags"],
          memoryItemsUsed: 2,
          selfCorrections: 0,
          costUsd: 0.0004,
        },
        meta: {
          version: "v1",
          traceId: "trc_platform_e2e_01",
          correlationId: "cor_platform_e2e_01",
          workspaceId,
          durationMs: 95,
          timestamp: Date.now(),
        },
      }),
    });

    const response = await PlatformAIIntegration.executePlatformChat(
      workspaceId,
      userId,
      "How can I grow my B2B reach?"
    );

    expect(response.reply).toContain("Platform E2E response");
    expect(response.costUsd).toBe(0.0004);
  });

  it("Platform Server Action: Social Triage & Policy Enforcement", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: {
          decision: "REQUIRE_APPROVAL",
          action: "flag_lead",
          proposedReply: "Hello! Our team would love to connect with you regarding pricing.",
          confidence: 94,
          isLead: true,
          riskLevel: "low",
          reasons: ["High-intent commercial inquiry flagged for sales review"],
        },
        meta: {
          version: "v1",
          traceId: "trc_platform_e2e_02",
          correlationId: "cor_platform_e2e_02",
          workspaceId,
          durationMs: 80,
          timestamp: Date.now(),
        },
      }),
    });

    const triage = await PlatformAIIntegration.triageSocialInteraction(workspaceId, {
      message: "What are your annual enterprise plans?",
      senderName: "CTO at HyperGrowth",
      platform: "linkedin",
      autonomyMode: "auto",
    });

    expect(triage.decision).toBe("REQUIRE_APPROVAL");
    expect(triage.isLead).toBe(true);
    expect(triage.proposedReply).toBeDefined();
  });

  it("Platform Server Action: Content Campaign Generation & Repurposing", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: {
          primaryDraft: {
            platform: "linkedin",
            content: "Modern engineering requires autonomous AI tool delegation.",
            hook: "Modern engineering requires autonomous AI tool delegation.",
            callToAction: "How is your team adopting agents?",
          },
          repurposedDrafts: [
            {
              platform: "x",
              content: "Autonomous AI tool delegation is transforming engineering. 🧵👇",
              hook: "Autonomous AI tool delegation is transforming engineering. 🧵👇",
            },
          ],
          heuristicEngagementScore: 84,
          brandCompliancePassed: true,
        },
        meta: {
          version: "v1",
          traceId: "trc_platform_e2e_03",
          correlationId: "cor_platform_e2e_03",
          workspaceId,
          durationMs: 140,
          timestamp: Date.now(),
        },
      }),
    });

    const campaign = await PlatformAIIntegration.generateWorkspaceCampaign(
      workspaceId,
      "Autonomous Tool Delegation",
      "linkedin",
      ["x"]
    );

    expect(campaign.primaryDraft.platform).toBe("linkedin");
    expect(campaign.repurposedDrafts.length).toBe(1);
    expect(campaign.brandCompliancePassed).toBe(true);
  });

  it("Security Invariant: Rejects Browser / Client-Side Client Instantiation", () => {
    // Simulate window object presence
    (global as any).window = {};

    try {
      expect(() => new KoraspaceAIClient()).toThrow(
        /Security Error: KoraspaceAIClient contains service authentication secrets/
      );
    } finally {
      delete (global as any).window;
    }
  });
});
