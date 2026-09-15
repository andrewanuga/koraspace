import { describe, it, expect } from "vitest";
import { ChatAgent } from "@/lib/ai/agents/chat/agent";
import { ChatPlanner } from "@/lib/ai/agents/chat/planner";
import type { AgentContext } from "@/lib/ai/core/types";

describe("ChatAgent (ReAct Reasoning & Memory Integration)", () => {
  const context: AgentContext = {
    userId: "test-user-int",
    workspaceId: "test-workspace-int",
    autonomyMode: "assist",
  };

  it("should execute conversation request and return structured plan and content", async () => {
    const result = await ChatAgent.execute(
      {
        messages: [{ role: "user", content: "How do I optimize my LinkedIn profile for inbound leads?" }],
      },
      context
    );

    expect(result.success).toBe(true);
    expect(result.data?.content).toBeDefined();
    expect(result.data?.content.length).toBeGreaterThan(20);
    expect(result.data?.plan).toBeDefined();
    expect(result.metadata?.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("should execute registered tool via executeTool helper when declared in validated plan", async () => {
    const plan = ChatPlanner.plan([
      { role: "user", content: "What time is it in London right now?" },
    ]);

    const contextWithCaps: AgentContext = {
      ...context,
      capabilities: ["content:generate"],
    };

    const res = await ChatAgent.executeTool(
      "get_current_time",
      { timeZone: "UTC" },
      contextWithCaps,
      plan
    );

    expect(res.success).toBe(true);
    const data = res.data as Record<string, unknown>;
    expect(data.formatted).toBeDefined();
  });

  it("should deny tool execution with PLAN_DEVIATION when registered tool is absent from plan", async () => {
    // Generate real validated plan whose intent requires get_current_time
    const plan = ChatPlanner.plan([
      { role: "user", content: "What time is it in London right now?" },
    ]);

    expect(plan.requiredTools).toContain("get_current_time");
    expect(plan.requiredTools).not.toContain("generate_hashtags");

    const contextWithCaps: AgentContext = {
      ...context,
      capabilities: ["content:generate"],
    };

    // "generate_hashtags" is a registered tool, but absent from plan.requiredTools
    const res = await ChatAgent.executeTool(
      "generate_hashtags",
      { topic: "Next.js AI", platform: "x", count: 5 },
      contextWithCaps,
      plan
    );

    expect(res.success).toBe(false);
    expect(res.error?.message).toContain("PLAN_DEVIATION");
    expect(res.error?.message).not.toContain("UNKNOWN_TOOL");
  });
});
