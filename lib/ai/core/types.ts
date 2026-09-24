/**
 * Core Type Contracts for Koraspace AI Intelligence Layer.
 *
 * Provides standardized, type-safe envelopes for:
 * - Agent execution context (AgentContext)
 * - Standardized result envelopes (AgentResult<T>)
 * - Tool specifications and contracts (AITool<TInput, TOutput>)
 * - Model & Provider contracts (ToolDefinition)
 *
 * NOTE: Pure type definitions only - no side-effects or external dependencies.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Capability, AgentPermission } from "./capabilities";
export type { Capability, AgentPermission } from "./capabilities";

/* -- 1. Execution Context --------------------------------------- */

export type AutonomyMode = "assist" | "auto";

export interface AgentContext {
  /** Authenticated user initiating or owning the session */
  userId: string;
  /** Active workspace context (enforcing multi-tenant isolation) */
  workspaceId: string;
  /** Optional active conversation/thread ID */
  chatId?: string;
  /** Autonomy mode for decision execution */
  autonomyMode?: AutonomyMode;
  /** Canonical authorization set */
  capabilities?: Capability[];
  /** Supabase client instance bound to user session or admin */
  supabase?: SupabaseClient;
  /** User-selected or fallback model identifier */
  model?: string;
  /** Per-request metadata / telemetry tags */
  metadata?: Record<string, unknown>;
}

/* -- 2. Standardized Result Envelope ---------------------------- */

export interface AgentError {
  code: string;
  message: string;
  details?: unknown;
  retryable?: boolean;
}

export interface AgentResultMetadata {
  model?: string;
  latencyMs?: number;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
  toolCallsExecuted?: string[];
}

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: AgentError;
  metadata?: AgentResultMetadata;
}

/* -- 3. Tool Definition (OpenRouter / OpenAI Function Spec) ---- */

export interface ToolPropertySchema {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  enum?: string[];
  items?: ToolPropertySchema;
  properties?: Record<string, ToolPropertySchema>;
  required?: string[];
}

export interface ToolParametersSchema {
  type: "object";
  properties: Record<string, ToolPropertySchema>;
  required?: string[];
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: ToolParametersSchema;
  };
}

/* -- 4. Executable AI Tool Interface ---------------------------- */

export interface AITool<TInput = Record<string, unknown>, TOutput = unknown> {
  /** Unique tool identifier matching the LLM function name */
  readonly name: string;
  /** Human & LLM readable description of tool purpose */
  readonly description: string;
  /** OpenRouter/OpenAI compatible schema definition */
  readonly parameters: ToolParametersSchema;
  /** Capabilities the tool requires to be executed. Empty or undefined means non-protected utility. */
  readonly requiredCapabilities?: Capability[];
  /** @deprecated Use `requiredCapabilities` instead. */
  readonly requiredPermissions?: AgentPermission[];
  /** Whether this tool requires human approval in 'assist' mode */
  readonly requiresApproval?: boolean;

  /**
   * Validate and parse raw input before execution.
   * Returns parsed input or throws an error.
   */
  validateInput?(rawInput: unknown): TInput;

  /**
   * Execute the tool within the given AgentContext.
   */
  execute(
    input: TInput,
    context: AgentContext
  ): Promise<AgentResult<TOutput>>;
}

/* -- 5. Persona & Memory Contracts ------------------------------ */

export interface PersonaStyleTraits {
  formality: "casual" | "formal" | "balanced";
  emoji: "none" | "rare" | "occasional" | "frequent";
  sentence_length: "short, punchy" | "medium" | "long";
  exclaim_rate: number;
  avg_words: number;
}

export interface BrandPersona {
  tone_summary: string;
  style_traits: PersonaStyleTraits;
  sample_count: number;
  vocabulary?: string[];
  forbidden_topics?: string[];
  preferred_hooks?: string[];
  updated_at: string;
}
