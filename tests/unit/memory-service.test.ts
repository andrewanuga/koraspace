import { describe, it, expect } from "vitest";
import {
  StoreMemoryInputSchema,
  UpdateMemoryInputSchema,
  ListMemoriesOptionsSchema,
  MemoryService,
} from "@/lib/ai/memory/service";

describe("MemoryService & Zod Contracts", () => {
  it("should validate valid store memory payload", () => {
    const input = {
      content: "Primary customer base is Nigerian tech startups and founders.",
      memoryType: "fact" as const,
      importance: 5 as const,
      source: "manual" as const,
    };

    const parsed = StoreMemoryInputSchema.parse(input);
    expect(parsed.content).toBe(input.content);
    expect(parsed.memoryType).toBe("fact");
    expect(parsed.importance).toBe(5);
  });

  it("should reject too short memory content", () => {
    expect(() => StoreMemoryInputSchema.parse({ content: "ab" })).toThrow();
  });

  it("should validate update memory payload", () => {
    const update = {
      content: "Updated audience description for enterprise customers.",
      importance: 4 as const,
    };

    const parsed = UpdateMemoryInputSchema.parse(update);
    expect(parsed.importance).toBe(4);
    expect(parsed.content).toBe(update.content);
  });

  it("should parse list options with defaults", () => {
    const opts = ListMemoriesOptionsSchema.parse({});
    expect(opts.limit).toBe(20);
    expect(opts.offset).toBe(0);
  });

  it("should enforce importance bounds between 1 and 5", () => {
    expect(() =>
      StoreMemoryInputSchema.parse({ content: "Valid text", importance: 6 as any })
    ).toThrow();
    expect(() =>
      StoreMemoryInputSchema.parse({ content: "Valid text", importance: 0 as any })
    ).toThrow();
  });
});
