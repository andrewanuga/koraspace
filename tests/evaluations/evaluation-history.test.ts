import { describe, it, expect, beforeEach } from "vitest";
import { EvaluationHistoryStore, type EvaluationRunRecord } from "@/lib/ai/evaluations/history";

describe("Evaluation History & Model Comparison Suite", () => {
  beforeEach(() => {
    EvaluationHistoryStore.reset();
  });

  const baseRun: EvaluationRunRecord = {
    id: "eval_run_v1",
    model: "meta-llama/llama-3.3-70b-instruct",
    datasetVersion: "v1.0",
    benchmarkName: "Golden-Chat-v1",
    totalScenarios: 20,
    qualityScore: 92.0,
    brandAdherenceScore: 95.0,
    safetyScore: 99.5,
    toolPrecisionScore: 94.0,
    avgLatencyMs: 1800,
    estimatedCostUsd: 0.02,
    timestamp: Date.now() - 3600000,
  };

  const improvedRun: EvaluationRunRecord = {
    id: "eval_run_v2",
    model: "anthropic/claude-3.5-sonnet",
    datasetVersion: "v1.0",
    benchmarkName: "Golden-Chat-v1",
    totalScenarios: 20,
    qualityScore: 96.5, // +4.5% improvement
    brandAdherenceScore: 98.0,
    safetyScore: 100.0,
    toolPrecisionScore: 97.0,
    avgLatencyMs: 1650,
    estimatedCostUsd: 0.021, // +5% cost
    timestamp: Date.now(),
  };

  const degradedRun: EvaluationRunRecord = {
    id: "eval_run_v3",
    model: "unstable-preview-model",
    datasetVersion: "v1.0",
    benchmarkName: "Golden-Chat-v1",
    totalScenarios: 20,
    qualityScore: 84.0, // Regressed
    brandAdherenceScore: 88.0,
    safetyScore: 96.0, // Safety dropped below 98%
    toolPrecisionScore: 80.0,
    avgLatencyMs: 2500,
    estimatedCostUsd: 0.015,
    timestamp: Date.now(),
  };

  it("should record evaluation runs into history", async () => {
    const result = await EvaluationHistoryStore.recordRun(baseRun);
    expect(result.success).toBe(true);

    const history = EvaluationHistoryStore.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].model).toBe("meta-llama/llama-3.3-70b-instruct");
  });

  it("should recommend promotion when model improves quality and maintains safety", () => {
    const delta = EvaluationHistoryStore.compareRuns(baseRun, improvedRun);

    expect(delta.qualityDelta).toBe(4.5);
    expect(delta.safetyDelta).toBe(0.5);
    expect(delta.recommendation).toBe("promote");
  });

  it("should reject release candidate when safety or quality regresses", () => {
    const delta = EvaluationHistoryStore.compareRuns(baseRun, degradedRun);

    expect(delta.qualityDelta).toBe(-8.0);
    expect(delta.safetyDelta).toBe(-3.5);
    expect(delta.recommendation).toBe("reject");
  });
});
