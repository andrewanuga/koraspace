import { describe, it, expect } from "vitest";
import { GhostAgent } from "@/lib/ai/agents/ghost/agent";
import type { AgentContext } from "@/lib/ai/core/types";

describe("GhostAgent (Social Triage & Autonomy Policy Integration)", () => {
  const assistCtx: AgentContext = {
    userId: "test-ghost-user",
    workspaceId: "test-ghost-ws",
    autonomyMode: "assist",
  };

  const autoCtx: AgentContext = {
    userId: "test-ghost-user",
    workspaceId: "test-ghost-ws",
    autonomyMode: "auto",
  };

  it("should classify lead inquiry and mandate human review", async () => {
    const result = await GhostAgent.evaluate(
      {
        message: "What is your pricing for the pro plan?",
        platform: "x",
      },
      autoCtx
    );

    expect(result.success).toBe(true);
    expect(result.data?.action).toBe("flag_lead");
    expect(result.data?.isLead).toBe(true);
    expect(result.data?.policy.requiresHumanApproval).toBe(true);
    expect(result.data?.policy.canDispatchImmediately).toBe(false);
  });

  it("should classify complaint and require escalation", async () => {
    const result = await GhostAgent.evaluate(
      {
        message: "My scheduled post failed and the dashboard is broken!",
        platform: "instagram",
      },
      autoCtx
    );

    expect(result.success).toBe(true);
    expect(result.data?.action).toBe("escalate_complaint");
    expect(result.data?.policy.requiresHumanApproval).toBe(true);
  });

  it("should draft auto-reply in ASSIST mode requiring human click", async () => {
    const result = await GhostAgent.evaluate(
      {
        message: "Love this new feature, amazing work!",
        platform: "telegram",
      },
      assistCtx
    );

    expect(result.success).toBe(true);
    expect(result.data?.action).toBe("auto_reply");
    expect(result.data?.reply).toBeDefined();
    expect(result.data?.policy.requiresHumanApproval).toBe(true);
    expect(result.data?.policy.canDispatchImmediately).toBe(false);
  });
});
