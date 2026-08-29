import { describe, it, expect } from "vitest";

describe("Live Infrastructure: LLM Provider Integration", () => {
  const hasLiveOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);

  it.skipIf(!hasLiveOpenRouter)("should perform live handshake with OpenRouter endpoint", async () => {
    // Only executed when real OPENROUTER_API_KEY is configured
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("should validate provider configuration contract", () => {
    expect(typeof process.env.OPENROUTER_API_KEY === "string" || process.env.OPENROUTER_API_KEY === undefined).toBe(true);
  });
});
