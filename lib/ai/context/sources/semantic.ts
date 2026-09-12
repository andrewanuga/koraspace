// lib/ai/context/sources/semantic.ts
/**
 * Context Engine v2.0 - Semantic Memory Source Adapter
 *
 * Thin adapter that bridges the existing semantic‑memory retrieval layer
 * (`MemoryRetrievalEngine`) to the Context Engine. It does **no** additional
 * ranking, embedding or storage logic – it merely fetches the raw
 * `SemanticMemory[]` for the workspace and converts each entry into a
 * `ContextSection`.
 *
 * Rules enforced:
 *   • Priority = ContextPriority.LOW (semantic memories are lower priority
 *     than brand, persona, performance evidence).
 *   • Sections are non‑mandatory and may be pruned by the ranking & budget
 *     stages.
 *   • No new database or embedding logic is introduced.
 *   • Errors are handled gracefully and reported with a generic message.
 */

import { MemoryRetrievalEngine } from "../../memory/retrieval";
import type { SemanticMemory } from "../../memory/types";
import { estimateTokens } from "../budget";
import {
  ContextPriority,
  type ContextRequest,
  type ContextSection,
  type ContextSource,
  type SourceResult,
} from "../types";

export class SemanticSource implements ContextSource {
  public readonly name = "semantic";
  public readonly priority = ContextPriority.LOW;

  /**
   * Fetches recent semantic memories for the workspace and maps them to
   * ContextSection objects.
   */
  public async fetch(
    request: ContextRequest,
    _allocatedBudget?: number,
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

    if (!supabase) {
      return {
        source: this.name,
        sections: [],
        latencyMs: Date.now() - startTime,
        success: false,
        error: "Supabase client not provided in ContextRequest",
      };
    }

    try {
      // Retrieve the most recent semantic memories for the workspace.
      // An empty query string falls back to recency ordering inside the
      // retrieval engine.
      const memories: SemanticMemory[] = await MemoryRetrievalEngine.querySemanticMemories(
        { query: "", workspaceId, limit: 10 },
        { workspaceId, supabase, userId: request.userId ?? "" },
      );

      if (!memories || memories.length === 0) {
        return {
          source: this.name,
          sections: [],
          latencyMs: Date.now() - startTime,
          success: true,
        };
      }

      const sections: ContextSection[] = memories.map((m) => {
        const content = m.content;
        return {
          id: `semantic-${m.id}`,
          source: this.name,
          title: `${m.memoryType.charAt(0).toUpperCase() + m.memoryType.slice(1)} memory`,
          content,
          priority: ContextPriority.LOW,
          relevanceScore: 0.8,
          importanceScore: m.importance,
          estimatedTokens: estimateTokens(content),
          isMandatory: false,
          target: "system_prompt",
          metadata: {
            platform: m.platform,
            memoryType: m.memoryType,
            importance: m.importance,
            createdAt: m.createdAt,
          },
        };
      });

      return {
        source: this.name,
        sections,
        latencyMs: Date.now() - startTime,
        success: true,
      };
    } catch (err: any) {
      console.warn("[SemanticSource] Non‑fatal error loading semantic memories:", err);
      return {
        source: this.name,
        sections: [],
        latencyMs: Date.now() - startTime,
        success: false,
        error: "Failed to load semantic memories",
      };
    }
  }
}
