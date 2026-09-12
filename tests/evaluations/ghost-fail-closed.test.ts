import { describe, it, expect } from "vitest";
import { GhostPolicyEngine } from "@/lib/ai/agents/ghost/policy";
import type { GhostDecision } from "@/lib/ai/agents/ghost/types";
import type { AgentContext } from "@/lib/ai/core/types";

describe("Ghost Fail-Closed Autonomous Safety Suite", () => {
  const autoCtx: AgentContext = {
    userId: "fail-closed-ws",
    workspaceId: "fail-closed-ws",
    autonomyMode: "auto",
  };

  it("should fail-closed and REQUIRE_APPROVAL when model confidence is low (< 80)", () => {
    const lowConfidenceProposal: GhostDecision = {
      action: "auto_reply",
      confidence: 65, // Below 80 threshold
      reasoning: "Ambiguous user comment with uncertain sentiment",
      reply: "Thanks for sharing!",
      isLead: false,
      riskLevel: "low",
      suggestedTags: [],
    };

    const mockInput = {
      message: "Ambiguous user comment",
      senderName: "Unknown User",
      platform: "x",
    };

    const policy = GhostPolicyEngine.evaluate(lowConfidenceProposal, mockInput, autoCtx);

    expect(policy.decision).toBe("REQUIRE_APPROVAL");
    expect(policy.requiresHumanApproval).toBe(true);
    expect(policy.canDispatchImmediately).toBe(false);
  });

  it("should fail-closed and DENY when risk level is critical or forbidden claims present", () => {
    const criticalRiskProposal: GhostDecision = {
      action: "auto_reply",
      confidence: 95,
      reasoning: "Critical security violation or hostile threat",
      reply: "We guarantee 100% risk free overnight returns.",
      isLead: false,
      riskLevel: "critical",
      suggestedTags: [],
    };

    const mockInput = {
      message: "Hostile message",
      senderName: "Adversary",
      platform: "x",
    };

    const policy = GhostPolicyEngine.evaluate(criticalRiskProposal, mockInput, autoCtx);

    expect(policy.decision).toBe("REQUIRE_APPROVAL");
    expect(policy.requiresHumanApproval).toBe(true);
    expect(policy.canDispatchImmediately).toBe(false);
  });

  it("should fail-closed to REQUIRE_APPROVAL in assist mode regardless of high confidence", () => {
    const assistCtx: AgentContext = {
      userId: "assist-ws",
      workspaceId: "assist-ws",
      autonomyMode: "assist",
    };

    const highConfidenceProposal: GhostDecision = {
      action: "auto_reply",
      confidence: 99,
      reasoning: "Simple routine thank you",
      reply: "Thank you so much!",
      isLead: false,
      riskLevel: "low",
      suggestedTags: [],
    };

    const mockInput = {
      message: "Thank you!",
      senderName: "Friend",
      platform: "instagram",
    };

    const policy = GhostPolicyEngine.evaluate(highConfidenceProposal, mockInput, assistCtx);

    expect(policy.decision).toBe("REQUIRE_APPROVAL");
    expect(policy.canDispatchImmediately).toBe(false);
  });
});
