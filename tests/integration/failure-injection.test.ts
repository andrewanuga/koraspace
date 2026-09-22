import { describe, it, expect } from "vitest";
import { withRetry, CircuitBreaker } from "@/lib/ai/core/resilience";
import { LLMError, ToolError, MemoryError } from "@/lib/ai/core/errors";
import { APIResponse } from "@/lib/ai/core/api-response";

describe("Failure Injection & Outage Resilience", () => {
  it("should handle simulated provider timeout with retry recovery", async () => {
    let callCount = 0;

    const resilientCall = async () => {
      callCount++;
      if (callCount < 3) {
        throw new LLMError("Gateway Timeout (504)", { code: "LLM_TIMEOUT", retryable: true });
      }
      return { text: "Recovered successfully on attempt 3" };
    };

    const result = await withRetry(resilientCall, { maxRetries: 3, initialDelayMs: 10 });
    expect(result.text).toBe("Recovered successfully on attempt 3");
    expect(callCount).toBe(3);
  });

  it("should trip circuit breaker and prevent hammering downstream during major outage", async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 3, cooldownMs: 100, name: "LLMProvider" });

    // Simulate 3 consecutive provider crashes
    for (let i = 0; i < 3; i++) {
      await expect(
        breaker.execute(async () => {
          throw new LLMError("500 Internal Server Error from AI Model", { retryable: true });
        })
      ).rejects.toThrow();
    }

    expect(breaker.state).toBe("OPEN");

    // 4th call must be fast-failed by Circuit Breaker
    const tripCall = breaker.execute(async () => "Not reached");
    await expect(tripCall).rejects.toThrow('Circuit breaker "LLMProvider" is OPEN');
  });

  it("should convert a simulated tool crash into safe client response without leaking stack trace", async () => {
    const toolError = new ToolError("Failed to scrape URL https://unreachable-site.com", "scrape_url", {
      code: "TOOL_EXECUTION_FAILED",
      statusCode: 500,
    });

    const response = APIResponse.error(toolError, "trc_fail_001");
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.code).toBe("TOOL_EXECUTION_FAILED");
    expect(json.error).toBe('Execution of tool "scrape_url" failed.');
    expect(json.traceId).toBe("trc_fail_001");
  });
});
