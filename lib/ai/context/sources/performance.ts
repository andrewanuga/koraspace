// lib/ai/context/sources/performance.ts
/**
 * Context Engine v2.0 - Performance Evidence Source Adapter
 *
 * Thin adapter that bridges the existing PerformanceMemoryEngine to the
 * Context Engine. It does **no** additional analysis or recommendation –
 * it simply forwards the raw insight via the engine's built‑in formatter.
 */

import { PerformanceMemoryEngine } from "../../memory/performance";
import type { PerformanceInsight } from "../../memory/types";
import { estimateTokens } from "../budget";
import {
  ContextPriority,
  type ContextRequest,
  type ContextSection,
  type ContextSource,
  type SourceResult,
} from "../types";

export class PerformanceSource implements ContextSource {
  public readonly name = "performance";
  public readonly priority = ContextPriority.MEDIUM;

  /**
   * Fetches performance intelligence for the workspace and converts it into a
   * deterministic ContextSection.
   */
  public async fetch(
    request: ContextRequest,
    _allocatedBudget?: number
  ): Promise<SourceResult> {
    const startTime = Date.now();
    const { workspaceId, supabase, platform } = request;

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
      const insight: PerformanceInsight | undefined = await PerformanceMemoryEngine.analyze(
        workspaceId,
        supabase,
        platform
      );

      // If the engine returned nothing or an empty section, we treat it as a
      // successful fetch with no usable context.
      if (!insight) {
        return {
          source: this.name,
          sections: [],
          latencyMs: Date.now() - startTime,
          success: true,
          rawData: { performance: insight },
        };
      }

      const content = PerformanceMemoryEngine.formatPromptSection(insight);

      // Guard against a totally empty formatted string – this can happen when
      // the insight contains no meaningful data (e.g. no posts analyzed).
      if (!content) {
        return {
          source: this.name,
          sections: [],
          latencyMs: Date.now() - startTime,
          success: true,
          rawData: { performance: insight },
        };
      }

      const section: ContextSection = {
        id: `performance-${workspaceId}`,
        source: this.name,
        title: "Workspace Performance Evidence",
        content,
        priority: ContextPriority.MEDIUM,
        relevanceScore: 0.75,
        importanceScore: 3,
        estimatedTokens: estimateTokens(content),
        isMandatory: false,
        target: "system_prompt",
        metadata: {
          platform: insight.platform ?? undefined,
          totalPostsAnalyzed: insight.totalPostsAnalyzed,
          bestPostingHoursUtc: insight.bestPostingHoursUtc,
        },
      };

      return {
        source: this.name,
        sections: [section],
        latencyMs: Date.now() - startTime,
        success: true,
        rawData: { performance: insight },
      };
    } catch (err: any) {
      console.warn("[PerformanceSource] Non‑fatal error loading performance insight:", err);
      return {
        source: this.name,
        sections: [],
        latencyMs: Date.now() - startTime,
        success: false,
        error: "Failed to load performance insight",
      };
    }
  }
}
