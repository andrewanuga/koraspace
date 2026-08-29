/**
 * Koraspace AI Service Contracts (v1)
 *
 * Formalized Zod schemas and TypeScript request/response contracts
 * for Core Platform consumption.
 */

import { z } from "zod";

// 1. POST /api/v1/ai/chat
export const V1ChatRequestSchema = z.object({
  message: z.string().min(1),
  workspaceId: z.string(),
  conversationId: z.string().optional(),
  model: z.string().optional(),
  enableTools: z.boolean().default(true),
  idempotencyKey: z.string().optional(),
});

export type V1ChatRequest = z.infer<typeof V1ChatRequestSchema>;

export interface V1ChatResponse {
  reply: string;
  toolCallsExecuted: string[];
  memoryItemsUsed: number;
  selfCorrections: number;
  costUsd: number;
}

// 2. POST /api/v1/ai/ghost/evaluate
export const V1GhostEvaluateRequestSchema = z.object({
  message: z.string().min(1),
  senderName: z.string(),
  platform: z.enum(["x", "instagram", "linkedin", "youtube", "telegram"]),
  workspaceId: z.string(),
  autonomyMode: z.enum(["assist", "auto"]).default("assist"),
  idempotencyKey: z.string().optional(),
});

export type V1GhostEvaluateRequest = z.infer<typeof V1GhostEvaluateRequestSchema>;

export interface V1GhostEvaluateResponse {
  decision: "ALLOW" | "REQUIRE_APPROVAL" | "DENY";
  action: "auto_reply" | "flag_lead" | "escalate_complaint" | "ignore";
  proposedReply?: string;
  confidence: number;
  isLead: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  reasons: string[];
}

// 3. POST /api/v1/ai/content/generate
export const V1ContentGenerateRequestSchema = z.object({
  topic: z.string().min(3),
  targetPlatform: z.enum(["linkedin", "x", "instagram", "youtube", "telegram", "threads"]),
  workspaceId: z.string(),
  repurposeTargets: z.array(z.enum(["linkedin", "x", "instagram", "youtube", "telegram", "threads"])).optional(),
  objective: z.enum(["thought_leadership", "lead_generation", "engagement", "product_announcement"]).optional(),
  customInstructions: z.string().optional(),
});

export type V1ContentGenerateRequest = z.infer<typeof V1ContentGenerateRequestSchema>;

// 4. POST /api/v1/ai/memory/search
export const V1MemorySearchRequestSchema = z.object({
  query: z.string().min(1),
  workspaceId: z.string(),
  limit: z.number().default(5),
  type: z.enum(["brand_rule", "audience_fact", "preference", "decision", "exemplar"]).optional(),
});

export type V1MemorySearchRequest = z.infer<typeof V1MemorySearchRequestSchema>;
