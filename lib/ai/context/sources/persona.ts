/**
 * Context Engine v2.0 - Creator Persona Source Adapter
 *
 * Thin adapter connecting Context Engine to the existing Persona memory layer:
 * - Loads empirical writing style traits from ai_persona
 * - Emits non-mandatory MEDIUM_HIGH priority sections for voice pacing & tone
 * - Injects formality, sentence length, and emoji frequency
 * - Fails gracefully with balanced fallback defaults when persona data is absent
 */

import { estimateTokens } from "../budget";
import {
  ContextPriority,
  type ContextRequest,
  type ContextSection,
  type ContextSource,
  type SourceResult,
} from "../types";
import type { StyleTraits } from "../../memory/types";

export class PersonaSource implements ContextSource {
  public readonly name = "persona";
  public readonly priority = ContextPriority.MEDIUM_HIGH;

  /**
   * Fetches creator persona traits and converts them into structured context sections.
   */
  public async fetch(
    request: ContextRequest,
    _allocatedBudget?: number
  ): Promise<SourceResult> {
    const startTime = Date.now();
    const { workspaceId, supabase } = request;

    if (!workspaceId) {
      return {
        source: this.name,
        sections: [],
        latencyMs: Date.now() - startTime,
        success: false,
        error: "Missing workspaceId in ContextRequest",
      };
    }

    try {
      let toneSummary = "balanced, medium sentences, occasional emoji use";
      let traits: Partial<StyleTraits> = {
        formality: "balanced",
        emojiUse: "occasional",
        sentenceLength: "medium",
        avgWordsPerSentence: 14,
      };
      let sampleCount = 0;

      if (supabase) {
        const { data, error } = await supabase
          .from("ai_persona")
          .select("tone_summary, style_traits, sample_count, updated_at")
          .eq("user_id", workspaceId)
          .maybeSingle();

        if (!error && data) {
          if (data.tone_summary) {
            toneSummary = data.tone_summary;
          }
          if (data.sample_count) {
            sampleCount = data.sample_count;
          }
          if (data.style_traits && typeof data.style_traits === "object") {
            const st = data.style_traits as Record<string, any>;
            traits = {
              formality: st.formality || "balanced",
              emojiUse: st.emojiUse || st.emoji || "occasional",
              sentenceLength: st.sentenceLength || st.sentence_length || "medium",
              avgWordsPerSentence: Number(st.avgWordsPerSentence || st.avg_words || 14),
            };
          }
        }
      }

      // Format high-signal persona section
      const lines: string[] = [
        "### CREATOR PERSONA & WRITING PACE",
        `- **Tone Summary:** ${toneSummary}`,
        `- **Formality:** ${traits.formality}`,
        `- **Sentence Structure:** ${traits.sentenceLength} (avg ~${traits.avgWordsPerSentence} words/sentence)`,
        `- **Emoji Rate:** ${traits.emojiUse}`,
      ];

      if (sampleCount > 0) {
        lines.push(`- **Calibrated Sample Base:** ${sampleCount} analyzed creator interactions`);
      }

      const content = lines.join("\n");
      const section: ContextSection = {
        id: `persona-${workspaceId}`,
        source: this.name,
        title: "Creator Persona & Style Traits",
        content,
        priority: ContextPriority.MEDIUM_HIGH,
        relevanceScore: 0.80,
        importanceScore: 3,
        estimatedTokens: estimateTokens(content),
        isMandatory: false, // Persona should influence tone but never outrank safety or user instructions
        target: "system_prompt",
        metadata: {
          sampleCount,
          formality: traits.formality,
        },
      };

      return {
        source: this.name,
        sections: [section],
        latencyMs: Date.now() - startTime,
        success: true,
        rawData: {
          personaSummary: toneSummary,
        },
      };
    } catch (err: any) {
      console.warn("[PersonaSource] Non-fatal error loading persona traits:", err);
      return {
        source: this.name,
        sections: [],
        latencyMs: Date.now() - startTime,
        success: false,
        error: err?.message || "Failed to load persona traits",
      };
    }
  }
}
