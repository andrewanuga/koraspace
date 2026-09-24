/**
 * ChatAgent Evaluation & Guardrail Pipeline
 *
 * Encapsulates post-reasoning evaluation, quality grading, and deterministic
 * self-correction guardrails:
 * - Virality score evaluation and hook/clarity refinement loop
 * - Brand compliance guardrail enforcement (forbidden terms sanitization)
 * - Structured audit trail via AgentStep trace
 */

import { callAI, type ChatMessage } from "../../openrouter";
import { defaultToolRegistry } from "../../tools/index";
import {
  BrandIntelligenceLoader,
  type BrandIntelligence,
  type BrandComplianceReport,
} from "../../memory";
import type { AgentContext } from "../../core/types";
import type { AgentStep } from "./types";

export interface ChatEvaluationOptions {
  aiMessages: ChatMessage[];
  model?: string;
  requireSelfCorrection?: boolean;
  startingIteration: number;
}

export interface ChatEvaluationResult {
  content: string;
  selfCorrected: boolean;
  steps: AgentStep[];
  finalIterations: number;
  complianceReport?: BrandComplianceReport;
}

export class ChatEvaluator {
  /**
   * Evaluates a candidate draft against virality quality standards and brand compliance guardrails.
   * Performs sequential self-correction if either gate fails:
   * 1. Virality evaluation (if requireSelfCorrection is true and content length > 40)
   * 2. Brand compliance guardrails (forbidden terms and guidelines)
   */
  public static async evaluateAndRefine(
    content: string,
    brand: BrandIntelligence,
    context: AgentContext,
    options: ChatEvaluationOptions
  ): Promise<ChatEvaluationResult> {
    let finalContent = content;
    let iterations = options.startingIteration;
    let selfCorrected = false;
    const steps: AgentStep[] = [];
    let lastComplianceReport: BrandComplianceReport | undefined = undefined;

    // 1. Virality & Quality Refinement Gate
    if (options.requireSelfCorrection && finalContent && finalContent.length > 40) {
      const viralityCheck = await defaultToolRegistry.execute(
        "evaluate_virality",
        { content: finalContent, platform: "x" },
        context
      );

      if (viralityCheck.success && viralityCheck.data) {
        const score = (viralityCheck.data as any).overallScore ?? 100;
        if (score < 65) {
          selfCorrected = true;
          steps.push({
            stepIndex: ++iterations,
            type: "self_correction",
            thought: `Initial draft scored ${score}/100 in virality. Refining hook and pacing.`,
            timestamp: Date.now(),
          });

          const refinementRes = await callAI(
            [
              ...options.aiMessages,
              { role: "assistant", content: finalContent },
              {
                role: "system",
                content: `Self-Correction Trigger: The draft scored ${score}/100 in engagement probability. Weaknesses: ${JSON.stringify(
                  (viralityCheck.data as any).breakdown
                )}. Rewrite to maximize retention, clarity, and authority. Return only the revised draft.`,
              },
            ],
            { agent: "chat", model: options.model, temperature: 0.5 }
          );

          if (refinementRes.content) {
            finalContent = refinementRes.content;
          }
        }
      }
    }

    // 2. Brand Compliance Guardrail Verification Gate
    const compliance = BrandIntelligenceLoader.checkCompliance(finalContent, brand);
    lastComplianceReport = compliance;

    if (!compliance.compliant && compliance.violations.length > 0 && finalContent.length > 20) {
      steps.push({
        stepIndex: ++iterations,
        type: "self_correction",
        thought: `Brand compliance violation detected: ${compliance.violations.join(", ")}. Sanitizing output.`,
        timestamp: Date.now(),
      });

      const complianceFixRes = await callAI(
        [
          ...options.aiMessages,
          { role: "assistant", content: finalContent },
          {
            role: "system",
            content: `Compliance Guardrail Trigger: The draft violated brand rules (${compliance.violations.join(
              ", "
            )}). Rewrite the text to strictly remove all forbidden terms and maintain high compliance. Return only the sanitized content.`,
          },
        ],
        { agent: "chat", model: options.model, temperature: 0.3 }
      );

      if (complianceFixRes.content) {
        finalContent = complianceFixRes.content;
      }
    }

    return {
      content: finalContent,
      selfCorrected,
      steps,
      finalIterations: iterations,
      complianceReport: lastComplianceReport,
    };
  }
}
