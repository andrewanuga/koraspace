/**
 * Context Engine v2.0 - Core Type Contracts & Interfaces
 *
 * Defines the unified contracts governing the Context Engine:
 * - ContextRequest: Input specifications for assembling context
 * - ContextBundle: Aggregated raw context from all sources before budget/ranking
 * - ContextSection: Atomic unit of context with priority, importance, and token cost
 * - ContextSource: Provider adapter interface (Brand, Persona, Performance, Semantic, WorkingSession)
 * - ContextTokenBudget: Detailed token allocation across priority tiers
 * - ContextPriority: Strict hierarchy for ranking and pruning
 * - ModelContextProfile: Provider-agnostic model capacity specifications
 * - ContextAssemblyResult: Final deterministic output consumed by LLM agents
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { InputMessage, Attachment } from "../agents/chat/types";
import type { ChatMessage } from "../openrouter";
import type { BrandIntelligence, PerformanceInsight, SemanticMemory } from "../memory/types";

/* ── 1. Priority Hierarchy ────────────────────────────────────── */

export enum ContextPriority {
  /** Uncompromisable safety guardrails, forbidden terms, immediate instruction directives */
  CRITICAL = 1,
  /** Core brand voice, identity, and recent working session turns */
  HIGH = 2,
  /** Writing persona style traits, current user attachments */
  MEDIUM_HIGH = 3,
  /** Empirical performance hooks, top-performing exemplars */
  MEDIUM = 4,
  /** High-similarity semantic memories, relevant facts */
  LOW = 5,
  /** Historical conversation context, background domain knowledge */
  BACKGROUND = 6,
}

/* ── 2. Model Context Profile ─────────────────────────────────── */

export interface ModelContextProfile {
  /** Unique model identifier (e.g. "google/gemini-2.5-flash", "anthropic/claude-3.5-sonnet") */
  modelId: string;
  /** Total input context window in tokens (e.g. 128000, 32000, 8000) */
  contextWindow: number;
  /** Maximum output tokens reserved for completion */
  maxOutputTokens: number;
  /** Safety buffer in tokens reserved to prevent hard context cutoffs */
  safetyBuffer: number;
  /** Estimation multiplier or strategy (characters per token average, defaults to ~4) */
  charsPerToken?: number;
}

/* ── 3. Token Budget Breakdown ────────────────────────────────── */

export interface ContextTokenBudget {
  /** Full context window supported by target model profile */
  totalWindow: number;
  /** Tokens reserved strictly for model output completion */
  reservedOutput: number;
  /** Safety margin reserved for prompt variance and system overhead */
  safetyBuffer: number;
  /** Total maximum input tokens allowed across system prompt + messages */
  maxInputBudget: number;
  /** Budget reserved specifically for static/base system instructions */
  baseSystemBudget: number;
  /** Budget reserved specifically for the latest user prompt & attachments */
  currentRequestBudget: number;
  /** Remaining available budget dynamically allocated across context sources */
  availableContextBudget: number;
  /** Max token caps per priority tier */
  tierAllocations: Record<ContextPriority, number>;
}

/* ── 4. Atomic Context Section ────────────────────────────────── */

export interface ContextSection {
  /** Unique section identifier */
  id: string;
  /** Name of the providing source (e.g., "brand", "persona", "performance", "semantic", "working_session") */
  source: string;
  /** Human-readable section heading (e.g., "Brand Voice & Guardrails") */
  title: string;
  /** Rendered textual content for inclusion in system prompt or message list */
  content: string;
  /** Priority tier governing prune order */
  priority: ContextPriority;
  /** Normalized query relevance score (0.0 to 1.0) */
  relevanceScore: number;
  /** Intrinsic importance score (1 to 5) */
  importanceScore: number;
  /** Estimated token count */
  estimatedTokens: number;
  /** If true, this section cannot be dropped during pruning under any circumstance */
  isMandatory: boolean;
  /** Whether this section is destined for system prompt or message stream */
  target: "system_prompt" | "message_stream";
  /** Optional metadata for debugging, tracing, and attribution */
  metadata?: Record<string, unknown>;
}

