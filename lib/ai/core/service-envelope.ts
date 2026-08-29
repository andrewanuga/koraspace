/**
 * Standardized AI Service Envelope (v1)
 *
 * Wraps all AI service responses and errors in a consistent, versioned payload:
 * - Guarantees uniform structure across Chat, Ghost, Content, Memory, and Eval endpoints
 * - Enforces metadata tracing (traceId, correlationId, workspaceId, durationMs)
 * - Conceals internal stack traces and secrets
 */

import { NextResponse } from "next/server";
import { AIError } from "./errors";
import { AITelemetry } from "./telemetry";

export interface ServiceMeta {
  version: "v1";
  traceId: string;
  correlationId: string;
  workspaceId: string;
  durationMs: number;
  timestamp: number;
}

export interface ServiceEnvelope<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    statusCode: number;
    retryable: boolean;
    details?: unknown;
  };
  meta: ServiceMeta;
}

export class ServiceEnvelopeBuilder {
  /**
   * Builds a standardized successful service response envelope.
   */
  public static success<T>(
    data: T,
    options: {
      workspaceId: string;
      correlationId?: string;
      traceId?: string;
      startTime?: number;
      statusCode?: number;
    }
  ): NextResponse<ServiceEnvelope<T>> {
    const now = Date.now();
    const durationMs = options.startTime ? now - options.startTime : 0;

    const envelope: ServiceEnvelope<T> = {
      success: true,
      data,
      meta: {
        version: "v1",
        traceId: options.traceId || AITelemetry.generateId("trc"),
        correlationId: options.correlationId || `cor_${now}`,
        workspaceId: options.workspaceId,
        durationMs,
        timestamp: now,
      },
    };

    return NextResponse.json(envelope, { status: options.statusCode || 200 });
  }

  /**
   * Builds a standardized error service response envelope.
   */
  public static error(
    err: unknown,
    options: {
      workspaceId: string;
      correlationId?: string;
      traceId?: string;
      startTime?: number;
      fallbackStatus?: number;
    }
  ): NextResponse<ServiceEnvelope<never>> {
    const now = Date.now();
    const durationMs = options.startTime ? now - options.startTime : 0;
    const tid = options.traceId || (err instanceof AIError ? err.traceId : undefined) || AITelemetry.generateId("trc");
    let statusCode = options.fallbackStatus || 500;
    let code = "INTERNAL_AI_ERROR";
    let message = "Internal AI service error. Please try again or contact support.";
    let retryable = false;

    if (options.fallbackStatus) {
      statusCode = options.fallbackStatus;
      code = statusCode === 401 ? "UNAUTHORIZED" : statusCode === 400 ? "BAD_REQUEST" : statusCode === 403 ? "FORBIDDEN" : "ERROR";
      if (err instanceof Error) message = err.message;
    } else if (err instanceof AIError) {
      statusCode = err.statusCode;
      code = err.code;
      message = err.message;
      retryable = err.retryable;
    } else if (err instanceof Error) {
      const lower = err.message.toLowerCase();
      if (lower.includes("unauthorized")) {
        statusCode = 401;
        code = "UNAUTHORIZED";
        message = err.message;
      } else if (lower.includes("forbidden") || lower.includes("missing required")) {
        statusCode = 403;
        code = "FORBIDDEN";
        message = err.message;
      }
    }

    const envelope: ServiceEnvelope<never> = {
      success: false,
      error: {
        code,
        message,
        statusCode,
        retryable,
      },
      meta: {
        version: "v1",
        traceId: tid,
        correlationId: options.correlationId || `cor_${now}`,
        workspaceId: options.workspaceId,
        durationMs,
        timestamp: now,
      },
    };

    return NextResponse.json(envelope, { status: statusCode });
  }
}
