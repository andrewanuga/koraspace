import { describe, it, expect } from "vitest";
import { GhostAgent } from "@/lib/ai/agents/ghost/agent";
import { GhostPolicyEngine } from "@/lib/ai/agents/ghost/policy";
import type { AgentContext } from "@/lib/ai/core/types";

describe("E2E GhostAgent Workflow", () => {
  const autoCtx: AgentContext = {
    userId: "e2e-ghost-ws",
    workspaceId: "e2e-ghost-ws",
    autonomyMode: "auto",
  };

  it("should process inbound comment, triage intent, evaluate deterministic policy, and guard safety", async () => {
    // Flow 1: Lead inquiry in AUTO mode
    const leadEvaluation = await GhostAgent.evaluate(
      {
        message: "Hi! How can I hire Koraspace for my company's social automation?",
        senderName: "Prospective Founder",
        platform: "x",
      },
      autoCtx
    );

    expect(leadEvaluation.success).toBe(true);
    expect(leadEvaluation.data?.action).toBe("flag_lead");
    expect(leadEvaluation.data?.isLead).toBe(true);
    expect(leadEvaluation.data?.policy.decision).toBe("REQUIRE_APPROVAL");
    expect(leadEvaluation.data?.dispatched).toBe(false);

    // Flow 2: General compliment in AUTO mode
    const complimentEvaluation = await GhostAgent.evaluate(
      {
        message: "Amazing post as always! Keep it up 🙌",
        senderName: "Community Member",
        platform: "instagram",
      },
      autoCtx
    );

    expect(complimentEvaluation.success).toBe(true);
    expect(complimentEvaluation.data?.action).toBe("auto_reply");
    expect(complimentEvaluation.data?.reply).toBeDefined();
    expect(complimentEvaluation.data?.policy.canDispatchImmediately).toBe(true);
  });
});
