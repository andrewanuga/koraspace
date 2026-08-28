/**
 * AI Engine Adapter (Ghost Mode)
 *
 * Provides backward-compatible bridge to the Unified GhostAgent.
 */

import { GhostAgent, GhostActionType, GhostEvaluation } from "./agents/ghost";
import type { AgentContext } from "./core/types";

export type AgentActionType = GhostActionType;

export interface EvaluationResult {
  action: AgentActionType;
  comment: string;
  reply?: string;
  is_lead?: boolean;
}

/**
 * Evaluates an incoming message based on the user's Ghost Mode rules.
 * Delegates to Unified GhostAgent.
 */
export async function evaluateIncomingMessage(
  incomingText: string,
  platform: string,
  senderName: string,
  rules: { label: string; enabled: boolean }[],
  isComment: boolean = false,
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
}

export { GhostAgent };
