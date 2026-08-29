import { describe, it, expect } from "vitest";
import { MemoryFormationEngine } from "@/lib/ai/memory/formation";
import { PersonaLearningEngine } from "@/lib/ai/memory/persona";
import { EmbeddingService } from "@/lib/ai/memory/embeddings";

describe("Memory Formation & Persona Learning", () => {
  it("should extract brand rules and forbidden terms with high importance (5)", () => {
    const result = MemoryFormationEngine.evaluateText(
      "Don't use the phrase 'cheap software' in our posts."
    );

    expect(result.worthRemembering).toBe(true);
    expect(result.memoryType).toBe("brand_rule");
    expect(result.importance).toBe(5);
    expect(result.extractedTerms?.forbidden).toContain("cheap software");
  });

  it("should extract target audience facts with high importance (5)", () => {
    const result = MemoryFormationEngine.evaluateText(
      "Our target audience consists of African technology startups and developers."
    );

    expect(result.worthRemembering).toBe(true);
    expect(result.memoryType).toBe("fact");
    expect(result.importance).toBe(5);
    expect(result.extractedTerms?.audience).toContain("African technology startups");
  });

  it("should extract user tone preferences with importance 4", () => {
    const result = MemoryFormationEngine.evaluateText(
      "From now on, I prefer bullet points and concise summaries."
    );

    expect(result.worthRemembering).toBe(true);
    expect(result.memoryType).toBe("preference");
    expect(result.importance).toBe(4);
  });

  it("should discard trivial conversation chatter (ok, thanks, emojis)", () => {
    const res1 = MemoryFormationEngine.evaluateText("ok thanks");
    const res2 = MemoryFormationEngine.evaluateText("🔥🙌❤️");

    expect(res1.worthRemembering).toBe(false);
    expect(res2.worthRemembering).toBe(false);
    expect(res1.importance).toBe(1);
  });

  it("should compute accurate lexical similarity for query matching", () => {
    const sim = EmbeddingService.lexicalSimilarity(
      "fintech startup funding",
      "How fintech startups raise seed funding in 2026"
    );
    const zeroSim = EmbeddingService.lexicalSimilarity(
      "fintech startup funding",
      "best chocolate cake recipes"
    );

    expect(sim).toBeGreaterThan(0.6);
    expect(zeroSim).toBe(0);
  });

  it("should extract casual tone traits from emoji-heavy conversational samples", () => {
    const samples = [
      "Hey guys! Loved this new update lol 🎉",
      "Omg haha that is crazy fr 🔥",
      "Let's gooo! Drop a like below 👍",
    ];

    const { traits, summary } = PersonaLearningEngine.analyzeStyle(samples);
    expect(traits.formality).toBe("casual");
    expect(traits.emojiUse).toBe("frequent");
    expect(summary).toContain("casual");
  });
});
