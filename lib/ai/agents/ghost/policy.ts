/**
 * Ghost Mode Deterministic Policy Engine
 *
 * Enforces safety and autonomy governance outside of LLM control:
 * - Autonomy mode enforcement (Assist vs Auto)
 * - Confidence threshold validation (>= 80% for autonomous execution)
 * - Intent & Risk gating (Leads, Complaints, and High-Risk items always require human oversight)
 */

import type {
  GhostDecision,
  GhostInput,
  GhostPolicyEvaluation,
} from "./types";
import type { AgentContext } from "../../core/types";

export interface PolicyConfig {
  minAutoConfidence: number; // e.g. 80
  prohibitAutoOnComplaints: boolean;
  prohibitAutoOnLeads: boolean;
}

export const DEFAULT_POLICY_CONFIG: PolicyConfig = {
  minAutoConfidence: 80,
  prohibitAutoOnComplaints: true,
  prohibitAutoOnLeads: true,
};

export class GhostPolicyEngine {
  /**
   * Evaluates an LLM-proposed decision against strict deterministic rules.
   */
  public static evaluate(
    decision: GhostDecision,
    input: GhostInput,
    context: AgentContext,
    config: PolicyConfig = DEFAULT_POLICY_CONFIG
  ): GhostPolicyEvaluation {
    const reasons: string[] = [];
    const autonomy = context.autonomyMode || "assist";

    // 1. Ignore action: Safe to drop without human interruption
    if (decision.action === "ignore") {
      reasons.push("Message marked as noise/spam; safely ignored.");
      return {
        decision: "ALLOW",
        canDispatchImmediately: false,
        requiresHumanApproval: false,
        reasons,
      };
    }

    // 2. Lead Inquiries: High-value opportunities requiring human qualification
    if (decision.action === "flag_lead" || decision.isLead) {
      reasons.push("Lead inquiry detected. Forwarded to inbox for qualification.");
      return {
        decision: "REQUIRE_APPROVAL",
        canDispatchImmediately: false,
        requiresHumanApproval: true,
        reasons,
      };
    }

    // 3. Complaints & High-Risk issues: Must never be blindly auto-replied
    if (
      decision.action === "escalate_complaint" ||
      decision.riskLevel === "high" ||
      decision.riskLevel === "critical"
    ) {
      reasons.push("Complaint or high-risk content detected. Escalated for human resolution.");
      return {
        decision: "REQUIRE_APPROVAL",
        canDispatchImmediately: false,
        requiresHumanApproval: true,
        reasons,
      };
    }

    // 4. Auto-Reply in Assist Mode: Draft ready, waiting for human click
    if (autonomy === "assist") {
      reasons.push("Assist Mode active: Reply drafted for human approval.");
      return {
        decision: "REQUIRE_APPROVAL",
        canDispatchImmediately: false,
        requiresHumanApproval: true,
        reasons,
      };
    }

    // 5. Auto-Reply in Auto Mode: Check confidence and safety thresholds
    if (autonomy === "auto") {
      if (decision.confidence < config.minAutoConfidence) {
        reasons.push(
          `Confidence (${decision.confidence}%) is below the autonomous threshold (${config.minAutoConfidence}%). Held for review.`
        );
        return {
          decision: "REQUIRE_APPROVAL",
          canDispatchImmediately: false,
          requiresHumanApproval: true,
          reasons,
        };
      }

      if (decision.riskLevel === "medium") {
        reasons.push("Medium risk detected. Held for human review before sending.");
        return {
          decision: "REQUIRE_APPROVAL",
          canDispatchImmediately: false,
          requiresHumanApproval: true,
          reasons,
        };
      }

      if (!decision.reply || decision.reply.trim().length === 0) {
        reasons.push("No reply text generated for auto_reply. Held for review.");
        return {
          decision: "REQUIRE_APPROVAL",
          canDispatchImmediately: false,
          requiresHumanApproval: true,
          reasons,
        };
      }

      // Safe for autonomous dispatch
      reasons.push("Autonomous policy satisfied: High confidence, low risk routine reply.");
      return {
        decision: "ALLOW",
        canDispatchImmediately: true,
        requiresHumanApproval: false,
        reasons,
      };
    }

    // Fallback default safe stance
    reasons.push("Default safety stance applied.");
    return {
      decision: "REQUIRE_APPROVAL",
      canDispatchImmediately: false,
      requiresHumanApproval: true,
      reasons,
    };
  }
}
