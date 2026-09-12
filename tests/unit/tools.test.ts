import { describe, it, expect } from "vitest";
import { defaultToolRegistry } from "@/lib/ai/tools/index";
import type { AgentContext } from "@/lib/ai/core/types";

describe("ToolRegistry & Intelligence Tools", () => {
  const context: AgentContext = {
    userId: "test-user",
    workspaceId: "test-workspace",
    autonomyMode: "assist",
  };

  it("should have all 8 typed tools registered", () => {
    const list = defaultToolRegistry.list();
    const names = list.map((t) => t.name);

    expect(names).toContain("generate_hashtags");
    expect(names).toContain("get_current_time");
    expect(names).toContain("get_weather");
    expect(names).toContain("scrape_url");
    expect(names).toContain("evaluate_virality");
    expect(names).toContain("analyze_competitor");
    expect(names).toContain("repurpose_longform");
    expect(names).toContain("verify_claim");
    expect(list.length).toBeGreaterThanOrEqual(8);
  });

  it("should execute get_current_time tool cleanly", async () => {
    const result = await defaultToolRegistry.execute(
      "get_current_time",
      { timeZone: "UTC" },
      context
    );

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty("formatted");
    expect(result.data).toHaveProperty("iso");
    expect(result.metadata?.toolCallsExecuted).toContain("get_current_time");
  });

  it("should execute evaluate_virality tool and return breakdown scores", async () => {
    const result = await defaultToolRegistry.execute(
      "evaluate_virality",
      {
        content: "Here is why 90% of SaaS startups fail to retain users in year 1:",
        platform: "x",
      },
      context
    );

    expect(result.success).toBe(true);
    expect((result.data as any).score).toBeGreaterThanOrEqual(0);
    expect((result.data as any).dimensions).toBeDefined();
  });

  it("should return structured error for non-existent tool", async () => {
    const result = await defaultToolRegistry.execute(
      "non_existent_tool_xyz",
      {},
      context
    );

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("TOOL_NOT_FOUND");
  });
});
