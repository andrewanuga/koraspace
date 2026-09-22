import { describe, it, expect } from "vitest";
import { AITelemetry } from "@/lib/ai/core/telemetry";

describe("AITelemetry & Secret Sanitization", () => {
  it("should create, record, and conclude an execution trace", () => {
    const trace = AITelemetry.startTrace("ChatAgent", "generate_reply", "ws-123");

    expect(trace.traceId).toContain("trc_");
    expect(trace.requestId).toContain("req_");
    expect(trace.status).toBe("running");

    AITelemetry.recordToolCall(trace, "get_weather", 150, true);
    expect(trace.toolCalls.length).toBe(1);
    expect(trace.toolCalls[0].toolName).toBe("get_weather");

    const ended = AITelemetry.endTrace(trace, "success", {
      model: "test-model",
      iterations: 2,
      memoryHits: 3,
    });

    expect(ended.status).toBe("success");
    expect(ended.durationMs).toBeGreaterThanOrEqual(0);
    expect(ended.memoryHits).toBe(3);
    expect(ended.iterations).toBe(2);
  });

  it("should sanitize OpenRouter and OpenAI API keys from strings and objects", () => {
    const rawString = "Error connecting with key sk-or-v1-abcdef1234567890qwertyuiop";
    const sanitized = AITelemetry.sanitize(rawString);

    expect(sanitized).not.toContain("sk-or-v1-abcdef1234567890qwertyuiop");
    expect(sanitized).toContain("[REDACTED_API_KEY]");
  });

  it("should sanitize Bearer tokens and passwords in structured logs", () => {
    const payload = {
      header: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abcdef123456",
      token: "secret_access_token_12345",
      safeInfo: "Public information",
    };

    const sanitized = AITelemetry.sanitize(payload);
    expect(sanitized.header).toContain("Bearer [REDACTED_TOKEN]");
    expect(sanitized.token).toBe("[REDACTED]");
    expect(sanitized.safeInfo).toBe("Public information");
  });
});
