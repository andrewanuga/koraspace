import { describe, it, expect } from "vitest";
import { withRetry, CircuitBreaker } from "@/lib/ai/core/resilience";
import { LLMError } from "@/lib/ai/core/errors";

describe("Resilience: withRetry & CircuitBreaker", () => {
  it("should successfully retry a transient failure and return result", async () => {
    let attempts = 0;

    const result = await withRetry(
      async () => {
        attempts++;
        if (attempts < 2) {
          throw new LLMError("Transient 503 Provider Unavailable", { retryable: true });
        }
        return "Success on attempt 2";
      },
      { maxRetries: 3, initialDelayMs: 10 }
    );

    expect(result).toBe("Success on attempt 2");
    expect(attempts).toBe(2);
  });

  it("should immediately throw non-retryable error without retrying", async () => {
    let attempts = 0;

    await expect(
      withRetry(
        async () => {
          attempts++;
          throw new LLMError("Invalid API key", { retryable: false });
        },
        { maxRetries: 3, initialDelayMs: 10 }
      )
    ).rejects.toThrow("Invalid API key");

    expect(attempts).toBe(1);
  });

  it("should transition CircuitBreaker from CLOSED to OPEN after consecutive failures", async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 2, cooldownMs: 50, name: "TestBreaker" });

    expect(breaker.state).toBe("CLOSED");

    // Failure 1
    await expect(breaker.execute(async () => { throw new Error("Fail 1"); })).rejects.toThrow();
    expect(breaker.state).toBe("CLOSED");

    // Failure 2 (Trips breaker)
    await expect(breaker.execute(async () => { throw new Error("Fail 2"); })).rejects.toThrow();
    expect(breaker.state).toBe("OPEN");

    // Execution while OPEN must reject immediately
    await expect(breaker.execute(async () => "Never executed")).rejects.toThrow(
      'Circuit breaker "TestBreaker" is OPEN'
    );
  });
});
