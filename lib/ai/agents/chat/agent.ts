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
import { AI_TOOLS } from "../../tools";
import {
  BrandIntelligenceLoader,
  MemoryFormationEngine,
  MemoryRetrievalEngine,
  type BrandComplianceReport,
  type BrandIntelligence,
} from "../../memory";
import type {
  AgentStep,
  ChatAgentInput,
  ChatAgentOutput,
  ToolInvocation,
} from "./types";
import { ChatPlanner } from "./planner";
import { ChatExecutor } from "./executor";

/* -- 1. Fallback Response Generator ----------------------------- */

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
    `"Everyone thinks ${topic} is complicated. It isn't - here is the 3-minute breakdown of what actually works:"`,
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

/* -- 2. Unified Chat Agent Class -------------------------------- */

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
    const memoryBundle = await MemoryRetrievalEngine.retrieveContext(
      lastUserText,
      context
    );

    // 2. Dev / offline fallback
    if (!isConfigured()) {
      return {
        success: true,
        data: generateFallbackResponse(input, memoryBundle.brand),
        metadata: { latencyMs: Date.now() - startTime },
      };
    }

    // 3. Planning and Intent Decomposition
    const plan = ChatPlanner.plan(messages);
    const steps: AgentStep[] = [];

    // 4. Construct System Prompt with Memory Context
    const baseSystem = userSystemPrompt || "You are Koraspace AI, an elite autonomous social media agent.";
    const consolidatedSystemPrompt = [
      baseSystem,
      "",
      memoryBundle.formattedSystemContext,
    ].join("\n\n");

    // 5. Assemble system and user messages
    const aiMessages: ChatMessage[] = [{ role: "system", content: consolidatedSystemPrompt }];

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
        attachmentLines.push(`Image: "${a.name}" - visual anchor.`);
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
    const registeredDefinitions = defaultToolRegistry.getDefinitions();
    const toolsToUse = registeredDefinitions.length > 0 ? registeredDefinitions : AI_TOOLS;

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
          context
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

    // 9. Self-Correction & Virality Check
    if (requireSelfCorrection && finalContent && finalContent.length > 40) {
      const viralityCheck = await defaultToolRegistry.execute(
        "evaluate_virality",
        { content: finalContent, platform: "x" },
        context
      );

      if (viralityCheck.success && viralityCheck.data) {
        const score = (viralityCheck.data as any).overallScore ?? 100;
        if (score < 65) {
          selfCorrected = true;
          steps.push({
            stepIndex: ++iterations,
            type: "self_correction",
            thought: `Initial draft scored ${score}/100 in virality. Refining hook and pacing.`,
            timestamp: Date.now(),
          });

          const refinementRes = await callAI(
            [
              ...aiMessages,
              { role: "assistant", content: finalContent },
              {
                role: "system",
                content: `Self-Correction Trigger: The draft scored ${score}/100 in engagement probability. Weaknesses: ${JSON.stringify(
                  (viralityCheck.data as any).breakdown
                )}. Rewrite to maximize retention, clarity, and authority. Return only the revised draft.`,
              },
            ],
            { agent: "chat", model, temperature: 0.5 }
          );

          if (refinementRes.content) {
            finalContent = refinementRes.content;
          }
        }
      }
    }

    // 10. Brand Compliance Guardrail Verification
    const compliance = BrandIntelligenceLoader.checkCompliance(finalContent, memoryBundle.brand);
    if (!compliance.compliant && compliance.violations.length > 0 && finalContent.length > 20) {
      steps.push({
        stepIndex: ++iterations,
        type: "self_correction",
        thought: `Brand compliance violation detected: ${compliance.violations.join(", ")}. Sanitizing output.`,
        timestamp: Date.now(),
      });

      const complianceFixRes = await callAI(
        [
          ...aiMessages,
          { role: "assistant", content: finalContent },
          {
            role: "system",
            content: `Compliance Guardrail Trigger: The draft violated brand rules (${compliance.violations.join(
              ", "
            )}). Rewrite the text to strictly remove all forbidden terms and maintain high compliance. Return only the sanitized content.`,
          },
        ],
        { agent: "chat", model, temperature: 0.3 }
      );

      if (complianceFixRes.content) {
        finalContent = complianceFixRes.content;
      }
    }

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
   * Helper to execute a specific tool directly through the registry.
   */
  public static async executeTool(
    toolName: string,
    params: unknown,
    context: AgentContext
  ): Promise<AgentResult<unknown>> {
    return defaultToolRegistry.execute(toolName, params, context);
  }
}
