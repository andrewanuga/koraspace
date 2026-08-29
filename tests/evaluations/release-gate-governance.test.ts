import { describe, it, expect } from "vitest";
import { AIReleaseGate } from "@/lib/ai/evaluations/release-gate";
import type { EvaluationRunRecord } from "@/lib/ai/evaluations/history";

describe("AI Release Governance Gate Suite", () => {
  const baseline: EvaluationRunRecord = {
    id: "run_base_prod",
    model: "meta-llama/llama-3.3-70b-instruct",
    datasetVersion: "v1.0-golden",
    benchmarkName: "Golden-Chat-v1",
    totalScenarios: 20,
    qualityScore: 92.0,
    brandAdherenceScore: 95.0,
    safetyScore: 99.5,
    toolPrecisionScore: 94.0,
    avgLatencyMs: 1800,
    estimatedCostUsd: 0.02,
    timestamp: Date.now() - 86400000,
  };

  it("should approve candidate that satisfies all production governance gates", () => {
    const validCandidate: EvaluationRunRecord = {
      id: "run_cand_valid",
      model: "anthropic/claude-3.5-sonnet",
      datasetVersion: "v1.0-golden", // Matched dataset
      benchmarkName: "Golden-Chat-v1",
      totalScenarios: 20,
      qualityScore: 95.0, // Quality +3%
      brandAdherenceScore: 97.0, // >= 95%
      safetyScore: 100.0, // >= 99%
      toolPrecisionScore: 96.0,
      avgLatencyMs: 1700,
      estimatedCostUsd: 0.022, // +10% cost (acceptable)
      timestamp: Date.now(),
    };

    const decision = AIReleaseGate.evaluateCandidate(baseline, validCandidate);

    expect(decision.status).toBe("APPROVED_FOR_RELEASE");
    expect(decision.checks.safetyPassed).toBe(true);
    expect(decision.checks.brandPassed).toBe(true);
    expect(decision.checks.qualityPassed).toBe(true);
  });

  it("should block candidate when dataset versions are mismatched", () => {
    const mismatchedDatasetCandidate: EvaluationRunRecord = {
      ...baseline,
      id: "run_cand_mismatch",
      datasetVersion: "v1.1-extended", // Different version
    };

    const decision = AIReleaseGate.evaluateCandidate(baseline, mismatchedDatasetCandidate);

    expect(decision.status).toBe("BLOCKED_BY_GOVERNANCE_GATE");
    expect(decision.checks.datasetParity).toBe(false);
  });

  it("should block candidate when safety score drops below 99.0%", () => {
    const unsafeCandidate: EvaluationRunRecord = {
      ...baseline,
      id: "run_cand_unsafe",
      safetyScore: 97.5, // Below 99.0% floor
    };

    const decision = AIReleaseGate.evaluateCandidate(baseline, unsafeCandidate);

    expect(decision.status).toBe("BLOCKED_BY_GOVERNANCE_GATE");
    expect(decision.checks.safetyPassed).toBe(false);
  });
});
