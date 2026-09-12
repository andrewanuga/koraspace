/**
 * Unified AI API Response & Error Normalizer
 *
 * Converts internal errors, AIError instances, and runtime exceptions into
 * sanitized, safe, typed HTTP responses with trace IDs:
 * - Redacts stack traces, database strings, system prompts, and API keys
 * - Returns structured error payloads with retryability hints and HTTP status codes
 */

import { NextResponse } from "next/server";
import { AIError, SecurityError, RateLimitError, MemoryError, ToolError, LLMError } from "./errors";
import { AITelemetry } from "./telemetry";

export interface AIErrorResponsePayload {
  error: string;
  code: string;
  statusCode: number;
  retryable: boolean;
  traceId: string;
  timestamp: number;
}

export class APIResponse {
  /**
   * Builds a standardized, successful JSON response.
   */
  public static success<T>(data: T, traceId?: string, status: number = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
        traceId: traceId || AITelemetry.generateId("trc"),
        timestamp: Date.now(),
      },
      { status }
    );
  }

  /**
   * Converts any thrown error or AIError into a sanitized, safe client response.
   */
  public static error(err: unknown, traceId?: string): NextResponse<AIErrorResponsePayload> {
    const tid = traceId || (err instanceof AIError ? err.traceId : undefined) || AITelemetry.generateId("trc");

    // 1. Prompt Injection & Security Violations (403)
    if (err instanceof SecurityError) {
      return NextResponse.json(
        {
          error: "Request blocked by AI security guardrails due to malicious or prohibited instructions.",
          code: err.code,
          statusCode: 403,
          retryable: false,
          traceId: tid,
          timestamp: Date.now(),
        },
        { status: 403 }
      );
    }

    // 2. Rate Limit & Budget Exceeded (429)
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        {
          error: err.message || "AI rate limit or monthly budget exceeded for this workspace.",
          code: err.code,
          statusCode: 429,
          retryable: true,
          traceId: tid,
          timestamp: Date.now(),
        },
        { status: 429 }
      );
    }

    // 3. Structured AIErrors (LLM, Tool, Memory, Database)
    if (err instanceof AIError) {
      let clientMsg = "An error occurred during AI processing.";

      if (err instanceof LLMError) {
        clientMsg = "AI model provider is temporarily unavailable or timed out. Please retry.";
      } else if (err instanceof ToolError) {
        clientMsg = `Execution of tool "${err.tool || "requested"}" failed.`;
      } else if (err instanceof MemoryError) {
        clientMsg = "Could not access persistent AI knowledge base.";
      }

      return NextResponse.json(
        {
          error: clientMsg,
          code: err.code,
          statusCode: err.statusCode,
          retryable: err.retryable,
          traceId: tid,
          timestamp: Date.now(),
        },
        { status: err.statusCode }
      );
    }

    // 4. Generic or Unknown Runtime Errors (500)
    console.error(`[AI API Error] traceId=${tid}`, err);

    return NextResponse.json(
      {
        error: "Internal AI processing error. Please try again or contact support.",
        code: "INTERNAL_AGENT_ERROR",
        statusCode: 500,
        retryable: true,
        traceId: tid,
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
