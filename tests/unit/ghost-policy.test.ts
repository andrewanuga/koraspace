import { describe, it, expect } from "vitest";
import { GhostPolicyEngine } from "@/lib/ai/agents/ghost/policy";
import type { GhostDecision, GhostInput } from "@/lib/ai/agents/ghost/types";
import type { AgentContext } from "@/lib/ai/core/types";

describe("GhostPolicyEngine (Deterministic Safety Layer)", () => {
  const assistCtx: AgentContext = {
    userId: "test-user",
    workspaceId: "test-workspace",
    autonomyMode: "assist",
  };

  const autoCtx: AgentContext = {
    userId: "test-user",
    workspaceId: "test-workspace",
    autonomyMode: "auto",
  };

  it("should drop spam / ignore intent safely without human approval", () => {
    const decision: GhostDecision = {
      action: "ignore",
      confidence: 90,
      reasoning: "Spam link dump",
      isLead: false,
      riskLevel: "low",
      suggestedTags: [],
    };
    const input: GhostInput = { message: "check this crypto site" };

    const policy = GhostPolicyEngine.evaluate(decision, input, autoCtx);
    expect(policy.decision).toBe("ALLOW");
    expect(policy.canDispatchImmediately).toBe(false);
    expect(policy.requiresHumanApproval).toBe(false);
  });

  it("should always gate leads for human qualification even in AUTO mode", () => {
    const decision: GhostDecision = {
      action: "flag_lead",
      confidence: 95,
      reasoning: "User asking about consulting packages",
      isLead: true,
      riskLevel: "low",
      suggestedTags: ["pricing"],
    };
    const input: GhostInput = { message: "How much do your services cost?" };

    const policy = GhostPolicyEngine.evaluate(decision, input, autoCtx);
    expect(policy.decision).toBe("REQUIRE_APPROVAL");
    expect(policy.canDispatchImmediately).toBe(false);
    expect(policy.requiresHumanApproval).toBe(true);
  });

  it("should always escalate complaints even in AUTO mode", () => {
    const decision: GhostDecision = {
      action: "escalate_complaint",
      confidence: 88,
      reasoning: "User reporting payment failure",
      isLead: false,
      riskLevel: "high",
      suggestedTags: ["complaint"],
    };
    const input: GhostInput = { message: "My payment failed and I cannot log in!" };

    const policy = GhostPolicyEngine.evaluate(decision, input, autoCtx);
    expect(policy.decision).toBe("REQUIRE_APPROVAL");
    expect(policy.requiresHumanApproval).toBe(true);
    expect(policy.canDispatchImmediately).toBe(false);
  });

  it("should permit autonomous dispatch for high-confidence routine replies in AUTO mode", () => {
    const decision: GhostDecision = {
      action: "auto_reply",
      confidence: 90,
      reasoning: "Compliment on recent post",
      reply: "Thank you so much for the support! 🙌",
      isLead: false,
      riskLevel: "low",
      suggestedTags: ["engagement"],
    };
    const input: GhostInput = { message: "Great post!" };

    const policy = GhostPolicyEngine.evaluate(decision, input, autoCtx);
    expect(policy.decision).toBe("ALLOW");
    expect(policy.canDispatchImmediately).toBe(true);
    expect(policy.requiresHumanApproval).toBe(false);
  });

  it("should hold auto-replies for human review if confidence is below 80% in AUTO mode", () => {
    const decision: GhostDecision = {
      action: "auto_reply",
      confidence: 72,
      reasoning: "Ambiguous comment",
      reply: "Thanks for reaching out!",
      isLead: false,
      riskLevel: "low",
      suggestedTags: [],
    };
    const input: GhostInput = { message: "maybe this is nice" };

    const policy = GhostPolicyEngine.evaluate(decision, input, autoCtx);
    expect(policy.decision).toBe("REQUIRE_APPROVAL");
    expect(policy.canDispatchImmediately).toBe(false);
    expect(policy.requiresHumanApproval).toBe(true);
  });

  it("should hold all auto-replies for human click in ASSIST mode", () => {
    const decision: GhostDecision = {
      action: "auto_reply",
      confidence: 95,
      reasoning: "Friendly question",
      reply: "We are open 9am-5pm EST!",
      isLead: false,
      riskLevel: "low",
      suggestedTags: [],
    };
    const input: GhostInput = { message: "What are your business hours?" };

    const policy = GhostPolicyEngine.evaluate(decision, input, assistCtx);
    expect(policy.decision).toBe("REQUIRE_APPROVAL");
    expect(policy.canDispatchImmediately).toBe(false);
    expect(policy.requiresHumanApproval).toBe(true);
  });
});
