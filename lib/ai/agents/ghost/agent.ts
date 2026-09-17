/**
 * Unified Ghost Agent (GhostAgent)
 *
 * Autonomous social triage and engagement orchestrator with Memory Intelligence:
 * 1. receive(input): Ingests social comments, DMs, or webhook payloads
 * 2. loadContext(): Resolves workspace Brand Intelligence, rules, and past decisions
 * 3. classifyAndReason(): Uses LLM + ToolRegistry to evaluate message intent
 * 4. evaluatePolicy(): Evaluates decision with GhostPolicyEngine (Assist vs Auto, thresholds)
 * 5. brandCompliance(): Ensures generated auto-replies satisfy brand guardrails
 * 6. executeOrQueue(): Dispatches reply if permitted, logs audit trail to agent_actions
 */

import { z } from "zod";
import type { AgentContext, AgentResult } from "../../core/types";
import { callAI, isConfigured } from "../../openrouter";
import { defaultToolRegistry } from "../../tools/index";
import { dispatchReply } from "../../../social/dispatch";
import {
  BrandIntelligenceLoader,
  MemoryRetrievalEngine,
} from "../../memory";
import {
  GhostDecision,
  GhostDecisionSchema,
  GhostEvaluation,
  GhostInput,
} from "./types";
import { GhostPolicyEngine } from "./policy";

/* -- 1. Fallback Heuristic Classifier (Offline / Mock / Safety) - */

function evaluateFallback(
  input: GhostInput
): GhostDecision {
  const lower = input.message.toLowerCase().trim();

  const isLead =
    lower.includes("how much") ||
    lower.includes("price") ||
    lower.includes("pricing") ||
    lower.includes("cost") ||
    lower.includes("work with") ||
    lower.includes("hire") ||
    lower.includes("quote") ||
    lower.includes("services");

  const isComplaint =
    lower.includes("failed") ||
    lower.includes("broken") ||
    lower.includes("not working") ||
    lower.includes("problem") ||
    lower.includes("issue") ||
    lower.includes("scam") ||
    lower.includes("refund") ||
    lower.includes("terrible");

  const isFluff =
    /^[🔥❤️😍🙌👏✨💯👍🤝🎉\s]+$/u.test(lower) ||
    lower.includes("great post") ||
    lower.includes("amazing") ||
    lower.includes("love this") ||
    lower.includes("keep it up") ||
    lower.includes("nice one") ||
    lower.includes("fire");

  if (isLead) {
    return {
      action: "flag_lead",
      confidence: 90,
      reasoning: "Inquiry expresses buying intent or asks about pricing/collaboration.",
      isLead: true,
      riskLevel: "low",
      suggestedTags: ["lead", "pricing"],
    };
  }

  if (isComplaint) {
    return {
      action: "escalate_complaint",
      confidence: 85,
      reasoning: "Message indicates an issue or dissatisfaction requiring human attention.",
      isLead: false,
      riskLevel: "high",
      suggestedTags: ["complaint", "support"],
    };
  }

  if (isFluff) {
    return {
      action: "auto_reply",
      confidence: 92,
      reasoning: "Positive social sentiment; suitable for standard brand engagement.",
      reply: "Thank you so much for the support! Really appreciate you being here 🙌",
      isLead: false,
      riskLevel: "low",
      suggestedTags: ["engagement"],
    };
  }

  return {
    action: "auto_reply",
    confidence: 75,
    reasoning: "General social inquiry; auto-reply generated.",
    reply: "Thanks for reaching out! Let us know if you have any questions 👇",
    isLead: false,
    riskLevel: "low",
    suggestedTags: ["general"],
  };
}

/* -- 2. Unified Ghost Agent Class ------------------------------- */

