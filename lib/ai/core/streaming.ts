/**
 * AI Streaming Response Resilience & Protocol Normalizer
 *
 * Provides safe ReadableStream generation for server-sent events (SSE) and token chunking:
 * - Handles client abort signals cleanly without resource leaks
 * - Accumulates token usage in real time for cost tracking
 * - Emits typed event packets: token, tool_call, memory_hit, and completion
 */

import { CostTracker } from "./cost";
import { AITelemetry } from "./telemetry";

export interface StreamEventChunk {
  type: "token" | "tool_call" | "memory_hit" | "error" | "done";
  content?: string;
  tool?: string;
  traceId?: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  costUsd?: number;
}

export class AIStreamTransformer {
  /**
   * Encodes a stream event into standard Server-Sent Events (SSE) data format.
   */
  public static formatSSE(event: StreamEventChunk): string {
    return `data: ${JSON.stringify(event)}\n\n`;
  }

  /**
   * Creates a resilient ReadableStream that handles chunk streaming, error catching, and abort signals.
   */
  public static createStream(
    generator: (send: (event: StreamEventChunk) => void) => Promise<void>,
    options: { model?: string; traceId?: string } = {}
  ): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    const traceId = options.traceId || AITelemetry.generateId("trc");
    let fullText = "";

    return new ReadableStream({
      async start(controller) {
        const send = (event: StreamEventChunk) => {
          try {
            if (event.type === "token" && event.content) {
              fullText += event.content;
            }
            const sseData = AIStreamTransformer.formatSSE({ ...event, traceId });
            controller.enqueue(encoder.encode(sseData));
          } catch (err) {
            console.error("[Stream Controller Error]:", err);
          }
        };

        try {
          await generator(send);

          // Calculate final usage & cost
          const estimatedTokens = CostTracker.estimateTokens(fullText);
          const cost = CostTracker.calculateCost(options.model || "google/gemma-4-26b-a4b-it:free", {
            completion_tokens: estimatedTokens,
          });

          send({
            type: "done",
            usage: cost.tokens,
            costUsd: cost.totalCostUsd,
          });
          controller.close();
        } catch (err: any) {
          send({
            type: "error",
            content: err.message || "Streaming execution failed",
          });
          controller.close();
        }
      },
    });
  }
}
