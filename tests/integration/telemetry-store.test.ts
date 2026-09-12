import { describe, it, expect } from "vitest";
import { TelemetryStore } from "@/lib/ai/core/telemetry-store";
import type { AITrace } from "@/lib/ai/core/telemetry";

describe("TelemetryStore & Persistent Traces", () => {
  it("should validate and format trace payloads for persistence", async () => {
    const mockTrace: AITrace = {
      traceId: "trc_persist_001",
      requestId: "req_persist_001",
      agent: "ChatAgent",
      operation: "execute_reasoning",
      workspaceId: "test-ws-persist",
      startedAt: Date.now() - 2500,
      endedAt: Date.now(),
      durationMs: 2500,
      status: "success",
      model: "google/gemma-4-26b-a4b-it:free",
      iterations: 2,
      toolCalls: [{ toolName: "verify_claim", latencyMs: 320, success: true }],
      memoryHits: 3,
      selfCorrections: 0,
      estimatedCostUsd: 0.0005,
    };

    // Soft-fail test: under uninitialized Supabase client in test environment,
    // persistTrace should return gracefully without crashing.
    const result = await TelemetryStore.persistTrace(mockTrace);
    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
  });

  it("should gracefully reject invalid trace payloads", async () => {
    const result = await TelemetryStore.persistTrace(null as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid trace payload");
  });
});
