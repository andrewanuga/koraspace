/**
 * Memory Formation & Knowledge Extraction Engine
 *
 * Evaluates incoming user interactions to determine persistent value:
 * - Classifies memories into brand_rule, preference, fact, decision, or conversation
 * - Assigns importance weights (1 = trivial to 5 = critical)
 * - Automatically updates workspace brand intelligence (guardrails, audience, vocabulary)
 * - Generates embeddings and persists high-value memories to ai_message_memory
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { MemoryImportance, MemoryType } from "./types";
import { EmbeddingService } from "./embeddings";

export interface MemoryFormationResult {
  worthRemembering: boolean;
  memoryType: MemoryType;
  importance: MemoryImportance;
  summary?: string;
  extractedTerms?: {
    forbidden?: string[];
    preferred?: string[];
    audience?: string;
  };
}

export class MemoryFormationEngine {
  /**
   * Evaluates text to determine if it contains high-value persistent knowledge.
   */
  public static evaluateText(text: string): MemoryFormationResult {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. Trivial check (drop low-signal chatter)
    if (
      trimmed.length < 10 ||
      /^(ok|okay|thanks|thank you|cool|great|nice|sure|yes|no|yep|nope|alright|bye|hello|hi|hey)[.! ]*$/i.test(trimmed) ||
      /^[🔥❤️😍🙌👏✨💯👍🤝🎉\s]+$/u.test(trimmed)
    ) {
      return {
        worthRemembering: false,
        memoryType: "conversation",
        importance: 1,
      };
    }

    // 2. Brand Rule (Forbidden terms, strict guidelines)
    if (
      lower.includes("don't use") ||
      lower.includes("never say") ||
      lower.includes("never use") ||
      lower.includes("do not mention") ||
      lower.includes("avoid the word") ||
      lower.includes("avoid the phrase") ||
      lower.includes("forbidden") ||
      lower.includes("rule:")
    ) {
      const extractedForbidden: string[] = [];
      const quoteMatch = trimmed.match(/(?:^|\s)['"“]([^'"”]+)['"”]/);
      if (quoteMatch && quoteMatch[1]) {
        extractedForbidden.push(quoteMatch[1].trim());
      } else {
        const match = trimmed.match(/(?:don't use|never say|never use|do not mention|avoid)(?:\s+(?:the phrase|the word|the term))?\s+["']?([^"'.\n]+)["']?/i);
        if (match && match[1]) {
          extractedForbidden.push(match[1].trim());
        }
      }

      return {
        worthRemembering: true,
        memoryType: "brand_rule",
        importance: 5,
        summary: `Brand rule established: ${trimmed}`,
        extractedTerms: {
          forbidden: extractedForbidden.length > 0 ? extractedForbidden : undefined,
        },
      };
    }

    // 3. User Style & Format Preference
    if (
      lower.includes("from now on") ||
      lower.includes("i prefer") ||
      lower.includes("we prefer") ||
      lower.includes("always write in") ||
      lower.includes("make sure to always") ||
      lower.includes("my preference is") ||
      lower.includes("tone should be")
    ) {
      return {
        worthRemembering: true,
        memoryType: "preference",
        importance: 4,
        summary: `Preference noted: ${trimmed}`,
      };
    }

    // 4. Target Audience & Business Facts
    if (
      lower.includes("target audience") ||
      lower.includes("our customers are") ||
      lower.includes("we target") ||
      lower.includes("audience consists of") ||
      lower.includes("our product is for")
    ) {
      let audienceText: string | undefined = undefined;
      const match = trimmed.match(/(?:target audience is|target audience consists of|customers are|we target|audience consists of)\s+([^.\n]+)/i);
      if (match && match[1]) {
        audienceText = match[1].trim();
      }

      return {
        worthRemembering: true,
        memoryType: "fact",
        importance: 5,
        summary: `Target audience identified: ${audienceText || trimmed}`,
        extractedTerms: {
          audience: audienceText,
        },
      };
    }

    // 5. Strategic Decisions & Pricing
    if (
      lower.includes("we decided") ||
      lower.includes("pricing is") ||
      lower.includes("price is") ||
      lower.includes("our policy is") ||
      lower.includes("we agreed")
    ) {
      return {
        worthRemembering: true,
        memoryType: "decision",
        importance: 4,
        summary: `Decision recorded: ${trimmed}`,
      };
    }

    // Default conversational interaction
    return {
      worthRemembering: false,
      memoryType: "conversation",
      importance: 2,
    };
  }

  /**
   * Processes an incoming interaction, forms memory if valuable, and updates workspace state.
   */
  public static async processAndFormMemory(
    text: string,
    workspaceId: string,
    supabase?: SupabaseClient,
    options: {
      source?: "chat" | "inbox" | "dm" | "system" | "document";
      platform?: string;
    } = {}
  ): Promise<MemoryFormationResult> {
    const evalResult = this.evaluateText(text);

    if (!supabase || !evalResult.worthRemembering) {
      return evalResult;
    }

    try {
      // 1. Generate Vector Embedding
      const embedding = await EmbeddingService.generateEmbedding(text);

      // 2. Persist to ai_message_memory
      await supabase.from("ai_message_memory").insert({
        user_id: workspaceId,
        source: options.source || "chat",
        platform: options.platform || null,
        role: "user",
        content: text.slice(0, 4000),
        memory_type: evalResult.memoryType,
        importance: evalResult.importance,
        embedding: embedding || null,
        metadata: {
          summary: evalResult.summary,
          extractedTerms: evalResult.extractedTerms,
        },
      });

      // 3. Update ai_persona if brand rule or audience facts were discovered
      if (evalResult.extractedTerms?.forbidden && evalResult.extractedTerms.forbidden.length > 0) {
        const { data: persona } = await supabase
          .from("ai_persona")
          .select("forbidden_terms")
          .eq("user_id", workspaceId)
          .single();

        const currentForbidden: string[] = Array.isArray(persona?.forbidden_terms)
          ? persona.forbidden_terms
          : [];
        const merged = Array.from(new Set([...currentForbidden, ...evalResult.extractedTerms.forbidden]));

        await supabase
          .from("ai_persona")
          .upsert({ user_id: workspaceId, forbidden_terms: merged, updated_at: new Date().toISOString() });
      }

      if (evalResult.extractedTerms?.audience) {
        await supabase
          .from("ai_persona")
          .upsert({
            user_id: workspaceId,
            target_audience: evalResult.extractedTerms.audience,
            updated_at: new Date().toISOString(),
          });
      }
    } catch (err) {
      console.warn("[MemoryFormationEngine] Error persisting memory:", err);
    }

    return evalResult;
  }
}
