/**
 * AI Evaluation History & Quantitative Benchmark Tracker
 *
 * Persists and tracks quantitative model evaluation benchmarks over time:
 * - Records composite quality, brand adherence, safety score, and tool precision
 * - Computes delta trends across model versions (e.g. GPT-4o vs Claude 3.5 vs Gemma)
 * - Detects quality regressions before production deployments
 */

import { createClient } from "@/lib/supabase/server";

export interface EvaluationRunRecord {
  id: string;
  model: string;
  datasetVersion: string;
  benchmarkName: string;
  totalScenarios: number;
  qualityScore: number;       // 0 - 100
  brandAdherenceScore: number; // 0 - 100
  safetyScore: number;         // 0 - 100
  toolPrecisionScore: number;  // 0 - 100
  avgLatencyMs: number;
  estimatedCostUsd: number;
  timestamp: number;
}

export interface ModelComparisonDelta {
  modelA: string;
  modelB: string;
  qualityDelta: number;
  safetyDelta: number;
  costDeltaPct: number;
  latencyDeltaPct: number;
  recommendation: "promote" | "maintain" | "reject";
}

// In-memory benchmark history cache for runtime comparisons
const evaluationHistory: EvaluationRunRecord[] = [];

export class EvaluationHistoryStore {
  /**
   * Records an evaluation run into the tracking history.
   */
  public static async recordRun(record: EvaluationRunRecord): Promise<{ success: boolean; error?: string }> {
    if (!record || !record.id) {
      return { success: false, error: "Invalid evaluation record" };
    }

    evaluationHistory.push(record);

    try {
      const supabase = await createClient();
      const { error } = await supabase.from("ai_evaluation_history").insert({
        id: record.id,
        model: record.model,
        dataset_version: record.datasetVersion,
        benchmark_name: record.benchmarkName,
        total_scenarios: record.totalScenarios,
        quality_score: record.qualityScore,
        brand_adherence_score: record.brandAdherenceScore,
        safety_score: record.safetyScore,
        tool_precision_score: record.toolPrecisionScore,
        avg_latency_ms: record.avgLatencyMs,
        estimated_cost_usd: record.estimatedCostUsd,
        created_at: new Date(record.timestamp).toISOString(),
      });

      if (error) {
        console.warn("[EvaluationHistoryStore.recordRun] Notice:", error.message);
      }

      return { success: true };
    } catch (err: any) {
      // Soft-fail: Telemetry/evaluation tracking never crashes test or eval suites
      return { success: true };
    }
  }

  /**
   * Computes comparative deltas between two model runs.
   */
  public static compareRuns(runA: EvaluationRunRecord, runB: EvaluationRunRecord): ModelComparisonDelta {
    const qualityDelta = Number((runB.qualityScore - runA.qualityScore).toFixed(2));
    const safetyDelta = Number((runB.safetyScore - runA.safetyScore).toFixed(2));

    const costDeltaPct = runA.estimatedCostUsd > 0
      ? Number((((runB.estimatedCostUsd - runA.estimatedCostUsd) / runA.estimatedCostUsd) * 100).toFixed(1))
      : 0;

    const latencyDeltaPct = runA.avgLatencyMs > 0
      ? Number((((runB.avgLatencyMs - runA.avgLatencyMs) / runA.avgLatencyMs) * 100).toFixed(1))
      : 0;

    // Promotion criteria: Quality higher or equal, Safety >= 99%, and cost/latency acceptable
    let recommendation: "promote" | "maintain" | "reject" = "maintain";
    if (runB.safetyScore >= 99.0 && qualityDelta >= 0 && costDeltaPct <= 10) {
      recommendation = "promote";
    } else if (runB.safetyScore < 98.0 || qualityDelta < -3.0) {
      recommendation = "reject";
    }

    return {
      modelA: runA.model,
      modelB: runB.model,
      qualityDelta,
      safetyDelta,
      costDeltaPct,
      latencyDeltaPct,
      recommendation,
    };
  }

  /**
   * Retrieves all in-memory evaluation records.
   */
  public static getHistory(): readonly EvaluationRunRecord[] {
    return evaluationHistory;
  }

  /**
   * Resets evaluation history (for tests).
   */
  public static reset(): void {
    evaluationHistory.length = 0;
  }
}
