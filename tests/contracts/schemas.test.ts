import { describe, it, expect } from "vitest";
import { GhostDecisionSchema, GhostActionTypeSchema } from "@/lib/ai/agents/ghost/types";
import { StyleTraitsSchema, MemoryTypeSchema } from "@/lib/ai/memory/types";
import { ToolInvocationSchema, ToolObservationSchema } from "@/lib/ai/agents/chat/types";

describe("Runtime Schema & Contract Validation (Zod)", () => {
  it("should validate valid GhostDecision payload", () => {
    const valid = {
      action: "auto_reply",
      confidence: 90,
      reasoning: "Valid compliment",
      reply: "Thank you!",
      isLead: false,
      riskLevel: "low",
      suggestedTags: ["support"],
    };

    const parsed = GhostDecisionSchema.parse(valid);
    expect(parsed.action).toBe("auto_reply");
    expect(parsed.confidence).toBe(90);
  });

  it("should reject invalid GhostActionType", () => {
    expect(() => GhostActionTypeSchema.parse("invalid_action_type")).toThrow();
  });

  it("should validate StyleTraits with default fallbacks", () => {
    const parsed = StyleTraitsSchema.parse({});
    expect(parsed.formality).toBe("balanced");
    expect(parsed.emojiUse).toBe("occasional");
  });

  it("should validate MemoryType enum constraints", () => {
    expect(MemoryTypeSchema.parse("brand_rule")).toBe("brand_rule");
    expect(MemoryTypeSchema.parse("preference")).toBe("preference");
    expect(MemoryTypeSchema.parse("fact")).toBe("fact");
    expect(MemoryTypeSchema.parse("decision")).toBe("decision");
    expect(() => MemoryTypeSchema.parse("unsupported_type")).toThrow();
  });

  it("should validate ToolInvocation and ToolObservation schemas", () => {
    const invocation = ToolInvocationSchema.parse({
      toolName: "scrape_url",
      args: { url: "https://example.com" },
    });
    expect(invocation.toolName).toBe("scrape_url");

    const observation = ToolObservationSchema.parse({
      toolName: "scrape_url",
      success: true,
      output: { text: "scraped content" },
      latencyMs: 120,
    });
    expect(observation.success).toBe(true);
    expect(observation.latencyMs).toBe(120);
  });
});
