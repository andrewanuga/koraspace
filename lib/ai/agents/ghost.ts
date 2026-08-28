/**
 * Unified Ghost Agent (GhostAgent)
 *
 * Autonomous social triage and engagement agent.
 * Responsibilities:
 * - Ingests incoming DMs and comments across social platforms
 * - Classifies message intent (auto_reply, flag_lead, escalate_complaint, ignore)
 * - Applies brand voice and active workspace rules
 * - Enforces Assist vs Auto autonomy policies
 * - Coordinates audit logging and safe dispatch recommendations
 */

import { z } from "zod";
import type { AgentContext, AgentResult } from "../core/types";
import { callAI, isConfigured } from "../openrouter";

/* ── 1. Schemas & Type Contracts ──────────────────────────────── */

export const GhostActionTypeSchema = z.enum([
  "auto_reply",
  "flag_lead",
  "escalate_complaint",
  "ignore",
]);

export type GhostActionType = z.infer<typeof GhostActionTypeSchema>;

export const GhostEvaluationSchema = z.object({
  action: GhostActionTypeSchema,
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  reply: z.string().optional(),
  isLead: z.boolean().default(false),
  requiresHumanApproval: z.boolean().default(false),
  canDispatchImmediately: z.boolean().default(false),
});

export type GhostEvaluation = z.infer<typeof GhostEvaluationSchema>;

export interface GhostRule {
  label: string;
  enabled: boolean;
}

export interface GhostAgentInput {
  message: string;
  senderName?: string;
  platform?: string;
  isComment?: boolean;
  rules?: GhostRule[];
  brandVoice?: string;
  botId?: string;
}

/* ── 2. Fallback / Deterministic Rule Evaluator ─────────────────── */

function evaluateFallback(
  input: GhostAgentInput,
  autonomyMode: "assist" | "auto" = "assist"
): GhostEvaluation {
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
    /^[🔥❤️😍🙌👏✨💯👍🤝🎉]+$/u.test(lower) ||
    lower === "great post" ||
    lower === "amazing" ||
    lower.includes("love this") ||
    lower === "nice one" ||
    lower === "fire";

  if (isLead) {
    return {
      action: "flag_lead",
      confidence: 90,
      reasoning: "Inquiry expresses buying intent or asks about pricing/collaboration.",
      isLead: true,
      requiresHumanApproval: true,
      canDispatchImmediately: false,
    };
  }

  if (isComplaint) {
    return {
      action: "escalate_complaint",
      confidence: 85,
      reasoning: "Message indicates an issue or dissatisfaction requiring human attention.",
      isLead: false,
      requiresHumanApproval: true,
      canDispatchImmediately: false,
    };
  }

  if (isFluff) {
    const isAuto = autonomyMode === "auto";
    return {
      action: "auto_reply",
      confidence: 92,
      reasoning: "Positive social sentiment; suitable for standard brand engagement.",
      reply: "Thank you so much for the support! Really appreciate you being here 🙌",
      isLead: false,
      requiresHumanApproval: !isAuto,
      canDispatchImmediately: isAuto,
    };
  }

  const isAuto = autonomyMode === "auto";
  return {
    action: "auto_reply",
    confidence: 75,
    reasoning: "General social inquiry; auto-reply generated.",
    reply: "Thanks for reaching out! Let us know if you have any questions 👇",
    isLead: false,
    requiresHumanApproval: !isAuto,
    canDispatchImmediately: isAuto,
  };
}

/* ── 3. Unified Ghost Agent Implementation ────────────────────── */

