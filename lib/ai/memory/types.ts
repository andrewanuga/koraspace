/**
 * Unified Memory & Brand Intelligence Type Contracts
 *
 * Defines explicit boundaries for:
 * - BrandIntelligence: Persona, tone, audience, content pillars, guardrails
 * - SemanticMemory: Categorized knowledge, decisions, and vector embeddings
 * - PerformanceInsight: Historical engagement patterns, top hooks, and formats
 * - MemoryContextBundle: Unified memory envelope injected into agents
 */

import { z } from "zod";

/* -- 1. Brand Intelligence & Guardrails ------------------------- */

export const StyleTraitsSchema = z.object({
  formality: z.enum(["formal", "balanced", "casual"]).default("balanced"),
  emojiUse: z.enum(["none", "rare", "occasional", "frequent"]).default("occasional"),
  sentenceLength: z.enum(["short, punchy", "medium", "long"]).default("medium"),
  exclaimRate: z.number().default(0),
  avgWordsPerSentence: z.number().default(14),
});
export type StyleTraits = z.infer<typeof StyleTraitsSchema>;

export interface BrandIntelligence {
  workspaceId: string;
  brandName?: string;
  brandWebsite?: string;
  niche?: string;
  brandVoice?: string;
  toneSummary?: string;
  targetAudience: string[];
  contentPillars: string[];
  preferredTerms: string[];
  forbiddenTerms: string[];
  ctaPreferences: string[];
  brandGuidelines: string[];
  styleTraits: StyleTraits;
  sampleCount: number;
  lastUpdated?: string;
}

export interface BrandComplianceReport {
  compliant: boolean;
  violations: string[];
  suggestions: string[];
}

/* -- 2. Semantic Memory & Knowledge Base ------------------------ */

export const MemoryTypeSchema = z.enum([
  "brand_rule",
  "preference",
  "fact",
  "decision",
  "conversation",
]);
export type MemoryType = z.infer<typeof MemoryTypeSchema>;

export const MemoryImportanceSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
export type MemoryImportance = z.infer<typeof MemoryImportanceSchema>;

export interface SemanticMemory {
  id: string;
  workspaceId: string;
  source: "chat" | "inbox" | "dm" | "system" | "document";
  platform?: string;
  memoryType: MemoryType;
  importance: MemoryImportance;
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface MemoryQuery {
  query: string;
  workspaceId: string;
  limit?: number;
  minImportance?: MemoryImportance;
  memoryTypes?: MemoryType[];
}

export interface MemorySearchResult {
  memory: SemanticMemory;
  similarityScore: number;
}

/* -- 3. Performance Memory & Analytics Intelligence ------------ */

export interface PostPerformanceSummary {
  id: string;
  platform: string;
  content: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  postedAt: string;
  hook?: string;
}

export interface PerformanceInsight {
  workspaceId: string;
  platform?: string;
  totalPostsAnalyzed: number;
  avgEngagementRate: number;
  topPerformingFormats: string[];
  strongestHooks: string[];
  topCtaPatterns: string[];
  bestPostingHoursUtc: number[];
  topPosts: PostPerformanceSummary[];
}

/* -- 4. Unified Memory Context Bundle --------------------------- */

export interface MemoryContextBundle {
  brand: BrandIntelligence;
  semanticMemories: SemanticMemory[];
  performance?: PerformanceInsight;
  formattedSystemContext: string;
}
