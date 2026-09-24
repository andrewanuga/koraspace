import { describe, it, expect, vi } from "vitest";
import { PersonaSource } from "@/lib/ai/context/sources/persona";
import { ContextPriority, type ContextRequest } from "@/lib/ai/context/types";

describe("PersonaSource Adapter", () => {
  const personaSource = new PersonaSource();

  it("fails gracefully without throwing if workspaceId is missing", async () => {
    const request = {
      workspaceId: "",
      messages: [{ role: "user", content: "hello" }],
    } as ContextRequest;

    const result = await personaSource.fetch(request);
    expect(result.success).toBe(false);
    expect(result.sections).toEqual([]);
    expect(result.error).toContain("Missing workspaceId");
  });

  it("provides fallback balanced persona when supabase is not provided", async () => {
    const request: ContextRequest = {
      workspaceId: "ws-persona-1",
      messages: [{ role: "user", content: "hello" }],
    };

    const result = await personaSource.fetch(request);

    expect(result.success).toBe(true);
    expect(result.sections.length).toBe(1);

    const section = result.sections[0];
    expect(section.id).toBe("persona-ws-persona-1");
    expect(section.isMandatory).toBe(false);
    expect(section.priority).toBe(ContextPriority.MEDIUM_HIGH);
    expect(section.content).toContain("**Formality:** balanced");
  });

  it("correctly loads empirical persona traits from Supabase", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                tone_summary: "casual, short, punchy sentences, frequent emoji use",
                style_traits: {
                  formality: "casual",
                  emoji: "frequent",
                  sentence_length: "short, punchy",
                  avg_words: 8,
                },
                sample_count: 42,
              },
              error: null,
            }),
          }),
        }),
      }),
    };

    const request: ContextRequest = {
      workspaceId: "ws-creator-42",
      messages: [{ role: "user", content: "draft tweet" }],
      supabase: mockSupabase as any,
    };

    const result = await personaSource.fetch(request);

    expect(result.success).toBe(true);
    expect(result.sections.length).toBe(1);

    const section = result.sections[0];
    expect(section.isMandatory).toBe(false);
    expect(section.priority).toBe(ContextPriority.MEDIUM_HIGH);
    expect(section.content).toContain("casual, short, punchy sentences, frequent emoji use");
    expect(section.content).toContain("**Formality:** casual");
    expect(section.content).toContain("**Emoji Rate:** frequent");
    expect(section.content).toContain("42 analyzed creator interactions");
  });

  it("handles Supabase query exception gracefully without crashing", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockRejectedValue(new Error("Supabase timeout")),
          }),
        }),
      }),
    };

    const request: ContextRequest = {
      workspaceId: "ws-err",
      messages: [{ role: "user", content: "test" }],
      supabase: mockSupabase as any,
    };

    const result = await personaSource.fetch(request);
    expect(result.success).toBe(false);
    expect(result.sections).toEqual([]);
    expect(result.error).toContain("Supabase timeout");
  });
});
