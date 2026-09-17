// lib/ai/context/engine.ts

import { ContextRequest, ContextAssemblyResult, ContextTokenBudget, ModelContextProfile } from "./types";
import { TokenBudgetEngine, resolveModelProfile } from "./budget";
import { ContextRankingEngine } from "./ranking";
import { ContextCompressionEngine, CompressionOptions } from "./compression";
import { assembleContext } from "./assembler";
import { BrandSource } from "./sources/brand";
import { PersonaSource } from "./sources/persona";
import { PerformanceSource } from "./sources/performance";
import { SemanticSource } from "./sources/semantic";
import { WorkingSessionSource } from "./sources/working-session";
import type { ContextSource, SourceResult } from "./types";

/**
 * ContextEngine – orchestrates the full context assembly pipeline.
 */
export class ContextEngine {
  private readonly sources: ContextSource[];

  constructor(sources?: ContextSource[]) {
    this.sources = sources ?? [
      new BrandSource(),
      new PersonaSource(),
      new PerformanceSource(),
      new SemanticSource(),
      new WorkingSessionSource(),
    ];
  }

  /** Assemble a ContextAssemblyResult for the given request. */
  public async assemble(request: ContextRequest): Promise<ContextAssemblyResult> {
    if (!request.workspaceId) {
      throw new Error("ContextRequest missing required workspaceId");
    }

    const modelProfile: ModelContextProfile = resolveModelProfile(request.model);
    const tokenBudget: ContextTokenBudget = TokenBudgetEngine.calculateBudget(request, modelProfile);

    // Execute all sources in parallel, never letting a rejection escape.
    const sourcePromises = this.sources.map((src) =>
      src
        .fetch(request, tokenBudget.tierAllocations[src.priority])
        .then((result) => ({ name: src.name, result }))
        .catch((err: any) => ({
          name: src.name,
          result: {
            source: src.name,
            sections: [],
            latencyMs: 0,
            success: false,
            error: err?.message ?? "Source execution failed",
          } as SourceResult,
        }))
    );

    const settled = await Promise.allSettled(sourcePromises);

    const sourceResults: Record<string, SourceResult> = {};
    const fetchedResults: SourceResult[] = [];

    for (const entry of settled) {
      if (entry.status === "fulfilled") {
        const { name, result } = (entry.value as any);
        sourceResults[name] = result;
        fetchedResults.push(result);
      } else {
        const name = "unknown";
        const err = (entry as any).reason;
        const result: SourceResult = {
          source: name,
          sections: [],
          latencyMs: 0,
          success: false,
          error: err?.message ?? "Unknown source failure",
        };
        sourceResults[name] = result;
        fetchedResults.push(result);
      }
    }

    // Delegate deterministic steps to assembler helper.
    const assembly = await assembleContext({
      request,
      tokenBudget,
      sourceResults,
      fetchedResults,
    });

    return assembly;
  }
}
