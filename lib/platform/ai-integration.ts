/**
 * Core Platform ↔ AI Service Integration Gateway
 *
 * Provides high-level server-side helpers consumed by Next.js Server Actions,
 * background job workers, and platform route handlers:
 * - Wraps all calls in KoraspaceAIClient
 * - Propagates authenticated user and workspace context
 * - Implements automated error logging and graceful degradations
 */

import { KoraspaceAIClient } from "../ai-client";
import type {
  V1ChatResponse,
  V1GhostEvaluateResponse,
} from "../ai/contracts/v1";
import type { ContentIntelligenceResult } from "../ai/content/types";
import type { SemanticMemory } from "../ai/memory/types";

export class PlatformAIIntegration {
  private static client = new KoraspaceAIClient();

  /**
   * Dispatches user chat query to the AI Service.
   */
  public static async executePlatformChat(
    workspaceId: string,
    userId: string,
    message: string,
    options: { model?: string; correlationId?: string } = {}
  ): Promise<V1ChatResponse> {
    return this.client.chat(
      {
        message,
        workspaceId,
        model: options.model,
      },
      { userId, correlationId: options.correlationId }
    );
  }

  /**
   * Triages an incoming social message and checks deterministic policy constraints.
   */
  public static async triageSocialInteraction(
    workspaceId: string,
    interaction: {
      message: string;
      senderName: string;
      platform: "x" | "instagram" | "linkedin" | "youtube" | "telegram";
      autonomyMode?: "assist" | "auto";
    },
    options: { userId?: string; correlationId?: string } = {}
  ): Promise<V1GhostEvaluateResponse> {
    return this.client.evaluateGhost(
      {
        message: interaction.message,
        senderName: interaction.senderName,
        platform: interaction.platform,
        workspaceId,
        autonomyMode: interaction.autonomyMode || "assist",
      },
      options
    );
  }

  /**
   * Generates a multi-platform content campaign for a workspace.
   */
  public static async generateWorkspaceCampaign(
    workspaceId: string,
    topic: string,
    targetPlatform: "linkedin" | "x" | "instagram" | "youtube" | "telegram" | "threads",
    repurposeTargets?: ("linkedin" | "x" | "instagram" | "youtube" | "telegram" | "threads")[],
    options: { userId?: string; correlationId?: string; customInstructions?: string } = {}
  ): Promise<ContentIntelligenceResult> {
    return this.client.generateContent(
      {
        topic,
        targetPlatform,
        workspaceId,
        repurposeTargets,
        customInstructions: options.customInstructions,
      },
      options
    );
  }

  /**
   * Retrieves workspace semantic and brand memories.
   */
  public static async fetchWorkspaceMemories(
    workspaceId: string,
    query: string,
    limit: number = 5,
    options: { userId?: string; correlationId?: string } = {}
  ): Promise<SemanticMemory[]> {
    return this.client.searchMemory(
      {
        query,
        workspaceId,
        limit,
      },
      options
    );
  }
}
