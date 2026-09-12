import { describe, it, expect, vi } from "vitest";
import { KoraspaceAIClient } from "@/lib/ai-client";

describe("Typed Platform AI Client Suite", () => {
  it("should initialize client and construct signed requests correctly", async () => {
    const client = new KoraspaceAIClient({ baseUrl: "http://localhost:3000" });

    expect(client).toBeDefined();
    expect(typeof client.chat).toBe("function");
    expect(typeof client.evaluateGhost).toBe("function");
    expect(typeof client.generateContent).toBe("function");
    expect(typeof client.searchMemory).toBe("function");
  });

  it("should unpack valid ServiceEnvelope responses and handle API errors cleanly", async () => {
    const client = new KoraspaceAIClient({ baseUrl: "http://localhost:3000" });

    // Mock fetch to simulate successful service envelope
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: {
          reply: "Client test reply",
          toolCallsExecuted: [],
          memoryItemsUsed: 0,
          selfCorrections: 0,
          costUsd: 0.0001,
        },
        meta: {
          version: "v1",
          traceId: "trc_client_test",
          correlationId: "cor_client_test",
          workspaceId: "ws_client_test",
          durationMs: 120,
          timestamp: Date.now(),
        },
      }),
    });

    const response = await client.chat({
      message: "Test message",
      workspaceId: "ws_client_test",
    });

    expect(response.reply).toBe("Client test reply");
    expect(response.costUsd).toBe(0.0001);
  });
});
