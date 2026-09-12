/**
 * AI Resilience, Retries & Circuit Breaker Engine
 *
 * Prevents cascading failures when external AI providers, tools, or APIs experience outages:
 * - Exponential backoff retry logic for transient/retryable errors
 * - State machine Circuit Breaker (CLOSED -> OPEN -> HALF_OPEN) with automatic recovery
 */

import { AIError } from "./errors";

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  retryableIf?: (error: unknown) => boolean;
}

/**
 * Executes an async operation with exponential backoff retries.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 300,
    maxDelayMs = 3000,
    backoffFactor = 2,
    retryableIf = (err) => {
      if (err instanceof AIError) return err.retryable;
      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        return (
          msg.includes("timeout") ||
          msg.includes("econnreset") ||
          msg.includes("429") ||
          msg.includes("503") ||
          msg.includes("502")
        );
      }
      return false;
    },
  } = options;

  let attempt = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      return await operation();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries || !retryableIf(err)) {
        throw err;
      }

      await new Promise((res) => setTimeout(res, delay));
      delay = Math.min(maxDelayMs, delay * backoffFactor);
    }
  }
}

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Consecutive failures before tripping
  cooldownMs?: number; // Milliseconds to stay open before half-open probe
  name?: string;
}

export class CircuitBreaker {
  public state: CircuitState = "CLOSED";
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  public readonly failureThreshold: number;
  public readonly cooldownMs: number;
  public readonly name: string;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.cooldownMs = options.cooldownMs ?? 15000;
    this.name = options.name ?? "CircuitBreaker";
  }

  /**
   * Executes a protected call through the circuit breaker.
   */
  public async execute<T>(action: () => Promise<T>): Promise<T> {
    const now = Date.now();

    // Check if cooldown expired
    if (this.state === "OPEN") {
      if (now - this.lastFailureTime > this.cooldownMs) {
        this.state = "HALF_OPEN";
      } else {
        throw new AIError({
          message: `Circuit breaker "${this.name}" is OPEN. Service temporarily unavailable.`,
          code: "CIRCUIT_BREAKER_OPEN",
          statusCode: 503,
          retryable: true,
        });
      }
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  public reset(): void {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}
