/**
 * Persistent Telemetry Store Adapter
 *
 * Persists execution traces and cost metrics to Supabase `ai_telemetry_traces`
 * for long-term historical analytics, auditability, and team usage reporting.
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AITrace } from "./telemetry";

export interface PersistTraceOptions {
  executionContext?: "request" | "background";
  client?: SupabaseClient;
}

export class TelemetryStore {
  /**
   * Persists an execution trace into the database with explicit context handling.
   */
  public static async persistTrace(
    trace: AITrace,
    options: PersistTraceOptions = { executionContext: "request" }
  ): Promise<{ success: boolean; error?: string }> {
    if (!trace || !trace.traceId) {
      return { success: false, error: "Invalid trace payload" };
    }

    try {
      let supabase: SupabaseClient | null = options.client || null;

      if (!supabase) {
        if (options.executionContext === "background") {
          supabase = createAdminClient();
        } else {
          supabase = await createClient();
        }
      }

      if (!supabase) {
        return { success: false, error: "No Supabase client available" };
      }

      const { error } = await supabase.from("ai_telemetry_traces").insert({
        trace_id: trace.traceId,
        request_id: trace.requestId,
        agent: trace.agent,
        operation: trace.operation,
        workspace_id: trace.workspaceId,
        status: trace.status,
        model: trace.model,
        duration_ms: trace.durationMs || 0,
        iterations: trace.iterations || 1,
        tool_calls: trace.toolCalls || [],
        memory_hits: trace.memoryHits || 0,
        self_corrections: trace.selfCorrections || 0,
        estimated_cost_usd: trace.estimatedCostUsd || 0,
        error_code: trace.errorCode,
        created_at: new Date(trace.startedAt).toISOString(),
      });

      if (error) {
        // Soft-fail: Telemetry store should never crash core agent executions
        console.warn("[TelemetryStore.persistTrace] Warning:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.warn("[TelemetryStore.persistTrace] Error:", err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Persists a trace from an active Next.js HTTP request handler.
   */
  public static async persistTraceFromRequest(trace: AITrace): Promise<{ success: boolean; error?: string }> {
    return this.persistTrace(trace, { executionContext: "request" });
  }

  /**
   * Persists a trace from a background job, worker, or cron task using the admin service client.
   */
  public static async persistTraceFromBackground(trace: AITrace): Promise<{ success: boolean; error?: string }> {
    return this.persistTrace(trace, { executionContext: "background" });
  }
}
