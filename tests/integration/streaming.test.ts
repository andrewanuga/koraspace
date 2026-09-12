import { describe, it, expect } from "vitest";
import { AIStreamTransformer, type StreamEventChunk } from "@/lib/ai/core/streaming";

describe("AI Streaming Protocol & Token Aggregation", () => {
  it("should format typed SSE data correctly", () => {
    const chunk: StreamEventChunk = {
      type: "token",
      content: "Hello",
      traceId: "trc_stream_1",
    };

    const sseString = AIStreamTransformer.formatSSE(chunk);
    expect(sseString).toBe(`data: ${JSON.stringify(chunk)}\n\n`);
  });

  it("should stream tokens, compute total usage, and emit done event", async () => {
    const eventsReceived: StreamEventChunk[] = [];
    const decoder = new TextDecoder();

    const stream = AIStreamTransformer.createStream(async (send) => {
      send({ type: "token", content: "AI " });
      send({ type: "token", content: "Workflow " });
      send({ type: "token", content: "Automation." });
    });

    const reader = stream.getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const rawText = decoder.decode(value);
      const lines = rawText.split("\n").filter((l) => l.startsWith("data: "));
      for (const line of lines) {
        const json = JSON.parse(line.replace("data: ", ""));
        eventsReceived.push(json);
      }
    }

    expect(eventsReceived.length).toBe(4); // 3 tokens + 1 done
    expect(eventsReceived[0].content).toBe("AI ");
    expect(eventsReceived[3].type).toBe("done");
    expect(eventsReceived[3].usage?.totalTokens).toBeGreaterThan(0);
  });
});
