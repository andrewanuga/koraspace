import { describe, it, expect, beforeEach } from "vitest";
import { AIRateLimiter } from "@/lib/ai/core/rate-limit";
import { RateLimitError } from "@/lib/ai/core/errors";

describe("AIRateLimiter & Budget Controls", () => {
  beforeEach(() => {
    AIRateLimiter.reset();
  });

  it("should permit requests within rate limit quota", () => {
    const res = AIRateLimiter.check("ws-rate-1", { maxRequestsPerMinute: 10 });
    expect(res.allowed).toBe(true);
    expect(res.remainingRequests).toBe(9);
    expect(res.budgetStatus).toBe("normal");
  });

  it("should block requests when rate limit per minute is exceeded", () => {
    const wsId = "ws-rate-burst";
    const maxReq = 3;

    for (let i = 0; i < maxReq; i++) {
      const res = AIRateLimiter.check(wsId, { maxRequestsPerMinute: maxReq });
      expect(res.allowed).toBe(true);
    }

    const blockedRes = AIRateLimiter.check(wsId, { maxRequestsPerMinute: maxReq });
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.reason).toContain("Rate limit");
  });

  it("should block requests and throw RateLimitError when monthly budget is exhausted", () => {
    const wsId = "ws-budget-exhausted";

    expect(() => {
      AIRateLimiter.enforce(wsId, {
        monthlyBudgetUsd: 50.0,
        currentSpendUsd: 50.5,
      });
    }).toThrow(RateLimitError);

    const check = AIRateLimiter.check(wsId, {
      monthlyBudgetUsd: 50.0,
      currentSpendUsd: 50.5,
    });

    expect(check.allowed).toBe(false);
    expect(check.budgetStatus).toBe("blocked");
  });

  it("should flag warning when monthly budget spend is between 70% and 90%", () => {
    const check = AIRateLimiter.check("ws-budget-warning", {
      monthlyBudgetUsd: 100.0,
      currentSpendUsd: 75.0,
    });

    expect(check.allowed).toBe(true);
    expect(check.budgetStatus).toBe("warning");
  });
});
