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

/* -- 1. Message & Attachment Inputs ----------------------------- */

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

/* -- 2. Tool Invocation & Observation Trace --------------------- */

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

/* -- 3. Planning & Decomposition -------------------------------- */

export interface ChatPlan {
  intent: string;
  isComplex: boolean;
  requiredTools: string[];
  plannedSteps: string[];
  estimatedRisk: "low" | "medium" | "high";
}

/* -- 4. Output & Telemetry Results ------------------------------ */

export interface ChatAgentOutput {
  content: string;
  model?: string;
  plan?: ChatPlan;
  steps: AgentStep[];
  iterations: number;
  selfCorrected?: boolean;
}

export type ChatAgentResult = AgentResult<ChatAgentOutput>;
