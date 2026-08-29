/**
 * Unified AI Telemetry & Observability Engine
 *
 * Provides structured execution tracing, step profiling, and secret sanitization:
 * - Generates unique trace_id and request_id per agent run
 * - Records latency, tool usage, memory hits, iterations, and failure codes
 * - Enforces zero secret leakage (masks API keys, OAuth tokens, and bearer secrets)
 */

export interface AITrace {
  traceId: string;
  requestId: string;
  agent: string;
  operation: string;
  workspaceId: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  status: "running" | "success" | "error" | "aborted";
  model?: string;
  iterations: number;
  toolCalls: {
    toolName: string;
    latencyMs: number;
    success: boolean;
  }[];
  memoryHits: number;
  selfCorrections: number;
  errorCode?: string;
  errorMessage?: string;
}

export class AITelemetry {
  /**
   * Generates a random unique identifier for tracing.
   */
  public static generateId(prefix: string = "trc"): string {
    const rand = Math.random().toString(36).substring(2, 10);
    const ts = Date.now().toString(36);
    return `${prefix}_${ts}_${rand}`;
  }

  /**
   * Starts a new execution trace.
   */
  public static startTrace(
    agent: string,
    operation: string,
    workspaceId: string = "default"
  ): AITrace {
    return {
      traceId: this.generateId("trc"),
      requestId: this.generateId("req"),
      agent,
      operation,
      workspaceId,
      startedAt: Date.now(),
      status: "running",
      iterations: 0,
      toolCalls: [],
      memoryHits: 0,
      selfCorrections: 0,
    };
  }

  /**
   * Records a tool invocation within a trace.
   */
  public static recordToolCall(
    trace: AITrace,
    toolName: string,
    latencyMs: number,
    success: boolean
  ): void {
    trace.toolCalls.push({
      toolName,
      latencyMs,
      success,
    });
  }

  /**
   * Concludes a trace and calculates final latency.
   */
  public static endTrace(
    trace: AITrace,
    status: "success" | "error" | "aborted" = "success",
    details?: {
      model?: string;
      errorCode?: string;
      errorMessage?: string;
      iterations?: number;
      memoryHits?: number;
      selfCorrections?: number;
    }
  ): AITrace {
    trace.endedAt = Date.now();
    trace.durationMs = trace.endedAt - trace.startedAt;
    trace.status = status;

    if (details) {
      if (details.model) trace.model = details.model;
      if (details.errorCode) trace.errorCode = details.errorCode;
      if (details.errorMessage) trace.errorMessage = this.sanitize(details.errorMessage);
      if (details.iterations !== undefined) trace.iterations = details.iterations;
      if (details.memoryHits !== undefined) trace.memoryHits = details.memoryHits;
      if (details.selfCorrections !== undefined) trace.selfCorrections = details.selfCorrections;
    }

    return trace;
  }

  /**
   * Sanitizes strings and objects, strictly redacting API keys, passwords, and tokens.
   */
  public static sanitize(input: any): any {
    if (!input) return input;

    if (typeof input === "string") {
      return input
        // OpenRouter / OpenAI keys
        .replace(/sk-or-v1-[a-zA-Z0-9_-]{10,}/gi, "[REDACTED_API_KEY]")
        .replace(/sk-[a-zA-Z0-9_-]{20,}/gi, "[REDACTED_API_KEY]")
        // Bearer tokens
        .replace(/Bearer\s+[a-zA-Z0-9_.-]{15,}/gi, "Bearer [REDACTED_TOKEN]")
        // Supabase keys
        .replace(/eyJhbGciOi[a-zA-Z0-9_-]{30,}/gi, "[REDACTED_JWT]")
        // Passwords & secrets
        .replace(/("?(?:password|token|secret|apiKey|api_key)"?\s*[:=]\s*)"[^"]+"/gi, '$1"[REDACTED]"');
    }

    if (typeof input === "object") {
      try {
        const json = JSON.stringify(input);
        const sanitizedJson = this.sanitize(json);
        return JSON.parse(sanitizedJson);
      } catch {
        return input;
      }
    }

    return input;
  }
}
