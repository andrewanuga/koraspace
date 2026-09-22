/**
 * AI Rate Limiting & Workspace Budget Enforcement Engine
 *
 * Enforces sliding window request throttling, token throughput limits,
 * and monthly USD budget boundaries per workspace:
 * - Prevents runaway costs and denial-of-wallet attacks
 * - Classifies budget health: Normal (<70%), Warning (70-90%), Restricted (90-100%), Blocked (>=100%)
 */

import { RateLimitError } from "./errors";

export type BudgetHealth = "normal" | "warning" | "restricted" | "blocked";

export interface RateLimitOptions {
  maxRequestsPerMinute?: number;
  maxTokensPerMinute?: number;
  monthlyBudgetUsd?: number;
  currentSpendUsd?: number;
  estimatedTokens?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetInMs: number;
  budgetStatus: BudgetHealth;
  reason?: string;
}

interface WorkspaceUsageWindow {
  requestTimestamps: number[];
  tokenTimestamps: { timestamp: number; tokens: number }[];
}

const usageWindows = new Map<string, WorkspaceUsageWindow>();

export class AIRateLimiter {
  /**
   * Evaluates request rate limits and budget boundaries for a workspace.
   */
  public static check(
    workspaceId: string,
    options: RateLimitOptions = {}
  ): RateLimitResult {
    const {
      maxRequestsPerMinute = 60,
      maxTokensPerMinute = 100000,
      monthlyBudgetUsd = 100.0,
      currentSpendUsd = 0.0,
      estimatedTokens = 500,
    } = options;

    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // 1. Budget Health Check
    let budgetStatus: BudgetHealth = "normal";
    if (monthlyBudgetUsd > 0) {
      const usageRatio = currentSpendUsd / monthlyBudgetUsd;
      if (usageRatio >= 1.0) {
        budgetStatus = "blocked";
        // Clean up idle window if budget is exhausted
        const existing = usageWindows.get(workspaceId);
        if (existing && existing.requestTimestamps.length === 0 && existing.tokenTimestamps.length === 0) {
          usageWindows.delete(workspaceId);
        }
        return {
          allowed: false,
          remainingRequests: 0,
          resetInMs: 3600000, // 1 hour or until billing reset
          budgetStatus,
          reason: `Workspace monthly AI budget of $${monthlyBudgetUsd.toFixed(2)} has been exhausted (spent: $${currentSpendUsd.toFixed(2)}).`,
        };
      } else if (usageRatio >= 0.9) {
        budgetStatus = "restricted";
      } else if (usageRatio >= 0.7) {
        budgetStatus = "warning";
      }
    }

    // 2. Sliding Window Request & Token Throttling
    let window = usageWindows.get(workspaceId);
    if (!window) {
      window = { requestTimestamps: [], tokenTimestamps: [] };
      usageWindows.set(workspaceId, window);
    }

    // Evict timestamps older than 1 minute
    window.requestTimestamps = window.requestTimestamps.filter((t) => t > oneMinuteAgo);
    window.tokenTimestamps = window.tokenTimestamps.filter((t) => t.timestamp > oneMinuteAgo);

    const currentRequests = window.requestTimestamps.length;
    const currentTokens = window.tokenTimestamps.reduce((acc, t) => acc + t.tokens, 0);

    // Check request limit
    if (currentRequests >= maxRequestsPerMinute) {
      const oldest = window.requestTimestamps[0] || now;
      const resetInMs = Math.max(0, oldest + 60000 - now);
      return {
        allowed: false,
        remainingRequests: 0,
        resetInMs,
        budgetStatus,
        reason: `Rate limit of ${maxRequestsPerMinute} requests/minute exceeded.`,
      };
    }

    // Check token throughput limit
    if (currentTokens + estimatedTokens > maxTokensPerMinute) {
      const oldest = window.tokenTimestamps[0]?.timestamp || now;
      const resetInMs = Math.max(0, oldest + 60000 - now);
      return {
        allowed: false,
        remainingRequests: maxRequestsPerMinute - currentRequests,
        resetInMs,
        budgetStatus,
        reason: `Token throughput limit of ${maxTokensPerMinute.toLocaleString()} tokens/minute exceeded.`,
      };
    }

    // Record usage
    window.requestTimestamps.push(now);
    window.tokenTimestamps.push({ timestamp: now, tokens: estimatedTokens });

    const remainingRequests = maxRequestsPerMinute - window.requestTimestamps.length;
    const resetInMs = 60000;

    return {
      allowed: true,
      remainingRequests,
      resetInMs,
      budgetStatus,
    };
  }

  /**
   * Enforces limits, throwing a RateLimitError if blocked.
   */
  public static enforce(workspaceId: string, options: RateLimitOptions = {}): void {
    const result = this.check(workspaceId, options);
    if (!result.allowed) {
      throw new RateLimitError(result.reason || "AI rate limit exceeded");
    }
  }

  /**
   * Prunes all idle workspace windows with no recent requests or token usage.
   */
  public static pruneIdle(maxAgeMs: number = 60000): number {
    const threshold = Date.now() - maxAgeMs;
    let pruned = 0;
    for (const [wsId, win] of usageWindows.entries()) {
      win.requestTimestamps = win.requestTimestamps.filter((t) => t > threshold);
      win.tokenTimestamps = win.tokenTimestamps.filter((t) => t.timestamp > threshold);
      if (win.requestTimestamps.length === 0 && win.tokenTimestamps.length === 0) {
        usageWindows.delete(wsId);
        pruned++;
      }
    }
    return pruned;
  }

  /**
   * Resets usage counters (primarily for testing).
   */
  public static reset(workspaceId?: string): void {
    if (workspaceId) {
      usageWindows.delete(workspaceId);
    } else {
      usageWindows.clear();
    }
  }
}