/* ── 5. Context Request ───────────────────────────────────────── */

export interface ContextRequest {
  /** Multi-tenant workspace isolation identifier */
  workspaceId: string;
  /** Authenticated user identifier */
  userId?: string;
  /** Active thread or conversation identifier */
  chatId?: string;
  /** Conversation message history */
  messages: InputMessage[];
  /** File or image attachments */
  attachments?: Attachment[];
  /** Optional target social platform for platform-specific context tuning */
  platform?: string;
  /** Target model profile or model identifier string */
  model?: string | ModelContextProfile;
  /** Execution role / agent mode */
  targetRole?: "chat" | "ghost" | "content_generation" | "scoring";
  /** Custom system prompt override */
  userSystemPrompt?: string;
  /** Supabase client bound to caller session or service role */
  supabase?: SupabaseClient;
  /** Optional user-specified max token ceiling */
  maxTokens?: number;
  /** Request-specific overrides or telemetry tags */
  metadata?: Record<string, unknown>;
}

/* ── 6. Context Source Interface ──────────────────────────────── */

export interface SourceResult {
  source: string;
  sections: ContextSection[];
  latencyMs: number;
  success: boolean;
  error?: string;
  /** Optional raw domain data returned by source for downstream consumers */
  rawData?: {
    brand?: BrandIntelligence;
    personaSummary?: string;
    performance?: PerformanceInsight;
    semanticMemories?: SemanticMemory[];
  };
}

export interface ContextSource {
  /** Unique source identifier */
  readonly name: string;
  /** Default priority tier assigned to sections from this source */
  readonly priority: ContextPriority;
  /**
   * Fetches and produces context sections tailored to the request.
   * Sources should fail gracefully and never throw unhandled exceptions.
   */
  fetch(request: ContextRequest, allocatedBudget?: number): Promise<SourceResult>;
}

/* ── 7. Context Bundle (Aggregated Pre-Assembly State) ─────────── */

export interface ContextBundle {
  /** Aggregated sections from all sources */
  sections: ContextSection[];
  /** Sum of estimated tokens across all gathered sections */
  totalEstimatedTokens: number;
  /** Execution results and latency per source */
  sourceResults: Record<string, SourceResult>;
  /** Timestamp when gathering completed */
  timestamp: number;
}

/* ── 8. Context Assembly Result (Final Output) ────────────────── */

export interface PrunedSectionInfo {
  id: string;
  source: string;
  title: string;
  priority: ContextPriority;
  estimatedTokens: number;
  reason: "budget_exceeded" | "low_relevance" | "redundant" | "filtered";
}

export interface CompressedSectionInfo {
  id: string;
  source: string;
  originalTokens: number;
  compressedTokens: number;
}

export interface ContextAssemblyResult {
  /** Consolidated system prompt containing base instructions and formatted context */
  systemPrompt: string;
  /** Cleaned message list ready for provider call (multimodal injected if applicable) */
  messages: ChatMessage[];
  /** Complete token budget used for this assembly run */
  tokenBudget: ContextTokenBudget;
  /** Actual token accounting breakdown */
  tokensUsed: {
    systemPrompt: number;
    messages: number;
    total: number;
  };
  /** List of section IDs retained in final prompt */
  retainedSectionIds: string[];
  /** Sections that were dropped due to token constraints */
  prunedSections: PrunedSectionInfo[];
  /** Sections that underwent lossy or lossless compression */
  compressedSections: CompressedSectionInfo[];
  /** Active compliance rules extracted from brand intelligence */
  complianceRules: {
    forbiddenTerms: string[];
    brandGuidelines: string[];
  };
  /** Complete metadata bundle for tracing and telemetry */
  metadata: {
    modelId: string;
    assemblyLatencyMs: number;
    sourceLatencies: Record<string, number>;
  };
}
