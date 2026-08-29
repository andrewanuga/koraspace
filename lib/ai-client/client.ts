/**
 * Typed Platform AI Client
 *
 * Official TypeScript client consumed by Core Platform server environments
 * (Server Components, Server Actions, Route Handlers, Background Queues) to interact
 * with the Koraspace AI Intelligence Service:
 * - Automatically signs HMAC request headers and propagates correlation IDs
 * - Unpacks versioned `ServiceEnvelope<T>` responses
 * - STRICT SECURITY: Throws immediately if instantiated in a browser context
 */

import { ServiceAuthEngine } from "../ai/core/service-auth";
import type { ServiceEnvelope } from "../ai/core/service-envelope";
import type {
  V1ChatRequest,
  V1ChatResponse,
  V1GhostEvaluateRequest,
  V1GhostEvaluateResponse,
  V1ContentGenerateRequest,
  V1MemorySearchRequest,
} from "../ai/contracts/v1";
import type { ContentIntelligenceResult } from "../ai/content/types";
import type { SemanticMemory } from "../ai/memory/types";

export interface AIClientOptions {
  baseUrl?: string;
  userId?: string;
  timeoutMs?: number;
}

export class KoraspaceAIClient {
  private readonly baseUrl: string;
  private readonly defaultUserId: string;
  private readonly timeoutMs: number;

  constructor(options: AIClientOptions = {}) {
    // Strict Server-Side Security Invariant
    if (typeof window !== "undefined") {
      throw new Error(
        "Security Error: KoraspaceAIClient contains service authentication secrets and must only be executed in server environments (Node.js/Edge Server Actions)."
      );
    }

    this.baseUrl = options.baseUrl || process.env.AI_SERVICE_URL || "http://localhost:3000";
    this.defaultUserId = options.userId || "system";
    this.timeoutMs = options.timeoutMs || 30000;
  }

  /**
   * Internal HTTP POST helper that signs headers and handles envelopes.
   */
  private async post<T>(
    endpoint: string,
    payload: any,
    workspaceId: string,
    userId?: string,
    correlationId?: string
  ): Promise<T> {
    const headers = ServiceAuthEngine.signOutboundHeaders(
      workspaceId,
      userId || this.defaultUserId,
      correlationId
    );

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const envelope: ServiceEnvelope<T> = await res.json();

      if (!envelope.success || envelope.error) {
        throw new Error(
          envelope.error?.message || `AI Service request failed with status ${res.status}`
        );
      }

      return envelope.data as T;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Executes multi-step ReAct reasoning with tools.
   */
  public async chat(
    request: V1ChatRequest,
    options: { userId?: string; correlationId?: string } = {}
  ): Promise<V1ChatResponse> {
    return this.post<V1ChatResponse>(
      "/api/v1/ai/chat",
      request,
      request.workspaceId,
      options.userId,
      options.correlationId
    );
  }

  /**
   * Evaluates incoming social interactions and applies deterministic safety policies.
   */
  public async evaluateGhost(
    request: V1GhostEvaluateRequest,
    options: { userId?: string; correlationId?: string } = {}
  ): Promise<V1GhostEvaluateResponse> {
    return this.post<V1GhostEvaluateResponse>(
      "/api/v1/ai/ghost/evaluate",
      request,
      request.workspaceId,
      options.userId,
      options.correlationId
    );
  }

  /**
   * Generates multi-platform tailored social content and repurposes across channels.
   */
  public async generateContent(
    request: V1ContentGenerateRequest,
    options: { userId?: string; correlationId?: string } = {}
  ): Promise<ContentIntelligenceResult> {
    return this.post<ContentIntelligenceResult>(
      "/api/v1/ai/content/generate",
      request,
      request.workspaceId,
      options.userId,
      options.correlationId
    );
  }

  /**
   * Searches workspace persistent memory via vector and lexical RAG retrieval.
   */
  public async searchMemory(
    request: V1MemorySearchRequest,
    options: { userId?: string; correlationId?: string } = {}
  ): Promise<SemanticMemory[]> {
    return this.post<SemanticMemory[]>(
      "/api/v1/ai/memory/search",
      request,
      request.workspaceId,
      options.userId,
      options.correlationId
    );
  }
}
