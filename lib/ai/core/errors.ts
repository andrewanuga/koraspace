/**
 * Unified AI Error Architecture
 *
 * Provides typed, structured error classes with traceability, failure classification,
 * and retryability metadata across all agents and tools.
 */

export type AIErrorCode =
  | "LLM_PROVIDER_ERROR"
  | "LLM_TIMEOUT"
  | "LLM_MALFORMED_OUTPUT"
  | "TOOL_NOT_FOUND"
  | "TOOL_EXECUTION_FAILED"
  | "TOOL_INVALID_ARGUMENTS"
  | "TOOL_PERMISSION_DENIED"
  | "MEMORY_RETRIEVAL_FAILED"
  | "MEMORY_STORAGE_FAILED"
  | "BRAND_COMPLIANCE_VIOLATION"
  | "PROMPT_INJECTION_DETECTED"
  | "WORKSPACE_UNAUTHORIZED"
  | "RATE_LIMIT_EXCEEDED"
  | "CIRCUIT_BREAKER_OPEN"
  | "DATABASE_ERROR"
  | "VALIDATION_ERROR"
  | "INTERNAL_AGENT_ERROR";

export interface AIErrorOptions {
  message: string;
  code: AIErrorCode;
  statusCode?: number;
  retryable?: boolean;
  agent?: string;
  tool?: string;
  operation?: string;
  traceId?: string;
  cause?: unknown;
}

export class AIError extends Error {
  public readonly code: AIErrorCode;
  public readonly statusCode: number;
  public readonly retryable: boolean;
  public readonly agent?: string;
  public readonly tool?: string;
  public readonly operation?: string;
  public readonly traceId?: string;
  public readonly timestamp: number;

  constructor(options: AIErrorOptions) {
    super(options.message);
    this.name = "AIError";
    this.code = options.code;
    this.statusCode = options.statusCode ?? 500;
    this.retryable = options.retryable ?? false;
    this.agent = options.agent;
    this.tool = options.tool;
    this.operation = options.operation;
    this.traceId = options.traceId;
    this.timestamp = Date.now();
    if (options.cause) this.cause = options.cause;
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      retryable: this.retryable,
      agent: this.agent,
      tool: this.tool,
      operation: this.operation,
      traceId: this.traceId,
      timestamp: this.timestamp,
    };
  }
}

export class LLMError extends AIError {
  constructor(message: string, options: Partial<AIErrorOptions> = {}) {
    super({
      message,
      code: options.code || "LLM_PROVIDER_ERROR",
      statusCode: options.statusCode || 502,
      retryable: options.retryable ?? true,
      ...options,
    });
    this.name = "LLMError";
  }
}

export class ToolError extends AIError {
  constructor(message: string, tool: string, options: Partial<AIErrorOptions> = {}) {
    super({
      message,
      code: options.code || "TOOL_EXECUTION_FAILED",
      tool,
      statusCode: options.statusCode || 500,
      retryable: options.retryable ?? false,
      ...options,
    });
    this.name = "ToolError";
  }
}

export class MemoryError extends AIError {
  constructor(message: string, options: Partial<AIErrorOptions> = {}) {
    super({
      message,
      code: options.code || "MEMORY_RETRIEVAL_FAILED",
      statusCode: options.statusCode || 500,
      retryable: options.retryable ?? false,
      ...options,
    });
    this.name = "MemoryError";
  }
}

export class SecurityError extends AIError {
  constructor(message: string, options: Partial<AIErrorOptions> = {}) {
    super({
      message,
      code: options.code || "PROMPT_INJECTION_DETECTED",
      statusCode: options.statusCode || 403,
      retryable: false,
      ...options,
    });
    this.name = "SecurityError";
  }
}

export class RateLimitError extends AIError {
  constructor(message: string = "AI rate limit exceeded", options: Partial<AIErrorOptions> = {}) {
    super({
      message,
      code: "RATE_LIMIT_EXCEEDED",
      statusCode: 429,
      retryable: true,
      ...options,
    });
    this.name = "RateLimitError";
  }
}
