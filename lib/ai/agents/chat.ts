/**
 * Unified Chat Agent (ChatAgent)
 *
 * Orchestrates multi-turn conversational reasoning, tool calling, and self-correction.
 * Features:
 * - Dynamic tool resolution via ToolRegistry
 * - ReAct observation & iterative reasoning loop
 * - Vision and multimodal context management
 * - Bounded loop governance (maxIterations) with step telemetry
 */

import type { AgentContext, AgentResult } from "../core/types";
import { defaultToolRegistry } from "../core/registry";
import { callAI, isConfigured, ChatMessage, buildMultimodalContent } from "../openrouter";
import { AI_TOOLS } from "../tools";

/* ── 1. Type Contracts ────────────────────────────────────────── */

export interface Attachment {
  type: "image" | "video" | "file";
  name: string;
  mime?: string;
  content?: string;
  dataUrl?: string;
}

export interface InputMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatAgentInput {
  messages: InputMessage[];
  systemPrompt: string;
  attachments?: Attachment[];
  model?: string;
  temperature?: number;
  maxIterations?: number;
}

export interface ToolExecutionStep {
  toolName: string;
  args: Record<string, any>;
  result: any;
  latencyMs: number;
}

export interface ChatAgentOutput {
  content: string;
  model?: string;
  steps: ToolExecutionStep[];
  iterations: number;
}

/* ── 2. Fallback Response Generator ───────────────────────────── */

function generateFallbackResponse(input: ChatAgentInput): ChatAgentOutput {
  const lastUser = [...input.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const topic = lastUser.slice(0, 80).trim() || "your idea";

  const content = [
    `Here is a first draft on "${topic}":`,
    "",
    `"Everyone told me ${topic} was a solved problem. It isn't — and here's the 3-minute breakdown of what actually works:"`,
    "",
    "• Key Insight 1: The hidden tension nobody is addressing",
    "• Key Insight 2: The tactical shift that produces immediate results",
    "• Key Insight 3: Concrete action plan for this week",
    "",
    "Would you like me to adapt this as an X thread, a LinkedIn post, or a short-form video script?",
  ].join("\n");

  return {
    content,
    model: input.model || "fallback-mock",
    steps: [],
    iterations: 0,
  };
}

/* ── 3. Unified Chat Agent Class ──────────────────────────────── */

export class ChatAgent {
  public static async execute(
    input: ChatAgentInput,
    context: AgentContext
  ): Promise<AgentResult<ChatAgentOutput>> {
    const startTime = Date.now();
    const {
      messages,
      systemPrompt,
      attachments = [],
      model,
      temperature = 0.7,
      maxIterations = 4,
    } = input;

    // 1. Dev / offline fallback
    if (!isConfigured()) {
      return {
        success: true,
        data: generateFallbackResponse(input),
        metadata: { latencyMs: Date.now() - startTime },
      };
    }

    // 2. Assemble system and user messages
    const aiMessages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

    for (const msg of messages) {
      if (msg.role === "system") continue;
      aiMessages.push({ role: msg.role, content: msg.content });
    }

    // 3. Process multimodal attachments
    const imageDataUrls: string[] = [];
    const attachmentLines: string[] = [];

    for (const a of attachments) {
      if (a.type === "image" && a.dataUrl) {
        imageDataUrls.push(a.dataUrl);
        attachmentLines.push(`Image: "${a.name}" — visual anchor.`);
      } else if (a.type === "video") {
        attachmentLines.push(`Video: "${a.name}" (${a.mime || "video"}).`);
      } else if (a.type === "file" && a.content) {
        attachmentLines.push(`File "${a.name}" contents:\n${a.content.slice(0, 6000)}`);
      }
    }

    if (imageDataUrls.length > 0) {
      const lastUserMsg = [...aiMessages].reverse().find((m) => m.role === "user");
      if (lastUserMsg) {
        const textContent = typeof lastUserMsg.content === "string"
          ? lastUserMsg.content
          : lastUserMsg.content.map((p) => (p.type === "text" ? p.text : "")).join("");

        const fullText = attachmentLines.length
          ? `${textContent}\n\n--- User Attachments ---\n${attachmentLines.join("\n")}`
          : textContent;

        lastUserMsg.content = buildMultimodalContent(fullText, imageDataUrls);
      }
    } else if (attachmentLines.length > 0) {
      const lastUserMsg = [...aiMessages].reverse().find((m) => m.role === "user");
      if (lastUserMsg && typeof lastUserMsg.content === "string") {
        lastUserMsg.content = `${lastUserMsg.content}\n\n--- User Attachments ---\n${attachmentLines.join("\n")}`;
      }
    }

    // 4. ReAct Reasoning & Tool Execution Loop
    let iterations = 0;
    let finalContent = "";
    let finalModel = model;
    const executedSteps: ToolExecutionStep[] = [];

    // Get available tool schemas from ToolRegistry
    const registeredDefinitions = defaultToolRegistry.getDefinitions();
    const toolsToUse = registeredDefinitions.length > 0 ? registeredDefinitions : AI_TOOLS;

    while (iterations < maxIterations) {
      iterations++;

      const res = await callAI(aiMessages, {
        agent: "chat",
        model,
        temperature,
        tools: toolsToUse,
      });

      finalModel = res.model;

      if (res.tool_calls && res.tool_calls.length > 0) {
        const toolCall = res.tool_calls[0];
        const name = toolCall.function?.name;
        let args: Record<string, any> = {};

        try {
          args = toolCall.function?.arguments ? JSON.parse(toolCall.function.arguments) : {};
        } catch {
          args = {};
        }

        // Record assistant tool intent
        aiMessages.push({
          role: "assistant",
          content: `[Calling tool: ${name} with arguments: ${JSON.stringify(args)}]`,
        });

        // Execute tool via ToolRegistry with telemetry
        const stepStart = Date.now();
        let toolOutputString = "";
        let toolRawResult: any = null;

        if (defaultToolRegistry.has(name)) {
          const execRes = await defaultToolRegistry.execute(name, args, context);
          toolRawResult = execRes.data || execRes.error;
          if (execRes.success && execRes.data) {
            toolOutputString = typeof execRes.data === "string" ? execRes.data : JSON.stringify(execRes.data);
          } else {
            toolOutputString = `Tool execution error: ${execRes.error?.message || "Unknown error"}`;
          }
        } else {
          toolOutputString = `Tool '${name}' is not registered in ToolRegistry.`;
        }

        executedSteps.push({
          toolName: name,
          args,
          result: toolRawResult,
          latencyMs: Date.now() - stepStart,
        });

        // Feed observation back to model
        aiMessages.push({
          role: "system",
          content: `Tool '${name}' observation: ${toolOutputString}`,
        });
      } else {
        // Model provided final answer
        finalContent = res.content;
        break;
      }
    }

    if (!finalContent && iterations >= maxIterations) {
      finalContent = "I completed several analysis steps and reached my maximum reasoning limit. Here is what I found so far based on my analysis.";
    }

    return {
      success: true,
      data: {
        content: finalContent,
        model: finalModel,
        steps: executedSteps,
        iterations,
      },
      metadata: {
        latencyMs: Date.now() - startTime,
      },
    };
  }
}
