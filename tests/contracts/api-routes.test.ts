import { describe, it, expect } from "vitest";
import { APIResponse } from "@/lib/ai/core/api-response";
import { LLMError, SecurityError, RateLimitError, MemoryError, ToolError } from "@/lib/ai/core/errors";

describe("API Contract & Error Normalization", () => {
  it("should format standard success responses with trace_id and timestamp", async () => {
    const data = { message: "Hello AI", tokens: 120 };
    const response = APIResponse.success(data, "trc_test_123");
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual(data);
    expect(json.traceId).toBe("trc_test_123");
    expect(json.timestamp).toBeGreaterThan(0);
  });

  it("should convert SecurityError to 403 response without leaking internal details", async () => {
    const error = new SecurityError("Malicious system prompt extraction attempted", {
      code: "PROMPT_INJECTION_DETECTED",
      traceId: "trc_sec_001",
    });

    const response = APIResponse.error(error);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.code).toBe("PROMPT_INJECTION_DETECTED");
    expect(json.retryable).toBe(false);
    expect(json.traceId).toBe("trc_sec_001");
    expect(json.error).toContain("blocked by AI security guardrails");
  });

  it("should convert RateLimitError to 429 response", async () => {
    const error = new RateLimitError("Rate limit of 60 requests/minute exceeded.", {
      traceId: "trc_rate_001",
    });

    const response = APIResponse.error(error);
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(json.retryable).toBe(true);
    expect(json.traceId).toBe("trc_rate_001");
  });

  it("should convert LLMError to safe 502 message for client", async () => {
    const error = new LLMError("OpenRouter 503 Provider Unavailable", {
      code: "LLM_PROVIDER_ERROR",
      statusCode: 502,
      traceId: "trc_llm_001",
    });

    const response = APIResponse.error(error);
    const json = await response.json();

    expect(response.status).toBe(502);
    expect(json.code).toBe("LLM_PROVIDER_ERROR");
    expect(json.retryable).toBe(true);
    expect(json.error).toContain("temporarily unavailable");
    expect(json.error).not.toContain("OpenRouter"); // Leaking provider names avoided
  });
});
