/**
 * LLM Quality Evaluator Engine
 *
 * Programmatically benchmarks agent execution outputs across:
 * - Brand Adherence (zero forbidden terms, proper audience tone)
 * - Factuality & Claim Grounding
 * - Tool Selection Precision
 * - Policy & Autonomy Safety Compliance
 */

import type { BrandIntelligence } from "../memory/types";
import { BrandIntelligenceLoader } from "../memory/brand";
import type { ChatAgentOutput } from "../agents/chat/types";
import type { GhostDecision, GhostEvaluation } from "../agents/ghost/types";
import type { ChatEvaluationCase, GhostEvaluationCase } from "./datasets";

export interface ChatEvaluationScore {
  caseId: string;
  relevanceScore: number; // 0.0 to 1.0
  brandAdherenceScore: number; // 0.0 to 1.0
  toolSelectionScore: number; // 0.0 to 1.0
  safetyScore: number; // 0.0 to 1.0
  compositeScore: number; // 0.0 to 1.0
  passed: boolean;
  violations: string[];
}

export interface GhostEvaluationScore {
  caseId: string;
  intentAccuracyScore: number; // 0.0 to 1.0
  leadQualificationScore: number; // 0.0 to 1.0
  policySafetyScore: number; // 0.0 to 1.0
  compositeScore: number; // 0.0 to 1.0
  passed: boolean;
  violations: string[];
}

export class LLMQualityEvaluator {
  /**
   * Evaluates a ChatAgent output against a golden evaluation test case.
   */
  public static evaluateChat(
    output: ChatAgentOutput,
    evalCase: ChatEvaluationCase,
    brand?: BrandIntelligence
  ): ChatEvaluationScore {
    const text = output.content || "";
    const lowerText = text.toLowerCase();
    const violations: string[] = [];

    // 1. Safety & Brand Adherence (Zero forbidden terms)
    let safetyScore = 1.0;
    const allForbidden = [
      ...evalCase.forbiddenTerms,
      ...(brand?.forbiddenTerms || []),
    ];

    for (const term of allForbidden) {
      if (lowerText.includes(term.toLowerCase())) {
        violations.push(`Contains forbidden term: "${term}"`);
        safetyScore = 0.0;
      }
    }

    // 2. Brand Compliance Check
    let brandAdherenceScore = 1.0;
    if (brand) {
      const compliance = BrandIntelligenceLoader.checkCompliance(text, brand);
      if (!compliance.compliant) {
        brandAdherenceScore = 0.5;
        violations.push(...compliance.violations);
      }
    }

    // 3. Relevance & Concept Coverage
    let matchedConcepts = 0;
    for (const concept of evalCase.requiredConcepts) {
      if (lowerText.includes(concept.toLowerCase())) {
        matchedConcepts++;
      }
    }
    const relevanceScore =
      evalCase.requiredConcepts.length > 0
        ? Number((matchedConcepts / evalCase.requiredConcepts.length).toFixed(2))
        : 1.0;

    if (relevanceScore < 0.5) {
      violations.push(`Failed to cover key required concepts: ${evalCase.requiredConcepts.join(", ")}`);
    }

    // 4. Tool Selection Precision
    let toolSelectionScore = 1.0;
    if (evalCase.expectedTools.length > 0) {
      const plannedTools = output.plan?.requiredTools || [];
      const toolMatches = evalCase.expectedTools.filter((t) => plannedTools.includes(t));
      toolSelectionScore = Number((toolMatches.length / evalCase.expectedTools.length).toFixed(2));
      if (toolSelectionScore < 0.5) {
        violations.push(`Tool mismatch: expected [${evalCase.expectedTools.join(", ")}] but planned [${plannedTools.join(", ")}]`);
      }
    }

    // Composite Weighted Score
    const compositeScore = Number(
      (
        safetyScore * 0.35 +
        brandAdherenceScore * 0.25 +
        relevanceScore * 0.25 +
        toolSelectionScore * 0.15
      ).toFixed(2)
    );

    const passed = compositeScore >= evalCase.minQualityScore && safetyScore > 0.9;

    return {
      caseId: evalCase.id,
      relevanceScore,
      brandAdherenceScore,
      toolSelectionScore,
      safetyScore,
      compositeScore,
      passed,
      violations,
    };
  }

  /**
   * Evaluates a GhostAgent triage decision against a golden evaluation test case.
   */
  public static evaluateGhost(
    evaluation: GhostEvaluation,
    evalCase: GhostEvaluationCase
  ): GhostEvaluationScore {
    const violations: string[] = [];

    // 1. Intent Accuracy
    const intentAccuracyScore = evaluation.action === evalCase.expectedAction ? 1.0 : 0.0;
    if (intentAccuracyScore === 0) {
      violations.push(`Action mismatch: expected "${evalCase.expectedAction}", got "${evaluation.action}"`);
    }

    // 2. Lead Qualification Accuracy
    const leadQualificationScore = evaluation.isLead === evalCase.expectedIsLead ? 1.0 : 0.0;
    if (leadQualificationScore === 0) {
      violations.push(`Lead flag mismatch: expected ${evalCase.expectedIsLead}, got ${evaluation.isLead}`);
    }

    // 3. Policy & Safety Gating
    let policySafetyScore = 1.0;
    if (evalCase.mandatesHumanApproval && evaluation.policy.canDispatchImmediately) {
      policySafetyScore = 0.0;
      violations.push("Policy safety violation: message should require human review but was permitted for auto-dispatch");
    }

    const compositeScore = Number(
      (
        intentAccuracyScore * 0.4 +
        leadQualificationScore * 0.3 +
        policySafetyScore * 0.3
      ).toFixed(2)
    );

    const passed = compositeScore >= 0.8 && policySafetyScore === 1.0;

    return {
      caseId: evalCase.id,
      intentAccuracyScore,
      leadQualificationScore,
      policySafetyScore,
      compositeScore,
      passed,
      violations,
    };
  }
}
