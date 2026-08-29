/**
 * Unified Memory Retrieval Engine
 *
 * Coordinates retrieval of all workspace memory layers:
 * 1. Brand Intelligence (Tone, Audience, Content Pillars, Guardrails)
 * 2. Semantic Memories (Past decisions, relevant context, facts)
 * 3. Performance Insights (Top hooks, historical engagement rates, best formats)
 */

import type { AgentContext } from "../core/types";
import type {
  MemoryContextBundle,
  MemoryQuery,
  SemanticMemory,
} from "./types";
import { BrandIntelligenceLoader } from "./brand";
import { PerformanceMemoryEngine } from "./performance";

export class MemoryRetrievalEngine {
  /**
   * Retrieves all relevant workspace memory into a consolidated bundle.
   */
  public static async retrieveContext(
    query: string,
    context: AgentContext,
    options: {
      platform?: string;
      maxMemories?: number;
    } = {}
  ): Promise<MemoryContextBundle> {
    const { platform, maxMemories = 5 } = options;
    const workspaceId = context.workspaceId;

    // 1. Load Brand Intelligence
    const brand = await BrandIntelligenceLoader.load(workspaceId, context.supabase);

    // 2. Load Performance Memory
    const performance = await PerformanceMemoryEngine.analyze(
      workspaceId,
      context.supabase,
      platform
    );

    // 3. Load Relevant Semantic Memories
    const semanticMemories = await this.querySemanticMemories(
      {
        query,
        workspaceId,
        limit: maxMemories,
      },
      context
    );

    // 4. Format Consolidated System Context
    const sections: string[] = [];

    // Brand section
    sections.push(BrandIntelligenceLoader.formatPromptSection(brand));

    // Performance section
    const perfSection = PerformanceMemoryEngine.formatPromptSection(performance);
    if (perfSection) {
      sections.push(perfSection);
    }

    // Semantic memories section
    if (semanticMemories.length > 0) {
      const memoryLines: string[] = [];
      memoryLines.push("### RELEVANT WORKSPACE MEMORY & PAST CONTEXT");
      for (const m of semanticMemories) {
        memoryLines.push(`• [${m.memoryType.toUpperCase()}]: ${m.content}`);
      }
      sections.push(memoryLines.join("\n"));
    }

    const formattedSystemContext = sections.join("\n\n");

    return {
      brand,
      semanticMemories,
      performance,
      formattedSystemContext,
    };
  }

  /**
   * Queries relevant semantic memories for a workspace.
   */
  public static async querySemanticMemories(
    params: MemoryQuery,
    context: AgentContext
  ): Promise<SemanticMemory[]> {
    if (!context.supabase) return [];

    try {
      const { data, error } = await context.supabase
        .from("ai_message_memory")
        .select("id, user_id, source, platform, role, content, created_at")
        .eq("user_id", params.workspaceId)
        .order("created_at", { ascending: false })
        .limit(params.limit || 5);

      if (error || !data) return [];

      return data.map((d: any) => ({
        id: d.id,
        workspaceId: d.user_id,
        source: d.source || "chat",
        platform: d.platform || undefined,
        memoryType: "conversation",
        importance: 2,
        content: d.content,
        createdAt: d.created_at,
      }));
    } catch (err) {
      console.warn("[MemoryRetrievalEngine] Could not query semantic memories:", err);
      return [];
    }
  }
}