export class GhostAgent {
  /**
   * Main entry point: Evaluates an incoming interaction, enforces memory & policy,
   * logs the decision, and conditionally dispatches.
   */
  public static async evaluate(
    input: GhostInput,
    context: AgentContext
  ): Promise<AgentResult<GhostEvaluation>> {
    const startTime = Date.now();
    const {
      message,
      senderName = "User",
      senderId,
      platform = "social",
      isComment = false,
      commentId,
      rules = [],
      brandVoice,
      botId,
      accountToken,
    } = input;

    // 1. Retrieve Workspace Memory & Brand Intelligence
    const memoryBundle = await MemoryRetrievalEngine.retrieveContext(
      message,
      context,
      { platform, maxMemories: 3 }
    );

    const activeRules = rules.filter((r) => r.enabled).map((r) => r.label);

    let decision: GhostDecision;
    let modelUsed = "heuristic-fallback";

    // 2. LLM Classification or Heuristic Fallback
    if (!isConfigured()) {
      decision = evaluateFallback(input);
    } else {
      try {
        const systemPrompt = `You are 'Ghost Mode', an autonomous social media AI assistant for a creator/business.
Your job is to analyze an incoming ${isComment ? "comment" : "direct message"} on ${platform} from "${senderName}" and decide how to triage it.

${memoryBundle.formattedSystemContext}

ACTIVE TRIAGE RULES:
${
  activeRules.length > 0
    ? activeRules.map((r, i) => `${i + 1}. ${r}`).join("\n")
    : "1. Auto-reply to polite engagement and general compliments.\n2. Flag inquiries asking for pricing, booking, or hiring as leads.\n3. Escalate complaints, bugs, or refund requests."
}

INSTRUCTIONS:
1. Classify the message strictly into one of:
   - "auto_reply": For friendly compliments, routine questions, or standard engagement.
   - "flag_lead": For prospective buyers, pricing inquiries, or partnership offers.
   - "escalate_complaint": For dissatisfied users, technical problems, or complaints.
   - "ignore": For spam, promotional link dumps, or irrelevant noise.
2. If "auto_reply", write a friendly reply matching the Brand Voice in under 2 sentences. Strictly avoid forbidden guardrail terms.
3. If "flag_lead" or "escalate_complaint", omit the reply.
4. Output strictly valid JSON.

JSON SCHEMA:
{
  "action": "auto_reply" | "flag_lead" | "escalate_complaint" | "ignore",
  "confidence": number (0-100),
  "reasoning": string,
  "reply": string (optional, for auto_reply),
  "is_lead": boolean,
  "risk_level": "low" | "medium" | "high" | "critical"
}`;

        const res = await callAI(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: `INCOMING ${isComment ? "COMMENT" : "DM"}:\n"${message}"` },
          ],
          {
            agent: "ghost",
            temperature: 0.3,
            jsonMode: true,
          }
        );

        modelUsed = res.model || "openrouter";

        let clean = res.content.trim();
        if (clean.startsWith("```json")) clean = clean.replace(/```json/g, "").replace(/```/g, "").trim();
        if (clean.startsWith("```")) clean = clean.replace(/```/g, "").trim();
        const parsed = JSON.parse(clean);

        const action = ["auto_reply", "flag_lead", "escalate_complaint", "ignore"].includes(parsed.action)
          ? parsed.action
          : "auto_reply";

        const riskLevel = ["low", "medium", "high", "critical"].includes(parsed.risk_level)
          ? parsed.risk_level
          : "low";

        decision = GhostDecisionSchema.parse({
          action,
          confidence: Math.min(100, Math.max(0, Number(parsed.confidence ?? 80))),
          reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "Triage based on active rules.",
          reply: action === "auto_reply" && typeof parsed.reply === "string" ? parsed.reply : undefined,
          isLead: Boolean(parsed.is_lead || action === "flag_lead"),
          riskLevel,
          suggestedTags: Array.isArray(parsed.suggested_tags) ? parsed.suggested_tags : [],
        });
      } catch (err) {
        console.warn("[GhostAgent] LLM parsing failed, falling back to heuristics:", err);
        decision = evaluateFallback(input);
      }
    }

    // 3. Brand Compliance Verification on Auto-Reply
    if (decision.reply) {
      const compliance = BrandIntelligenceLoader.checkCompliance(decision.reply, memoryBundle.brand);
      if (!compliance.compliant) {
        decision.riskLevel = "high";
        decision.reasoning += ` [Compliance note: contains restricted wording]`;
      }
    }

    // 4. Deterministic Policy Evaluation (Assist vs Auto, safety gating)
    const policy = GhostPolicyEngine.evaluate(decision, input, context);

    // 5. Execution / Dispatch if permitted by policy
    let dispatched = false;
    if (policy.canDispatchImmediately && decision.reply && accountToken && senderId) {
      dispatched = await dispatchReply({
        platform,
        recipientId: senderId,
        token: accountToken,
        message: decision.reply,
        isComment,
        commentId,
      });
    }

    // 6. Record Audit Log in agent_actions
    const actionId = await this.persistAuditLog(context, input, decision, policy, dispatched, botId);

    const evaluation: GhostEvaluation = {
      ...decision,
      policy,
      dispatched,
      actionId,
    };

    return {
      success: true,
      data: evaluation,
      metadata: {
        model: modelUsed,
        latencyMs: Date.now() - startTime,
      },
    };
  }

  /**
   * Run ReAct tool enrichment using the ToolRegistry.
   */
  public static async executeTool(
    toolName: string,
    params: unknown,
    context: AgentContext
  ): Promise<AgentResult<unknown>> {
    return defaultToolRegistry.execute(toolName, params, context);
  }

  /**
   * Persist agent decision in database audit logs (agent_actions).
   */
  private static async persistAuditLog(
    context: AgentContext,
    input: GhostInput,
    decision: GhostDecision,
    policy: GhostEvaluation["policy"],
    dispatched: boolean,
    botId?: string
  ): Promise<string | undefined> {
    if (!context.supabase || !context.workspaceId) return undefined;

    try {
      const { data, error } = await context.supabase
        .from("agent_actions")
        .insert({
          user_id: context.workspaceId,
          bot_id: botId || null,
          comment: input.message,
          action: decision.action,
          reply: decision.reply || null,
          platform: input.platform || "unknown",
          reason: decision.reasoning,
          approved: dispatched ? true : policy.requiresHumanApproval ? null : true,
          approved_at: dispatched ? new Date().toISOString() : null,
        })
        .select("id")
        .single();

      if (error) {
        console.warn("[GhostAgent] Could not persist agent_actions log:", error.message);
        return undefined;
      }
      return data?.id;
    } catch (logErr) {
      console.warn("[GhostAgent] Exception persisting audit log:", logErr);
      return undefined;
    }
  }
}
