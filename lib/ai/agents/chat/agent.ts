/**
 * Unified Chat Agent (ChatAgent)
 *
 * Central reasoning, memory retrieval, and execution orchestrator for Koraspace AI:
 * - Injects persistent Brand Intelligence, Semantic Memory, and Performance Analytics
 * - Formulates execution plans via ChatPlanner
 * - ReAct multi-step tool reasoning with ToolRegistry
 * - Bounded loop governance with step-level telemetry
 * - Integrated self-correction & virality refinement loops
 * - Deterministic brand compliance guardrail checks (forbidden terms)
 * - Automatic Memory Formation from user instructions
 */

import type { AgentContext, AgentResult } from "../../core/types";
import { defaultToolRegistry } from "../../tools/index";
import { callAI, isConfigured, ChatMessage, buildMultimodalContent } from "../../openrouter";
import {
  BrandIntelligenceLoader,
  MemoryFormationEngine,
  type BrandComplianceReport,
  type BrandIntelligence,
} from "../../memory";
import { ContextEngine } from "../../context/engine";
import type {
  AgentStep,
  ChatAgentInput,
  ChatAgentOutput,
  ChatPlan,
  ToolInvocation,
} from "./types";
import { ChatPlanner } from "./planner";
import { ChatExecutor } from "./executor";
import { ChatEvaluator } from "./evaluator";

/* ── 1. Fallback Response Generator ───────────────────────────── */

