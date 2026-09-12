/**
 * Memory Consolidation & Deduplication Engine
 *
 * Prevents memory database bloat and semantic pollution:
 * - Detects exact & near-duplicate memories (similarity >= 0.85)
 * - Identifies related clusters (0.65 <= similarity < 0.85)
 * - Merges redundant memories into a canonical record with full provenance tracking
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { MemoryImportance, MemoryType, SemanticMemory } from "./types";
import { EmbeddingService } from "./embeddings";
import { MemoryService } from "./service";

export interface DuplicateCheckResult {
  status: "distinct" | "similar" | "near_duplicate";
  highestSimilarity: number;
  matchedMemory?: SemanticMemory;
}

export interface ConsolidatedMemoryPayload {
  canonicalContent: string;
  memoryType: MemoryType;
  importance: MemoryImportance;
  mergedMemoryIds: string[];
  metadata: Record<string, unknown>;
}

export class ConsolidationEngine {
  /**
   * Evaluates a candidate memory text against existing memories to detect duplication.
   */
  public static checkDuplication(
    candidateText: string,
    existingMemories: SemanticMemory[],
    thresholds = { duplicate: 0.85, similar: 0.65 }
  ): DuplicateCheckResult {
    if (!existingMemories || existingMemories.length === 0) {
      return { status: "distinct", highestSimilarity: 0 };
    }

    let highestSim = 0;
    let bestMatch: SemanticMemory | undefined = undefined;

    const candidateLower = candidateText.trim().toLowerCase();
    const candidateWords = EmbeddingService.tokenizeWords(candidateText);

    for (const mem of existingMemories) {
      // 1. Exact match
      if (mem.content.trim().toLowerCase() === candidateLower) {
        return {
          status: "near_duplicate",
          highestSimilarity: 1.0,
          matchedMemory: mem,
        };
      }

      // 2. Lexical / semantic similarity
      const sim = EmbeddingService.lexicalSimilarityPretokenized(
        candidateWords,
        candidateLower,
        mem.content
      );
      if (sim > highestSim) {
        highestSim = sim;
        bestMatch = mem;
      }
    }

    if (highestSim >= thresholds.duplicate) {
      return {
        status: "near_duplicate",
        highestSimilarity: Number(highestSim.toFixed(2)),
        matchedMemory: bestMatch,
      };
    }

    if (highestSim >= thresholds.similar) {
      return {
        status: "similar",
        highestSimilarity: Number(highestSim.toFixed(2)),
        matchedMemory: bestMatch,
      };
    }

    return {
      status: "distinct",
      highestSimilarity: Number(highestSim.toFixed(2)),
    };
  }

  /**
   * Consolidates a group of redundant memories into a single canonical record.
   */
  public static createConsolidatedPayload(
    memoriesToMerge: SemanticMemory[],
    canonicalContent?: string
  ): ConsolidatedMemoryPayload {
    if (memoriesToMerge.length === 0) {
      throw new Error("Cannot consolidate an empty memory list");
    }

    // Determine highest importance
    const maxImportance = Math.max(
      ...memoriesToMerge.map((m) => m.importance)
    ) as MemoryImportance;

    // Determine most prominent memory type
    const primaryType = memoriesToMerge[0].memoryType;

    // Use provided canonical content or the longest, most specific original memory
    const chosenContent =
      canonicalContent?.trim() ||
      [...memoriesToMerge].sort((a, b) => b.content.length - a.content.length)[0].content;

    const mergedIds = memoriesToMerge.map((m) => m.id);

    return {
      canonicalContent: chosenContent,
      memoryType: primaryType,
      importance: maxImportance,
      mergedMemoryIds: mergedIds,
      metadata: {
        consolidated: true,
        consolidatedAt: new Date().toISOString(),
        mergedCount: memoriesToMerge.length,
        originalIds: mergedIds,
        originalSamples: memoriesToMerge.map((m) => m.content.slice(0, 100)),
      },
    };
  }

  /**
   * Merges duplicate memories into a canonical record and cleans up obsolete records.
   */
  public static async executeMerge(
    workspaceId: string,
    memoriesToMerge: SemanticMemory[],
    supabase: SupabaseClient,
    customCanonicalContent?: string
  ): Promise<SemanticMemory> {
    if (!workspaceId) throw new Error("workspaceId is required");
    if (memoriesToMerge.length < 2) {
      throw new Error("Must provide at least 2 memories to merge");
    }

    const payload = this.createConsolidatedPayload(memoriesToMerge, customCanonicalContent);

    // 1. Store canonical memory
    const canonical = await MemoryService.storeMemory(
      workspaceId,
      {
        content: payload.canonicalContent,
        memoryType: payload.memoryType,
        importance: payload.importance,
        source: "system",
        metadata: payload.metadata,
      },
      supabase
    );

    // 2. Delete redundant merged memories
    for (const mem of memoriesToMerge) {
      await MemoryService.forgetMemory(workspaceId, mem.id, supabase);
    }

    return canonical;
  }
}
