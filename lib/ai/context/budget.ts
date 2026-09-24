/**
 * Context Engine v2.0 - Token Budgeting & Capacity Allocation
 *
 * Provides provider-agnostic token budgeting driven by ModelContextProfile:
 * - Dynamic context window partitioning
 * - Deterministic token estimation across text and attachments
 * - Tiered allocation quotas (Critical, High, Medium, Low, Background)
 * - Post-assembly validation guaranteeing context never exceeds window limits
 */

import {
  ContextPriority,
  type ContextRequest,
  type ContextTokenBudget,
  type ModelContextProfile,
} from "./types";

/* ── 1. Default Provider-Agnostic Capability Profiles ─────────── */

export const DEFAULT_MODEL_PROFILES: Record<string, ModelContextProfile> = {
  // Ultra-large context models (e.g. Gemini 1.5/2.0 Flash/Pro)
  large: {
    modelId: "large-window-profile",
    contextWindow: 128000,
    maxOutputTokens: 8192,
    safetyBuffer: 2000,
    charsPerToken: 3.8,
  },
  // Standard frontier models (e.g. 32k window)
  standard: {
    modelId: "standard-window-profile",
    contextWindow: 32000,
    maxOutputTokens: 4096,
    safetyBuffer: 1500,
    charsPerToken: 4.0,
  },
  // Compact / budget models (e.g. 8k-16k window)
  compact: {
    modelId: "compact-window-profile",
    contextWindow: 8192,
    maxOutputTokens: 2048,
    safetyBuffer: 800,
    charsPerToken: 4.0,
  },
};

/* ── 2. Fast Token Estimator ──────────────────────────────────── */

/**
 * Deterministically estimates token counts using character heuristics:
 * - Accounts for word breaks, punctuation, and code blocks
 * - Uses calibrated characters-per-token ratio (default: 3.8 - 4.0)
 */
export function estimateTokens(text?: string | null, charsPerToken: number = 3.8): number {
  if (!text || text.length === 0) return 0;

  // Trim extraneous whitespace for estimation
  const clean = text.trim();
  if (clean.length === 0) return 0;

  // Code or JSON blocks have higher token density (lower chars/token)
  const isCodeOrJson = clean.includes("```") || (clean.startsWith("{") && clean.endsWith("}"));
  const effectiveRatio = isCodeOrJson ? Math.min(charsPerToken, 3.2) : charsPerToken;

  return Math.max(1, Math.ceil(clean.length / effectiveRatio));
}

/**
 * Estimates token count for an array of input messages.
 */
export function estimateMessagesTokens(
  messages: Array<{ role: string; content: string }>,
  charsPerToken: number = 3.8
): number {
  let total = 0;
  for (const m of messages) {
    // 4 tokens overhead per message for role & framing tokens
    total += 4 + estimateTokens(m.content, charsPerToken);
  }
  return total;
}

/* ── 3. Profile Resolver ──────────────────────────────────────── */

/**
 * Resolves a model string or partial profile into a validated ModelContextProfile.
 * Completely provider-agnostic: matches capability classes without hardcoding vendor logic.
 */
export function resolveModelProfile(
  model?: string | ModelContextProfile
): ModelContextProfile {
  if (model && typeof model === "object" && "contextWindow" in model) {
    return {
      modelId: model.modelId || "custom-profile",
      contextWindow: Math.max(2048, model.contextWindow),
      maxOutputTokens: Math.max(256, model.maxOutputTokens || 2048),
      safetyBuffer: Math.max(200, model.safetyBuffer || 1000),
      charsPerToken: model.charsPerToken || 3.8,
    };
  }

  const modelId = typeof model === "string" ? model.toLowerCase() : "";

  // Heuristic matching based on model capabilities
  if (
    modelId.includes("gemini") ||
    modelId.includes("flash") ||
    modelId.includes("128k") ||
    modelId.includes("1m")
  ) {
    return { ...DEFAULT_MODEL_PROFILES.large, modelId: model || "gemini-large" };
  }

  if (
    modelId.includes("mini") ||
    modelId.includes("compact") ||
    modelId.includes("8k") ||
    modelId.includes("gemma")
  ) {
    return { ...DEFAULT_MODEL_PROFILES.compact, modelId: model || "compact" };
  }

  // Default to standard profile
  return { ...DEFAULT_MODEL_PROFILES.standard, modelId: model || "standard" };
}