function generateFallbackResponse(
  input: ChatAgentInput,
  brand?: BrandIntelligence
): ChatAgentOutput {
  const lastUser = [...input.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const topic = lastUser.slice(0, 80).trim() || "your idea";
  const brandName = brand?.brandName || "Koraspace";

  const content = [
    `Here is a ready-to-post draft on "${topic}":`,
    "",
    `"Everyone thinks ${topic} is complicated. It isn't — here is the 3-minute breakdown of what actually works:"`,
    "",
    "1. The hidden leverage point most people ignore",
    "2. The tactical shift that delivers immediate traction",
    "3. Step-by-step action plan you can deploy today",
    "",
    `What platform are we posting this to for ${brandName}? (X thread, LinkedIn, or Instagram caption?)`
  ].join("\n");

  return {
    content,
    model: input.model || "fallback-mock",
    plan: ChatPlanner.plan(input.messages),
    steps: [],
    iterations: 0,
    selfCorrected: false,
  };
}

/* ── 2. Unified Chat Agent Class ──────────────────────────────── */

export class ChatAgent {
  /**
   * Main entry point: Executes multi-turn reasoning, memory retrieval,
   * tool orchestration, and brand compliance verification.
   */
  public static async execute(
    input: ChatAgentInput,
    context: AgentContext
  ): Promise<AgentResult<ChatAgentOutput>> {
    const startTime = Date.now();
    const {
      messages,
      systemPrompt: userSystemPrompt,
      attachments = [],
      model,
      temperature = 0.7,
      maxIterations = 6,
      requireSelfCorrection = false,
    } = input;

    const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    // 1. Contextual Memory Retrieval (Brand, Semantic, Performance)
    const contextRequest = {
        workspaceId: context.workspaceId,
        userId: context.userId,
        chatId: context.chatId,
        messages: input.messages,
        attachments,
        model: model,
        supabase: context.supabase,
        capabilities: context.capabilities,
        // other optional fields can be added as needed
      } as any; // ContextRequest type
      const engine = new ContextEngine();
      const assembly = await engine.assemble(contextRequest);
      // Load brand directly for compliance checks
      const brand = await BrandIntelligenceLoader.load(context.workspaceId, context.supabase);

    // 2. Dev / offline fallback
    if (!isConfigured()) {
        return {
          success: true,
          data: generateFallbackResponse(input, undefined),
          metadata: { latencyMs: Date.now() - startTime },
        };
      }

    // 3. Planning and Intent Decomposition
    const plan = ChatPlanner.plan(messages);
    const steps: AgentStep[] = [];

    // 4. Construct System Prompt with ContextEngine output
    const baseSystem = userSystemPrompt || "You are Koraspace AI, an elite autonomous social media agent.";
    const systemPrompt = [
      baseSystem,
      "",
      assembly.systemPrompt,
    ].join("\n\n");

    // 5. Assemble system and user messages
    const aiMessages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

    for (const msg of messages) {
      if (msg.role === "system") continue;
      aiMessages.push({ role: msg.role, content: msg.content });
    }

    // 6. Multimodal context processing
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

    // 7. Tool Definitions from ToolRegistry
    const toolsToUse = defaultToolRegistry.getDefinitions();

    // 8. ReAct Reasoning Loop
    let iterations = 0;
    let finalContent = "";
    let finalModel = model;
    let selfCorrected = false;

    while (iterations < maxIterations) {
      iterations++;

      const res = await callAI(aiMessages, {
        agent: "chat",
        model,
        temperature,
        tools: toolsToUse,
      });

      finalModel = res.model || finalModel;

      // Check for tool calls
      if (res.tool_calls && res.tool_calls.length > 0) {
        const toolCall = res.tool_calls[0];
        const toolName = toolCall.function?.name;
        let args: Record<string, any> = {};

        try {
          args = toolCall.function?.arguments ? JSON.parse(toolCall.function.arguments) : {};
        } catch {
          args = {};
        }

        const invocation: ToolInvocation = {
          id: toolCall.id,
          toolName,
          args,
          timestamp: Date.now(),
        };

        // Record thought / intent step
        steps.push({
          stepIndex: iterations,
          type: "tool_call",
          thought: `Calling tool "${toolName}"`,
          toolInvocation: invocation,
          timestamp: Date.now(),
        });

        // Record assistant tool intent into conversation
        aiMessages.push({
          role: "assistant",
          content: `[Tool Call: ${toolName} with args: ${JSON.stringify(args)}]`,
        });

        // Execute tool through ChatExecutor
        const { step: observationStep, observationText } = await ChatExecutor.executeTool(
          iterations,
          invocation,
          context,
          plan
        );

        steps.push(observationStep);

        // Feed observation back to model
        aiMessages.push({
          role: "system",
          content: `Observation from tool "${toolName}":\n${observationText}`,
        });
      } else {
        // Model returned final content
        finalContent = res.content;
        steps.push({
          stepIndex: iterations,
          type: "final_answer",
          thought: "Formulated final response.",
          timestamp: Date.now(),
        });
        break;
      }
    }

    // 9. Evaluation & Self-Correction Guardrail Pipeline
    const evalResult = await ChatEvaluator.evaluateAndRefine(
      finalContent,
      brand,
      context,
      {
        aiMessages,
        model,
        requireSelfCorrection,
        startingIteration: iterations,
      }
    );

    finalContent = evalResult.content;
    selfCorrected = evalResult.selfCorrected;
    iterations = evalResult.finalIterations;
    steps.push(...evalResult.steps);

    if (!finalContent && iterations >= maxIterations) {
      finalContent = "I completed multi-step analysis and reached the iteration limit. Here is the synthesized output based on observations gathered.";
    }

    // 11. Background Memory Formation (learn new rules, preferences, facts)
    if (lastUserText && context.workspaceId) {
      MemoryFormationEngine.processAndFormMemory(
        lastUserText,
        context.workspaceId,
        context.supabase
      ).catch((mErr) => {
        console.warn("[ChatAgent] Non-blocking memory formation error:", mErr);
      });
    }

    return {
      success: true,
      data: {
        content: finalContent,
        model: finalModel,
        plan,
        steps,
        iterations,
        selfCorrected,
      },
      metadata: {
        model: finalModel,
        latencyMs: Date.now() - startTime,
      },
    };
  }

  /**
   * Helper to execute a specific tool through the policy-governed ChatExecutor.
   * Requires a validated ChatPlan.
   */
  public static async executeTool(
    toolName: string,
    params: unknown,
    context: AgentContext,
    plan: ChatPlan
  ): Promise<AgentResult<unknown>> {
    const args = (typeof params === "object" && params !== null
      ? (params as Record<string, unknown>)
      : {}) as ToolInvocation["args"];

    const invocation: ToolInvocation = {
      toolName,
      args,
      timestamp: Date.now(),
    };

    const { step, observationText } = await ChatExecutor.executeTool(
      1,
      invocation,
      context,
      plan
    );

    if (step.observation?.success) {
      return {
        success: true,
        data: step.observation.output,
        metadata: { latencyMs: step.observation.latencyMs },
      };
    }

    return {
      success: false,
      error: {
        code: "TOOL_EXECUTION_FAILED",
        message: step.observation?.error || observationText,
      },
      metadata: { latencyMs: step.observation?.latencyMs ?? 0 },
    };
  }
}
