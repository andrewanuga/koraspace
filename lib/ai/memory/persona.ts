/**
 * Persona & Memory Learning Engine
 *
 * Upgraded tone and writing style learner:
 * - Analyzes conversational traits (formality, sentence pacing, emoji usage)
 * - Persists structured insights into ai_persona and ai_message_memory
 * - Categorizes memories with importance weighting
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { MemoryImportance, MemoryType, StyleTraits } from "./types";

const EMOJI_REGEX = /\p{Extended_Pictographic}/gu;

export class PersonaLearningEngine {
  /**
   * Analyzes an array of sample texts to derive empirical writing style traits.
   */
  public static analyzeStyle(texts: string[]): { traits: StyleTraits; summary: string } {
    const joined = texts.join(" ");
    const words = joined.split(/\s+/).filter(Boolean);
    const sentences = joined.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const emojiCount = (joined.match(EMOJI_REGEX) || []).length;
    const exclaims = (joined.match(/!/g) || []).length;
    const lowerI = (joined.match(/\bi\b/g) || []).length;
    const casualMarkers = (joined.match(/\b(lol|haha|omg|tbh|ngl|fr|vibe|yeah|gonna|wanna)\b/gi) || []).length;

    const avgWords = sentences.length ? Math.round(words.length / sentences.length) : words.length;
    const emojiRate = words.length ? emojiCount / words.length : 0;

    const formality: StyleTraits["formality"] =
      casualMarkers + lowerI + (emojiRate > 0.03 ? 2 : 0) > 3
        ? "casual"
        : avgWords > 18
        ? "formal"
        : "balanced";

    const emojiUse: StyleTraits["emojiUse"] =
      emojiRate > 0.05
        ? "frequent"
        : emojiRate > 0.01
        ? "occasional"
        : emojiRate > 0
        ? "rare"
        : "none";

    const sentenceLength: StyleTraits["sentenceLength"] =
      avgWords > 20
        ? "long"
        : avgWords < 9
        ? "short, punchy"
        : "medium";

    const traits: StyleTraits = {
      formality,
      emojiUse,
      sentenceLength,
      exclaimRate: exclaims,
      avgWordsPerSentence: avgWords,
    };

    const summary = `${formality}, ${sentenceLength} sentences, ${emojiUse} emoji use${
      exclaims > texts.length ? ", high energy" : ""
    }`;

    return { traits, summary };
  }

  /**
   * Records a user interaction, updates ai_message_memory, and refreshes the persona.
   */
  public static async recordInteraction(
    supabase: SupabaseClient,
    workspaceId: string,
    text: string,
    options: {
      source?: "chat" | "inbox" | "dm" | "system" | "document";
      platform?: string | null;
      role?: "user" | "contact" | "assistant";
      memoryType?: MemoryType;
      importance?: MemoryImportance;
    } = {}
  ): Promise<void> {
    if (!text?.trim()) return;

    const {
      source = "chat",
      platform = null,
      role = "user",
    } = options;

    try {
      // 1. Insert into ai_message_memory
      await supabase.from("ai_message_memory").insert({
        user_id: workspaceId,
        source,
        platform,
        role,
        content: text.slice(0, 4000),
      });

      // 2. Refresh persona tone if user message
      if (role === "user") {
        const { data: recent } = await supabase
          .from("ai_message_memory")
          .select("content")
          .eq("user_id", workspaceId)
          .eq("role", "user")
          .order("created_at", { ascending: false })
          .limit(40);

        const texts = (recent ?? []).map((r: { content: string }) => r.content);
        if (texts.length >= 3) {
          const { traits, summary } = this.analyzeStyle(texts);
          await supabase.from("ai_persona").upsert({
            user_id: workspaceId,
            tone_summary: summary,
            style_traits: traits,
            sample_count: texts.length,
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.warn("[PersonaLearningEngine] Non-fatal error recording interaction:", err);
    }
  }
}
