/**
 * Unified GhostAgent Type Contracts & Schemas
 *
 * Defines explicit boundaries for:
 * - GhostInput: Ingested social interactions
 * - GhostContext: Execution context and identity
 * - GhostDecision: Raw LLM proposed action and reasoning
 * - GhostPolicyResult: Evaluated deterministic safety & autonomy decision
 * - GhostResult: Final execution response envelope
 */

import { z } from "zod";
import type { AgentResult } from "../../core/types";

/* ── 1. Action Types & Enums ──────────────────────────────────── */

export const GhostActionTypeSchema = z.enum([
  "auto_reply",
  "flag_lead",
  "escalate_complaint",
  "ignore",
]);

export type GhostActionType = z.infer<typeof GhostActionTypeSchema>;

export const GhostRiskLevelSchema = z.enum(["low", "medium", "high", "critical"]);
export type GhostRiskLevel = z.infer<typeof GhostRiskLevelSchema>;

export const GhostPolicyDecisionSchema = z.enum([
  "ALLOW",
  "REQUIRE_APPROVAL",
  "DENY",
]);
export type GhostPolicyDecision = z.infer<typeof GhostPolicyDecisionSchema>;

/* ── 2. Rule & Interaction Inputs ─────────────────────────────── */

export interface GhostRule {
  id?: string;
  label: string;
  enabled: boolean;
  actionOverride?: GhostActionType;
}

export interface GhostInput {
  message: string;
  senderName?: string;
  senderId?: string;
  platform?: string;
  isComment?: boolean;
  commentId?: string;
  threadId?: string;
  rules?: GhostRule[];
  brandVoice?: string;
  botId?: string;
  accountToken?: string;
}

/* ── 3. Decision & Policy Contracts ───────────────────────────── */

export const GhostDecisionSchema = z.object({
  action: GhostActionTypeSchema,
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  reply: z.string().optional(),
  isLead: z.boolean().default(false),
  riskLevel: GhostRiskLevelSchema.default("low"),
  suggestedTags: z.array(z.string()).default([]),
});

export type GhostDecision = z.infer<typeof GhostDecisionSchema>;

export interface GhostPolicyEvaluation {
  decision: GhostPolicyDecision;
  canDispatchImmediately: boolean;
  requiresHumanApproval: boolean;
  reasons: string[];
}

export interface GhostEvaluation extends GhostDecision {
  policy: GhostPolicyEvaluation;
  dispatched?: boolean;
  actionId?: string;
}

export type GhostAgentResult = AgentResult<GhostEvaluation>;
