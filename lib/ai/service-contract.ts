/**
 * Koraspace AI Service Interface Contracts
 *
 * Defines explicit typed RPC/HTTP boundaries between the Core Platform Backend
 * and the Koraspace AI Intelligence Service.
 */

import { z } from "zod";

// 1. /api/ai/chat (Reasoning & Tool Execution)
export const ChatRequestContract = z.object({
  message: z.string().min(1),
  workspaceId: z.string(),
  conversationId: z.string().optional(),
  model: z.string().optional(),
  enableTools: z.boolean().default(true),
  stream: z.boolean().default(false),
});

export type ChatRequest = z.infer<typeof ChatRequestContract>;

// 2. /api/ai/ghost (Deterministic Social Triage)
export const GhostRequestContract = z.object({
  message: z.string().min(1),
  senderName: z.string(),
  platform: z.enum(["x", "instagram", "linkedin", "youtube", "telegram"]),
  workspaceId: z.string(),
  autonomyMode: z.enum(["assist", "auto"]).default("assist"),
});

export type GhostRequest = z.infer<typeof GhostRequestContract>;

// 3. /api/ai/content/generate (Multi-Platform Generation & Repurposing)
export const ContentGenerateContract = z.object({
  topic: z.string().min(3),
  targetPlatform: z.enum(["linkedin", "x", "instagram", "youtube", "telegram", "threads"]),
  workspaceId: z.string(),
  repurposeTargets: z.array(z.enum(["linkedin", "x", "instagram", "youtube", "telegram", "threads"])).optional(),
  customInstructions: z.string().optional(),
});

export type ContentGenerateRequest = z.infer<typeof ContentGenerateContract>;

// 4. /api/ai/memory (Memory Formation & Search)
export const MemorySearchContract = z.object({
  query: z.string().min(1),
  workspaceId: z.string(),
  limit: z.number().default(5),
  type: z.enum(["brand_rule", "audience_fact", "preference", "decision", "exemplar"]).optional(),
});

export type MemorySearchRequest = z.infer<typeof MemorySearchContract>;
