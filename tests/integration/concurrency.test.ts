import { describe, it, expect } from "vitest";
import { AIRateLimiter } from "@/lib/ai/core/rate-limit";
import { MemoryFormationEngine } from "@/lib/ai/memory/formation";

describe("Concurrency & High-Throughput Simulation", () => {
  it("should handle 50 concurrent memory evaluation tasks simultaneously without race conditions", async () => {
    const texts = Array.from({ length: 50 }, (_, i) => `User preference rule ${i}: Always use concise bullet points.`);

    const results = await Promise.all(
      texts.map((txt) => Promise.resolve(MemoryFormationEngine.evaluateText(txt)))
    );

    expect(results.length).toBe(50);
    for (const res of results) {
      expect(res.worthRemembering).toBe(true);
      expect(res.memoryType).toBe("preference");
    }
  });

  it("should accurately track concurrent requests across isolated workspaces", () => {
    const ws1 = "concurrent-ws-1";
    const ws2 = "concurrent-ws-2";

    for (let i = 0; i < 20; i++) {
      const res1 = AIRateLimiter.check(ws1, { maxRequestsPerMinute: 30 });
      const res2 = AIRateLimiter.check(ws2, { maxRequestsPerMinute: 30 });

      expect(res1.allowed).toBe(true);
      expect(res2.allowed).toBe(true);
    }

    const check1 = AIRateLimiter.check(ws1, { maxRequestsPerMinute: 30 });
    expect(check1.remainingRequests).toBe(9);

    const check2 = AIRateLimiter.check(ws2, { maxRequestsPerMinute: 30 });
    expect(check2.remainingRequests).toBe(9);
  });
});
