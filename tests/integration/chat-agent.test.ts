import { describe, it, expect } from "vitest";
import { ChatAgent } from "@/lib/ai/agents/chat/agent";
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

  it("should execute registered tool directly via executeTool helper", async () => {
    const res = await ChatAgent.executeTool(
      "generate_hashtags",
      { topic: "Next.js AI", platform: "x", count: 5 },
      context
    );

    expect(res.success).toBe(true);
    expect((res.data as any).hashtags.length).toBeGreaterThanOrEqual(1);
  });
});
