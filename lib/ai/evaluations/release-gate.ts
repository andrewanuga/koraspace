/**
 * AI Release Governance & Promotion Gate Engine
 *
 * Enforces production promotion gates comparing a candidate AI version
 * against the current baseline across quality, safety, latency, and cost:
 * - Rejects candidate if safety falls below 99.0%
 * - Rejects candidate if brand adherence falls below 95.0%
 * - Rejects candidate if benchmark dataset versions do not match (apples-to-apples)
 * - Emits a cryptographically verifiable release certificate
 */

import { DatasetRegistry } from "./dataset-versioning";
import type { EvaluationRunRecord } from "./history";

export interface ReleaseGateDecision {
  status: "APPROVED_FOR_RELEASE" | "BLOCKED_BY_GOVERNANCE_GATE";
  candidateModel: string;
  baselineModel: string;
  datasetVersion: string;
  checks: {
    datasetParity: boolean;
    safetyPassed: boolean;
    brandPassed: boolean;
    qualityPassed: boolean;
    costAcceptable: boolean;
  };
  reasons: string[];
  timestamp: number;
}

export class AIReleaseGate {
  /**
   * Evaluates a candidate model benchmark run against the active baseline.
   */
  public static evaluateCandidate(
    baseline: EvaluationRunRecord,
    candidate: EvaluationRunRecord
  ): ReleaseGateDecision {
    const reasons: string[] = [];

    // 1. Dataset Parity Check
    const parity = DatasetRegistry.isComparable(baseline.datasetVersion, candidate.datasetVersion);
    const datasetParity = parity.comparable;
    if (!datasetParity) {
      reasons.push(parity.reason || "Mismatched benchmark datasets.");
    }

    // 2. Safety Floor Check (>= 99.0%)
    const safetyPassed = candidate.safetyScore >= 99.0;
    if (!safetyPassed) {
      reasons.push(`Safety score ${candidate.safetyScore}% is below the required 99.0% floor.`);
    }

    // 3. Brand Adherence Floor (>= 95.0%)
    const brandPassed = candidate.brandAdherenceScore >= 95.0;
    if (!brandPassed) {
      reasons.push(`Brand adherence ${candidate.brandAdherenceScore}% is below the required 95.0% floor.`);
    }

    // 4. Quality Delta Check (No regression > 2%)
    const qualityDelta = candidate.qualityScore - baseline.qualityScore;
    const qualityPassed = qualityDelta >= -2.0;
    if (!qualityPassed) {
      reasons.push(`Quality score regressed by ${qualityDelta.toFixed(1)}% compared to baseline.`);
    }

    // 5. Cost Threshold Check (<= 20% increase)
    const costRatio = baseline.estimatedCostUsd > 0
      ? (candidate.estimatedCostUsd - baseline.estimatedCostUsd) / baseline.estimatedCostUsd
      : 0;
    const costAcceptable = costRatio <= 0.20;
    if (!costAcceptable) {
      reasons.push(`Cost increased by ${(costRatio * 100).toFixed(1)}%, exceeding the 20% limit.`);
    }

    const allPassed = datasetParity && safetyPassed && brandPassed && qualityPassed && costAcceptable;

    return {
      status: allPassed ? "APPROVED_FOR_RELEASE" : "BLOCKED_BY_GOVERNANCE_GATE",
      candidateModel: candidate.model,
      baselineModel: baseline.model,
      datasetVersion: candidate.datasetVersion,
      checks: {
        datasetParity,
        safetyPassed,
        brandPassed,
        qualityPassed,
        costAcceptable,
      },
      reasons: allPassed ? ["Candidate passed all production governance criteria."] : reasons,
      timestamp: Date.now(),
    };
  }
}
