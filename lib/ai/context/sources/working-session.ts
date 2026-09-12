// lib/ai/context/sources/working-session.ts
/**
 * Context Engine v2.0 - Working Session Source Adapter
 *
 * Provides immediate session context (recent conversation turns, user intent,
 * attachments, etc.) to the Context Engine. It does **no** reasoning – it only
 * gathers and formats the data supplied in the ContextRequest.
 *
 * Rules enforced:
 *   • Priority = ContextPriority.HIGH (session context outranks semantic and
 *     performance evidence but remains below CRITICAL guardrails).
 *   • Mandatory = false.
 *   • No external database calls – all data comes from the request.
 */

import { estimateTokens } from "../budget";
import {
  ContextPriority,
  type ContextRequest,
  type ContextSection,
  type ContextSource,
  type SourceResult,
} from "../types";

export class WorkingSessionSource implements ContextSource {
  public readonly name = "working_session";
  public readonly priority = ContextPriority.HIGH;

  /**
   * Constructs a ContextSection from recent messages and attachments.
   * Limits the number of messages to avoid blowing the token budget – we take the
   * last 5 messages (or fewer) which typically represent the active turn.
   */
  public async fetch(
    request: ContextRequest,
    _allocatedBudget?: number,
  ): Promise<SourceResult> {
    const startTime = Date.now();
    const { workspaceId, messages = [], attachments = [] } = request;

    if (!workspaceId) {
      return {
        source: this.name,
        sections: [],
        latencyMs: Date.now() - startTime,
        success: false,
        error: "Missing workspaceId in ContextRequest",
      };
    }

    // If there is no session activity, return an empty successful result.
    if (messages.length === 0 && attachments.length === 0) {
      return {
        source: this.name,
        sections: [],
        latencyMs: Date.now() - startTime,
        success: true,
        rawData: { messages, attachments },
      };
    }

    // Take the most recent few messages – simple heuristic.
    const recentMessages = messages.slice(-5);
    const messageLines = recentMessages.map((msg) => `- ${msg.role}: ${msg.content}`);

    const attachmentLines = attachments.map((att) => `- Attachment: ${att.name || att.url || 'unknown'}`);

    const contentLines = [...messageLines, ...attachmentLines];
    const content = contentLines.join("\n");

    const section: ContextSection = {
      id: `working-session-${workspaceId}`,
      source: this.name,
      title: "Working Session Context",
      content,
      priority: ContextPriority.HIGH,
      relevanceScore: 1.0,
      importanceScore: 4,
      estimatedTokens: estimateTokens(content),
      isMandatory: false,
      target: "system_prompt",
      metadata: {
        messageCount: recentMessages.length,
        attachmentCount: attachments.length,
      },
    };

    return {
      source: this.name,
      sections: [section],
      latencyMs: Date.now() - startTime,
      success: true,
      rawData: { messages, attachments },
    };
  }
}
