/**
 * Content Intelligence Engine Contracts & Types
 *
 * Defines boundaries for multi-platform content generation, repurposing,
 * empirical virality scoring, and pre-publication compliance.
 */

import { z } from "zod";
import type { BrandIntelligence, PerformanceInsight } from "../memory/types";

export type SocialPlatform = "linkedin" | "x" | "instagram" | "youtube" | "telegram" | "threads";

export interface ContentGenerationRequest {
  topic: string;
  targetPlatform: SocialPlatform;
  objective?: "thought_leadership" | "lead_generation" | "engagement" | "product_announcement";
  sourceMaterial?: string; // Long-form transcript, URL content, or notes
  repurposeTargets?: SocialPlatform[];
  customInstructions?: string;
}

export interface PlatformContentDraft {
  platform: SocialPlatform;
  content: string;
  characterCount: number;
  estimatedReadingTimeSeconds: number;
  hook: string;
  callToAction: string;
  suggestedHashtags: string[];
  predictedViralityScore: number; // 0 to 100
  compliancePassed: boolean;
  warnings: string[];
}

export interface ContentIntelligenceResult {
  primaryDraft: PlatformContentDraft;
  repurposedDrafts: PlatformContentDraft[];
  strategyNotes: string;
  brandCompliancePassed: boolean;
  estimatedCostUsd: number;
  traceId: string;
}

export const ContentGenerationRequestSchema = z.object({
  topic: z.string().min(3),
  targetPlatform: z.enum(["linkedin", "x", "instagram", "youtube", "telegram", "threads"]),
  objective: z.enum(["thought_leadership", "lead_generation", "engagement", "product_announcement"]).optional(),
  sourceMaterial: z.string().optional(),
  repurposeTargets: z.array(z.enum(["linkedin", "x", "instagram", "youtube", "telegram", "threads"])).optional(),
  customInstructions: z.string().optional(),
});