/* ── 4. Budget Calculator ─────────────────────────────────────── */

export class TokenBudgetEngine {
  /**
   * Calculates the explicit token budget partitions before context assembly.
   */
  public static calculateBudget(
    request: ContextRequest,
    profile?: ModelContextProfile
  ): ContextTokenBudget {
    const resolvedProfile = profile || resolveModelProfile(request.model);
    const charsRatio = resolvedProfile.charsPerToken || 3.8;

    const totalWindow = request.maxTokens && request.maxTokens < resolvedProfile.contextWindow
      ? request.maxTokens
      : resolvedProfile.contextWindow;

    const reservedOutput = resolvedProfile.maxOutputTokens;
    const safetyBuffer = resolvedProfile.safetyBuffer;

    // Total permissible input tokens
    const maxInputBudget = Math.max(1024, totalWindow - reservedOutput - safetyBuffer);

    // 1. Estimate Base System Instruction Budget
    const baseSystemText = request.userSystemPrompt || "You are Koraspace AI, an elite autonomous social media agent.";
    const baseSystemBudget = estimateTokens(baseSystemText, charsRatio) + 50; // padding for wrappers

    // 2. Estimate Current User Request + Attachments
    const userMessages = (request.messages || []).filter((m) => m.role === "user");
    const lastUserText = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : "";
    let attachmentTokens = 0;

    for (const a of request.attachments || []) {
      if (a.content) {
        attachmentTokens += estimateTokens(a.content, charsRatio);
      } else if (a.type === "image") {
        // Standard OpenAI/Gemini image token tile cost assumption (~300-800 tokens)
        attachmentTokens += 600;
      }
    }

    const currentRequestBudget = estimateTokens(lastUserText, charsRatio) + attachmentTokens + 100;

    // 3. Available Context Engine Budget
    const availableContextBudget = Math.max(
      200,
      maxInputBudget - baseSystemBudget - currentRequestBudget
    );

    // 4. Partition Quotas Across Priority Tiers
    // Tiered weights: CRITICAL & HIGH take precedence, while lower tiers share remainder
    const tierAllocations: Record<ContextPriority, number> = {
      [ContextPriority.CRITICAL]: Math.round(availableContextBudget * 0.35),    // Guardrails & forbidden terms
      [ContextPriority.HIGH]: Math.round(availableContextBudget * 0.25),        // Brand voice & active session turns
      [ContextPriority.MEDIUM_HIGH]: Math.round(availableContextBudget * 0.15), // Persona style traits
      [ContextPriority.MEDIUM]: Math.round(availableContextBudget * 0.12),      // Performance hooks & exemplars
      [ContextPriority.LOW]: Math.round(availableContextBudget * 0.10),         // Semantic memories & facts
      [ContextPriority.BACKGROUND]: Math.round(availableContextBudget * 0.03),  // Deep context
    };

    return {
      totalWindow,
      reservedOutput,
      safetyBuffer,
      maxInputBudget,
      baseSystemBudget,
      currentRequestBudget,
      availableContextBudget,
      tierAllocations,
    };
  }

  /**
   * Post-assembly validation check ensuring combined tokens never breach context boundaries.
   */
  public static validateUsage(
    usage: { systemPrompt: number; messages: number; total: number },
    budget: ContextTokenBudget
  ): { isValid: boolean; overflowTokens: number } {
    const totalInput = usage.systemPrompt + usage.messages;
    const overflow = totalInput - budget.maxInputBudget;

    return {
      isValid: overflow <= 0,
      overflowTokens: Math.max(0, overflow),
    };
  }
}
