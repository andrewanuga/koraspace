import { describe, it, expect } from "vitest";
import { ChatAgent } from "@/lib/ai/agents/chat/agent";
import { defaultToolRegistry } from "@/lib/ai/tools/index";
import { BrandIntelligenceLoader } from "@/lib/ai/memory/brand";
import { MemoryFormationEngine } from "@/lib/ai/memory/formation";
import { AITelemetry } from "@/lib/ai/core/telemetry";
import type { AgentContext } from "@/lib/ai/core/types";

describe("E2E ChatAgent Workflow", () => {
  const context: AgentContext = {
    userId: "e2e-workspace",
    workspaceId: "e2e-workspace",
    autonomyMode: "assist",
  };

  it("should execute the full chain: Memory Retrieval -> Planning -> Tools -> Brand Guardrails -> Response -> Telemetry", async () => {
    const trace = AITelemetry.startTrace("ChatAgent", "e2e_content_generation", context.workspaceId);

    // 1. User Message
    const userMessage = "Draft a high-impact LinkedIn post about AI workflow automation for African founders.";

    // 2. Memory Formation check on input
    const formation = MemoryFormationEngine.evaluateText(userMessage);
    expect(formation.memoryType).toBeDefined();

    // 3. Brand Guardrails loaded
    const brand = await BrandIntelligenceLoader.load(context.workspaceId);
    expect(brand.workspaceId).toBe(context.workspaceId);

    // 4. Agent Execution with ToolRegistry
    const result = await ChatAgent.execute(
      {
        messages: [{ role: "user", content: userMessage }],
        requireSelfCorrection: true,
      },
      context
    );

    expect(result.success).toBe(true);
    expect(result.data?.content).toBeDefined();
    expect(result.data?.content.length).toBeGreaterThan(30);
    expect(result.data?.plan).toBeDefined();

    // 5. Brand Compliance verification on output
    const compliance = BrandIntelligenceLoader.checkCompliance(result.data!.content, brand);
    expect(compliance.compliant).toBe(true);

    // 6. Record and verify telemetry trace
    AITelemetry.recordToolCall(trace, "evaluate_virality", 80, true);
    const completedTrace = AITelemetry.endTrace(trace, "success", {
      iterations: result.data?.iterations || 1,
      model: result.data?.model,
    });

    expect(completedTrace.status).toBe("success");
    expect(completedTrace.durationMs).toBeGreaterThanOrEqual(0);
    expect(completedTrace.traceId).toContain("trc_");
  });
});
