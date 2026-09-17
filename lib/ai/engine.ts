<<<<<<< HEAD
/**
 * AI Engine Adapter (Ghost Mode)
 *
 * Provides backward-compatible bridge to the Unified GhostAgent.
 */
=======
import { callAI, type ChatMessage } from "./gemini";
import { buildGhostSystemPrompt } from "./prompts";
>>>>>>> main

import { GhostAgent, type GhostActionType } from "./agents/ghost";
import type { AgentContext } from "./core/types";

export type AgentActionType = GhostActionType;

export interface EvaluationResult {
  action: AgentActionType;
  comment: string;
  reply?: string;
  lead_score?: number;
}

/**
<<<<<<< HEAD
 * Evaluates an incoming message based on the user's Ghost Mode rules.
 * Delegates to Unified GhostAgent.
=======
 * Evaluates an incoming message based on the user's Ghost Mode rules and Bot Role.
>>>>>>> main
 */
export async function evaluateIncomingMessage(
  incomingText: string,
  platform: string,
  senderName: string,
  rules: { label: string; enabled: boolean }[],
  isComment: boolean = false,
<<<<<<< HEAD
  context?: Partial<AgentContext>
): Promise<EvaluationResult> {
  const agentCtx: AgentContext = {
    userId: context?.userId || "system",
    workspaceId: context?.workspaceId || "system",
    autonomyMode: context?.autonomyMode || "assist",
    supabase: context?.supabase,
  };

  const res = await GhostAgent.evaluate(
    {
      message: incomingText,
      platform,
      senderName,
      rules,
      isComment,
    },
    agentCtx
  );

  if (res.success && res.data) {
    return {
      action: res.data.action,
      comment: res.data.reasoning,
      reply: res.data.reply,
      is_lead: res.data.isLead,
    };
  }

  return {
    action: "ignore",
    comment: res.error?.message || "AI evaluation error.",
  };
=======
  botRole: string = "general"
): Promise<EvaluationResult> {
  const activeRules = rules.filter(r => r.enabled).map(r => r.label);
  
  // If no specific rules, the specialized bots still have their default persona behavior,
  // but we can pass an empty array to the prompt.

  const systemPrompt = buildGhostSystemPrompt("classify", undefined, platform, botRole);
  
  const userPrompt = `
INCOMING MESSAGE:
"${incomingText}"
SENDER: ${senderName}
TYPE: ${isComment ? "comment" : "direct message"}

ACTIVE RULES (Apply these if relevant):
${activeRules.length > 0 ? activeRules.map((r, i) => `${i + 1}. ${r}`).join("\n") : "None specified."}
  `.trim();

  try {
    const res = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], {
      agent: "ghost",
      temperature: 0.2,
      jsonMode: true
    });

    let jsonStr = res.content.trim();
    if (jsonStr.startsWith("\`\`\`json")) jsonStr = jsonStr.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    if (jsonStr.startsWith("\`\`\`")) jsonStr = jsonStr.replace(/\`\`\`/g, "").trim();

    const parsed = JSON.parse(jsonStr) as EvaluationResult;
    
    // Fallback validation
    if (!["auto_reply", "flag_lead", "escalate_complaint", "ignore"].includes(parsed.action)) {
      parsed.action = "ignore";
    }

    return parsed;
  } catch (err) {
    console.error("[GhostEngine] Evaluation failed:", err);
    return { action: "ignore", comment: "AI evaluation error." };
  }
>>>>>>> main
}

export { GhostAgent };
