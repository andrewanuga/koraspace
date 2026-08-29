/**
 * AI Model Cost & Token Accounting Engine
 *
 * Estimates token usage and monetary cost per request, agent, and workspace
 * across diverse OpenRouter, OpenAI, and local embedding models.
 */

export interface ModelPricing {
  promptCostPer1k: number; // USD per 1,000 prompt tokens
  completionCostPer1k: number; // USD per 1,000 completion tokens
}

export const MODEL_PRICING_TABLE: Record<string, ModelPricing> = {
  // Free / local
  "google/gemma-4-26b-a4b-it:free": { promptCostPer1k: 0.0, completionCostPer1k: 0.0 },
  "meta-llama/llama-3.3-70b-instruct:free": { promptCostPer1k: 0.0, completionCostPer1k: 0.0 },

  // Budget / Fast
  "openai/gpt-4o-mini": { promptCostPer1k: 0.00015, completionCostPer1k: 0.0006 },
  "anthropic/claude-3.5-haiku": { promptCostPer1k: 0.0008, completionCostPer1k: 0.004 },
  "deepseek/deepseek-chat": { promptCostPer1k: 0.00014, completionCostPer1k: 0.00028 },

  // Standard / Frontier
  "openai/gpt-4o": { promptCostPer1k: 0.0025, completionCostPer1k: 0.01 },
  "anthropic/claude-3.5-sonnet": { promptCostPer1k: 0.003, completionCostPer1k: 0.015 },
  "google/gemini-2.0-flash-001": { promptCostPer1k: 0.0001, completionCostPer1k: 0.0004 },

  // Embeddings
  "text-embedding-3-small": { promptCostPer1k: 0.00002, completionCostPer1k: 0.0 },
  "text-embedding-3-large": { promptCostPer1k: 0.00013, completionCostPer1k: 0.0 },

  // Default fallback
  default: { promptCostPer1k: 0.001, completionCostPer1k: 0.002 },
};

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CostEstimate {
  model: string;
  tokens: TokenUsage;
  promptCostUsd: number;
  completionCostUsd: number;
  totalCostUsd: number;
}

export class CostTracker {
  /**
   * Calculates the estimated USD cost for an AI completion request.
   */
  public static calculateCost(
    model: string,
    usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
  ): CostEstimate {
    const promptTokens = usage.prompt_tokens ?? 0;
    const completionTokens = usage.completion_tokens ?? 0;
    const totalTokens = usage.total_tokens ?? promptTokens + completionTokens;

    const pricing = MODEL_PRICING_TABLE[model] || MODEL_PRICING_TABLE.default;

    const promptCostUsd = (promptTokens / 1000) * pricing.promptCostPer1k;
    const completionCostUsd = (completionTokens / 1000) * pricing.completionCostPer1k;
    const totalCostUsd = Number((promptCostUsd + completionCostUsd).toFixed(6));

    return {
      model,
      tokens: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
      promptCostUsd: Number(promptCostUsd.toFixed(6)),
      completionCostUsd: Number(completionCostUsd.toFixed(6)),
      totalCostUsd,
    };
  }

  /**
   * Fast token estimator for rough string inputs when API usage is omitted (approx 4 chars/token).
   */
  public static estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }
}
