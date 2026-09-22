import { describe, it, expect } from "vitest";
import { ServiceEnvelopeBuilder } from "@/lib/ai/core/service-envelope";
import {
  V1ChatRequestSchema,
  V1GhostEvaluateRequestSchema,
  V1ContentGenerateRequestSchema,
} from "@/lib/ai/contracts/v1";

describe("Platform ↔ AI Service Envelope & Contracts", () => {
  const workspaceId = "ws_contract_verification_102";

  it("should wrap successful AI response in a standard v1 ServiceEnvelope", async () => {
    const rawData = {
      reply: "Here is your optimized LinkedIn strategy.",
      toolCallsExecuted: ["analyze_competitor"],
      costUsd: 0.002,
    };

    const startTime = Date.now() - 350;
    const response = ServiceEnvelopeBuilder.success(rawData, {
      workspaceId,
      correlationId: "cor_test_123",
      startTime,
    });

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.reply).toBe("Here is your optimized LinkedIn strategy.");
    expect(body.meta.version).toBe("v1");
    expect(body.meta.workspaceId).toBe(workspaceId);
    expect(body.meta.correlationId).toBe("cor_test_123");
    expect(body.meta.durationMs).toBeGreaterThanOrEqual(300);
  });

  it("should wrap errors into a sanitized v1 ServiceEnvelope without leaking stack traces", async () => {
    const internalErr = new Error("Database query timed out during vector similarity calculation");
    const response = ServiceEnvelopeBuilder.error(internalErr, {
      workspaceId,
      correlationId: "cor_err_456",
    });

    expect(response.status).toBe(500);
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INTERNAL_AI_ERROR");
    expect(body.error.message).not.toContain("vector similarity");
    expect(body.error.message).toContain("Internal AI service error");
    expect(body.meta.correlationId).toBe("cor_err_456");
  });

  it("should validate strict typed input contracts for v1 endpoints", () => {
    // Valid chat payload
    const validChat = V1ChatRequestSchema.safeParse({
      message: "Draft post",
      workspaceId: "ws_123",
    });
    expect(validChat.success).toBe(true);

    // Invalid chat payload (missing workspaceId)
    const invalidChat = V1ChatRequestSchema.safeParse({
      message: "Draft post",
    });
    expect(invalidChat.success).toBe(false);

    // Valid ghost payload
    const validGhost = V1GhostEvaluateRequestSchema.safeParse({
      message: "Great product!",
      senderName: "User",
      platform: "x",
      workspaceId: "ws_123",
    });
    expect(validGhost.success).toBe(true);
  });
});
