/**
 * Unified AI Telemetry & Observability Engine
 *
 * Provides structured execution tracing, step profiling, cost accounting,
 * secret sanitization, and live performance metrics aggregation:
 * - Generates unique trace_id and request_id per agent run
 * - Records latency percentiles (P50, P95, P99), tool usage, memory hits, and cost
 * - Enforces zero secret leakage (masks API keys, OAuth tokens, and bearer secrets)
 */

import { CostTracker } from "./cost";

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
  tokens?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  estimatedCostUsd?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface ObservabilityMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number; // percentage (e.g. 98.5)
  averageLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  totalCostUsd: number;
  agentBreakdown: Record<
    string,
    {
      executions: number;
      successRate: number;
      avgLatencyMs: number;
      avgIterations: number;
      costUsd: number;
    }
  >;
  toolBreakdown: Record<
    string,
    {
      calls: number;
      successRate: number;
      avgLatencyMs: number;
    }
  >;
}

// In-memory rolling buffer for recent traces
const MAX_BUFFER_SIZE = 1000;
const traceBuffer: AITrace[] = [];

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
   * Concludes a trace and calculates final latency, cost, and pushes to rolling buffer.
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
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
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

      if (details.usage && details.model) {
        const costEstimate = CostTracker.calculateCost(details.model, details.usage);
        trace.tokens = costEstimate.tokens;
        trace.estimatedCostUsd = costEstimate.totalCostUsd;
      }
    }

    // Push into rolling trace buffer
    traceBuffer.unshift(trace);
    if (traceBuffer.length > MAX_BUFFER_SIZE) {
      traceBuffer.pop();
    }

    return trace;
  }

  /**
   * Aggregates telemetry data into high-level observability metrics.
   */
  public static getObservabilityMetrics(workspaceId?: string): ObservabilityMetrics {
    const traces = workspaceId
      ? traceBuffer.filter((t) => t.workspaceId === workspaceId && t.endedAt)
      : traceBuffer.filter((t) => Boolean(t.endedAt));

    const total = traces.length;
    if (total === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        successRate: 100,
        averageLatencyMs: 0,
        p50LatencyMs: 0,
        p95LatencyMs: 0,
        p99LatencyMs: 0,
        totalCostUsd: 0,
        agentBreakdown: {},
        toolBreakdown: {},
      };
    }

    const successful = traces.filter((t) => t.status === "success").length;
    const failed = traces.filter((t) => t.status === "error").length;
    const latencies = traces.map((t) => t.durationMs ?? 0).sort((a, b) => a - b);
    const sumLatency = latencies.reduce((acc, l) => acc + l, 0);

    const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
    const totalCost = traces.reduce((acc, t) => acc + (t.estimatedCostUsd ?? 0), 0);

    // Agent Breakdown
    const agentBreakdown: ObservabilityMetrics["agentBreakdown"] = {};
    for (const t of traces) {
      if (!agentBreakdown[t.agent]) {
        agentBreakdown[t.agent] = {
          executions: 0,
          successRate: 0,
          avgLatencyMs: 0,
          avgIterations: 0,
          costUsd: 0,
        };
      }
      agentBreakdown[t.agent].executions++;
      agentBreakdown[t.agent].costUsd += t.estimatedCostUsd ?? 0;
    }

    for (const [agentName, meta] of Object.entries(agentBreakdown)) {
      const agentTraces = traces.filter((t) => t.agent === agentName);
      const succ = agentTraces.filter((t) => t.status === "success").length;
      const totalLat = agentTraces.reduce((acc, t) => acc + (t.durationMs ?? 0), 0);
      const totalIter = agentTraces.reduce((acc, t) => acc + (t.iterations || 1), 0);

      meta.successRate = Number(((succ / meta.executions) * 100).toFixed(1));
      meta.avgLatencyMs = Math.round(totalLat / meta.executions);
      meta.avgIterations = Number((totalIter / meta.executions).toFixed(1));
      meta.costUsd = Number(meta.costUsd.toFixed(6));
    }

    // Tool Breakdown
    const toolBreakdown: ObservabilityMetrics["toolBreakdown"] = {};
    for (const t of traces) {
      for (const call of t.toolCalls) {
        if (!toolBreakdown[call.toolName]) {
          toolBreakdown[call.toolName] = {
            calls: 0,
            successRate: 0,
            avgLatencyMs: 0,
          };
        }
        toolBreakdown[call.toolName].calls++;
      }
    }

    for (const [toolName, meta] of Object.entries(toolBreakdown)) {
      const allCalls = traces.flatMap((t) => t.toolCalls.filter((c) => c.toolName === toolName));
      const succ = allCalls.filter((c) => c.success).length;
      const totalLat = allCalls.reduce((acc, c) => acc + c.latencyMs, 0);

      meta.successRate = Number(((succ / meta.calls) * 100).toFixed(1));
      meta.avgLatencyMs = Math.round(totalLat / meta.calls);
    }

    return {
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: failed,
      successRate: Number(((successful / total) * 100).toFixed(2)),
      averageLatencyMs: Math.round(sumLatency / total),
      p50LatencyMs: p50,
      p95LatencyMs: p95,
      p99LatencyMs: p99,
      totalCostUsd: Number(totalCost.toFixed(6)),
      agentBreakdown,
      toolBreakdown,
    };
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
        // Supabase / Auth JWTs
        .replace(/eyJhbGciOi[a-zA-Z0-9_.-]+/gi, "[REDACTED_JWT]")
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
