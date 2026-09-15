/**
 * Unified ChatAgent Type Contracts & Trace Schemas
 *
 * Defines explicit boundaries for:
 * - ChatInput & Attachments
 * - ToolInvocation & ToolObservation
 * - AgentStep & Execution Trace
 * - ChatPlan & Intent Decomposition
 * - ChatResult & Telemetry
 */

import { z } from "zod";
import type { AgentContext, AgentResult } from "../../core/types";

/* ── 1. Message & Attachment Inputs ───────────────────────────── */

export interface Attachment {
  type: "image" | "video" | "file";
  name: string;
  mime?: string;
  content?: string;
  dataUrl?: string;
}

export interface InputMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatAgentInput {
  messages: InputMessage[];
  systemPrompt?: string;
  attachments?: Attachment[];
  model?: string;
  temperature?: number;
  maxIterations?: number;
  requireSelfCorrection?: boolean;
}

/* ── 2. Tool Invocation & Observation Trace ───────────────────── */

export const ToolInvocationSchema = z.object({
  id: z.string().optional(),
  toolName: z.string(),
  args: z.record(z.string(), z.any()),
  timestamp: z.number().default(() => Date.now()),
});
export type ToolInvocation = z.infer<typeof ToolInvocationSchema>;

export const ToolObservationSchema = z.object({
  toolName: z.string(),
  success: z.boolean(),
  output: z.any(),
  error: z.string().optional(),
  latencyMs: z.number(),
});
export type ToolObservation = z.infer<typeof ToolObservationSchema>;

export interface AgentStep {
  stepIndex: number;
  type: "thought" | "tool_call" | "observation" | "self_correction" | "final_answer";
  thought?: string;
  toolInvocation?: ToolInvocation;
  observation?: ToolObservation;
  timestamp: number;
}

/* ── 3. Planning & Decomposition ──────────────────────────────── */

/**
 * Attestation object that records a user‑approved plan.
 * Presence of the object means the plan is approved; absence means not approved.
 */
export interface PlanApproval {
  /** Always true – indicates the object exists = approved */
  approved: true;
  /** When the approval was granted */
  approvedAt: Date;
  /** Fingerprint of the exact plan that was approved */
  planFingerprint: string;
}

/**
 * Chat plan describing intent, required tools, steps and risk.
 * Optional `approval` is attached after user confirmation.
 */
export interface ChatPlan {
  intent: string;
  isComplex: boolean;
  requiredTools: string[]; // order matters for execution
  plannedSteps: string[];
  estimatedRisk: "low" | "medium" | "high";
  approval?: PlanApproval;
}

/**
 * Compute a deterministic fingerprint for a plan.
 * Hashes only immutable, authorization‑relevant fields (excludes approval).
 */
export function computePlanFingerprint(plan: ChatPlan): string {
  // Node's crypto module is available in the runtime.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHash } = require("crypto");
  const payload = JSON.stringify({
    requiredTools: plan.requiredTools,
    intent: plan.intent,
    estimatedRisk: plan.estimatedRisk,
    plannedSteps: plan.plannedSteps,
  });
  return createHash("sha256").update(payload).digest("hex");
}

/* ── 4. Policy Types ──────────────────────────────────────── */

export type PolicyReasonCode =
  | "UNKNOWN_TOOL"
  | "MISSING_CAPABILITY"
  | "PLAN_DEVIATION"
  | "STALE_APPROVAL"
  | "CONFIRMATION_REQUIRED"
  | "HIGH_RISK_ACTION";

export type PolicyAction = "ALLOW" | "DENY" | "REQUIRE_CONFIRMATION";

export interface PolicyDecision {
  action: PolicyAction;
  reasonCodes: PolicyReasonCode[]; // machine‑readable for telemetry / tests
  reasons: string[]; // human‑readable explanations / logs
  requiredConfirmation?: string; // present when action === REQUIRE_CONFIRMATION
}

/* ── 5. Output & Telemetry Results ────────────────────────────── */

export interface ChatAgentOutput {
  content: string;
  model?: string;
  plan?: ChatPlan;
  steps: AgentStep[];
  iterations: number;
  selfCorrected?: boolean;
}

export type ChatAgentResult = AgentResult<ChatAgentOutput>;
