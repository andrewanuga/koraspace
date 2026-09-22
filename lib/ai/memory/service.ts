/**
 * Workspace Memory Service
 *
 * Provides workspace-scoped CRUD and semantic search operations over persistent memories:
 * - Guarantees strict multi-tenant workspace isolation (user_id = workspaceId)
 * - Manages memory classification, importance scoring, and metadata
 * - Integrates with EmbeddingService for vector generation and semantic search
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  MemoryImportance,
  MemoryImportanceSchema,
  MemoryType,
  MemoryTypeSchema,
  SemanticMemory,
} from "./types";
import { EmbeddingService } from "./embeddings";

/* -- Zod Contracts for CRUD ------------------------------------- */

export const StoreMemoryInputSchema = z.object({
  content: z.string().min(3, "Memory content must be at least 3 characters").max(4000),
  memoryType: MemoryTypeSchema.default("fact"),
  importance: MemoryImportanceSchema.default(3),
  source: z.enum(["chat", "inbox", "dm", "system", "document", "manual"]).default("manual"),
  platform: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type StoreMemoryInput = z.infer<typeof StoreMemoryInputSchema>;

export const UpdateMemoryInputSchema = z.object({
  content: z.string().min(3).max(4000).optional(),
  memoryType: MemoryTypeSchema.optional(),
  importance: MemoryImportanceSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type UpdateMemoryInput = z.infer<typeof UpdateMemoryInputSchema>;

export const ListMemoriesOptionsSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  memoryType: MemoryTypeSchema.optional(),
  minImportance: MemoryImportanceSchema.optional(),
  search: z.string().optional(),
});
export type ListMemoriesOptions = z.infer<typeof ListMemoriesOptionsSchema>;

export interface MemoryStats {
  total: number;
  byType: Record<MemoryType, number>;
  byImportance: Record<number, number>;
}

export class MemoryService {
  /**
   * Lists memories for a workspace with filtering, pagination, and sorting.
   */
  public static async listMemories(
    workspaceId: string,
    supabase: SupabaseClient,
    options: ListMemoriesOptions = { limit: 20, offset: 0 }
  ): Promise<{ memories: SemanticMemory[]; total: number }> {
    if (!workspaceId) throw new Error("workspaceId is required");

    let query = supabase
      .from("ai_message_memory")
      .select("id, user_id, source, platform, content, memory_type, importance, metadata, created_at", {
        count: "exact",
      })
      .eq("user_id", workspaceId);

    if (options.memoryType) {
      query = query.eq("memory_type", options.memoryType);
    }

    if (options.minImportance) {
      query = query.gte("importance", options.minImportance);
    }

    if (options.search && options.search.trim()) {
      query = query.ilike("content", `%${options.search.trim()}%`);
    }

    const { data, count, error } = await query
      .order("importance", { ascending: false })
      .order("created_at", { ascending: false })
      .range(options.offset, options.offset + options.limit - 1);

    if (error) {
      console.warn("[MemoryService.listMemories] Query error:", error.message);
      return { memories: [], total: 0 };
    }

    const memories: SemanticMemory[] = (data || []).map((row: any) => ({
      id: row.id,
      workspaceId: row.user_id,
      source: row.source || "manual",
      platform: row.platform || undefined,
      memoryType: (row.memory_type || "fact") as MemoryType,
      importance: (row.importance || 3) as MemoryImportance,
      content: row.content,
      metadata: row.metadata || undefined,
      createdAt: row.created_at,
    }));

    return { memories, total: count ?? memories.length };
  }

  /**
   * Retrieves a single memory by ID ensuring strict workspace ownership.
   */
  public static async getMemory(
    workspaceId: string,
    memoryId: string,
    supabase: SupabaseClient
  ): Promise<SemanticMemory | null> {
    if (!workspaceId || !memoryId) return null;

    const { data, error } = await supabase
      .from("ai_message_memory")
      .select("id, user_id, source, platform, content, memory_type, importance, metadata, created_at")
      .eq("id", memoryId)
      .eq("user_id", workspaceId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      workspaceId: data.user_id,
      source: data.source || "manual",
      platform: data.platform || undefined,
      memoryType: (data.memory_type || "fact") as MemoryType,
      importance: (data.importance || 3) as MemoryImportance,
      content: data.content,
      metadata: data.metadata || undefined,
      createdAt: data.created_at,
    };
  }

  /**
   * Stores a new memory for a workspace with automatic embedding generation.
   */
  public static async storeMemory(
    workspaceId: string,
    input: StoreMemoryInput,
    supabase: SupabaseClient
  ): Promise<SemanticMemory> {
    if (!workspaceId) throw new Error("workspaceId is required");
    const validated = StoreMemoryInputSchema.parse(input);

    const embedding = await EmbeddingService.generateEmbedding(validated.content);

    const insertPayload = {
      user_id: workspaceId,
      source: validated.source,
      platform: validated.platform || null,
      role: "user",
      content: validated.content,
      memory_type: validated.memoryType,
      importance: validated.importance,
      embedding: embedding || null,
      metadata: validated.metadata || {},
    };

    const { data, error } = await supabase
      .from("ai_message_memory")
      .insert(insertPayload)
      .select("id, user_id, source, platform, content, memory_type, importance, metadata, created_at")
      .single();

    if (error || !data) {
      throw new Error(`Failed to store memory: ${error?.message || "Unknown error"}`);
    }

    return {
      id: data.id,
      workspaceId: data.user_id,
      source: data.source,
      platform: data.platform || undefined,
      memoryType: data.memory_type as MemoryType,
      importance: data.importance as MemoryImportance,
      content: data.content,
      metadata: data.metadata || undefined,
      createdAt: data.created_at,
    };
  }

  /**
   * Updates an existing memory with strict workspace authorization.
   */
  public static async updateMemory(
    workspaceId: string,
    memoryId: string,
    updates: UpdateMemoryInput,
    supabase: SupabaseClient
  ): Promise<SemanticMemory | null> {
    if (!workspaceId || !memoryId) return null;
    const validated = UpdateMemoryInputSchema.parse(updates);

    const updatePayload: Record<string, unknown> = {};
    if (validated.content !== undefined) {
      updatePayload.content = validated.content;
      // Refresh embedding if content changed
      const newEmbedding = await EmbeddingService.generateEmbedding(validated.content);
      if (newEmbedding) updatePayload.embedding = newEmbedding;
    }
    if (validated.memoryType !== undefined) updatePayload.memory_type = validated.memoryType;
    if (validated.importance !== undefined) updatePayload.importance = validated.importance;
    if (validated.metadata !== undefined) updatePayload.metadata = validated.metadata;

    const { data, error } = await supabase
      .from("ai_message_memory")
      .update(updatePayload)
      .eq("id", memoryId)
      .eq("user_id", workspaceId)
      .select("id, user_id, source, platform, content, memory_type, importance, metadata, created_at")
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      workspaceId: data.user_id,
      source: data.source,
      platform: data.platform || undefined,
      memoryType: data.memory_type as MemoryType,
      importance: data.importance as MemoryImportance,
      content: data.content,
      metadata: data.metadata || undefined,
      createdAt: data.created_at,
    };
  }

  /**
   * Deletes / forgets a memory with strict workspace authorization.
   */
  public static async forgetMemory(
    workspaceId: string,
    memoryId: string,
    supabase: SupabaseClient
  ): Promise<boolean> {
    if (!workspaceId || !memoryId) return false;

    const { error, count } = await supabase
      .from("ai_message_memory")
      .delete({ count: "exact" })
      .eq("id", memoryId)
      .eq("user_id", workspaceId);

    if (error) {
      console.warn("[MemoryService.forgetMemory] Delete error:", error.message);
      return false;
    }

    return (count ?? 0) > 0;
  }

  /**
   * Calculates high-level memory distribution statistics for a workspace.
   */
  public static async getMemoryStats(
    workspaceId: string,
    supabase: SupabaseClient
  ): Promise<MemoryStats> {
    const stats: MemoryStats = {
      total: 0,
      byType: {
        brand_rule: 0,
        preference: 0,
        fact: 0,
        decision: 0,
        conversation: 0,
      },
      byImportance: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    if (!workspaceId) return stats;

    const { data, error } = await supabase
      .from("ai_message_memory")
      .select("memory_type, importance")
      .eq("user_id", workspaceId);

    if (error || !data) return stats;

    stats.total = data.length;
    for (const row of data) {
      const type = (row.memory_type || "conversation") as MemoryType;
      if (stats.byType[type] !== undefined) {
        stats.byType[type]++;
      }
      const imp = Number(row.importance || 1);
      if (stats.byImportance[imp] !== undefined) {
        stats.byImportance[imp]++;
      }
    }

    return stats;
  }
}