export class GhostAgent {
  /**
   * Main entry point: Evaluates an incoming message or comment.
   */
  public static async evaluate(
    input: GhostAgentInput,
    context: AgentContext
  ): Promise<AgentResult<GhostEvaluation>> {
    const startTime = Date.now();
    const {
      message,
      senderName = "User",
      platform = "social",
      isComment = false,
      rules = [],
      brandVoice,
      botId,
    } = input;

    const autonomy = context.autonomyMode || "assist";
    const activeRules = rules.filter((r) => r.enabled).map((r) => r.label);

    // 1. If OpenRouter is not configured or in dev, use fallback
    if (!isConfigured()) {
      const fallbackResult = evaluateFallback(input, autonomy);
      await this.logAgentAction(context, input, fallbackResult, botId);
      return {
        success: true,
        data: fallbackResult,
        metadata: { latencyMs: Date.now() - startTime },
      };
    }

    // 2. Build structured system prompt
    const systemPrompt = `You are 'Ghost Mode', an autonomous social media AI assistant for a creator/business.
Your job is to analyze an incoming ${isComment ? "comment" : "direct message"} on ${platform} from "${senderName}" and decide how to triage it.

BRAND VOICE:
${brandVoice || "Professional, warm, concise, and helpful"}

ACTIVE RULES:
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
2. If "auto_reply", write a friendly reply matching the Brand Voice in under 2 sentences.
3. If "flag_lead" or "escalate_complaint", omit the reply or provide an internal note.
4. Output strictly valid JSON.

JSON SCHEMA:
{
  "action": "auto_reply" | "flag_lead" | "escalate_complaint" | "ignore",
  "confidence": number (0-100),
  "reasoning": string,
  "reply": string (required ONLY if action is 'auto_reply'),
  "is_lead": boolean
}`;

    try {
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

      let parsed: any;
      try {
        let clean = res.content.trim();
        if (clean.startsWith("```json")) clean = clean.replace(/```json/g, "").replace(/```/g, "").trim();
        if (clean.startsWith("```")) clean = clean.replace(/```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        const fallback = evaluateFallback(input, autonomy);
        await this.logAgentAction(context, input, fallback, botId);
        return {
          success: true,
          data: fallback,
          metadata: { latencyMs: Date.now() - startTime },
        };
      }

      const action: GhostActionType = [
        "auto_reply",
        "flag_lead",
        "escalate_complaint",
        "ignore",
      ].includes(parsed.action)
        ? parsed.action
        : "auto_reply";

      const confidence = Math.min(100, Math.max(0, Number(parsed.confidence ?? 80)));
      const isLead = Boolean(parsed.is_lead || action === "flag_lead");

      // Policy & Autonomy evaluation
      const canDispatchImmediately = action === "auto_reply" && autonomy === "auto";
      const requiresHumanApproval =
        action === "flag_lead" ||
        action === "escalate_complaint" ||
        (action === "auto_reply" && autonomy === "assist");

      const evaluation: GhostEvaluation = {
        action,
        confidence,
        reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "Classified based on active rules.",
        reply: action === "auto_reply" && typeof parsed.reply === "string" ? parsed.reply : undefined,
        isLead,
        requiresHumanApproval,
        canDispatchImmediately,
      };

      const validated = GhostEvaluationSchema.parse(evaluation);

      // Audit Log
      await this.logAgentAction(context, input, validated, botId);

      return {
        success: true,
        data: validated,
        metadata: {
          model: res.model,
          latencyMs: Date.now() - startTime,
        },
      };
    } catch (err: any) {
      console.error("[GhostAgent] Evaluation error:", err);
      const fallback = evaluateFallback(input, autonomy);
      await this.logAgentAction(context, input, fallback, botId);
      return {
        success: true,
        data: fallback,
        metadata: { latencyMs: Date.now() - startTime },
      };
    }
  }

  /**
   * Persist agent decision in database audit logs (agent_actions).
   */
  private static async logAgentAction(
    context: AgentContext,
    input: GhostAgentInput,
    evalResult: GhostEvaluation,
    botId?: string
  ): Promise<void> {
    if (!context.supabase || !context.workspaceId) return;

    try {
      await context.supabase.from("agent_actions").insert({
        user_id: context.workspaceId,
        bot_id: botId || null,
        comment: input.message,
        action: evalResult.action,
        reply: evalResult.reply || null,
        platform: input.platform || "unknown",
        reason: evalResult.reasoning,
      });
    } catch (logErr) {
      // Non-blocking log failure
      console.warn("[GhostAgent] Could not persist agent_actions log:", logErr);
    }
  }
}
