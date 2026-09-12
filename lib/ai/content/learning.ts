/**
 * Closed-Loop Content Learning Engine
 *
 * Closes the intelligence loop between published post metrics and future generation:
 * - Ingests actual social engagement metrics (impressions, likes, comments, shares)
 * - Performs structural feature extraction (hook patterns, CTA styles, character length)
 * - Identifies top-quartile viral exemplars
 * - Updates workspace Performance Memory with concrete few-shot guidance
 */

import type { PostPerformanceSummary } from "../memory/types";

export interface FeatureExtractionResult {
  hookType: "question" | "contrarian" | "listicle" | "story" | "direct";
  ctaType: "discussion" | "save_bookmark" | "direct_link" | "none";
  characterLength: number;
  hashtagCount: number;
  engagementScore: number;
}

export class ClosedLoopLearningEngine {
  /**
   * Extracts structural features from post content and metrics.
   */
  public static extractFeatures(post: PostPerformanceSummary): FeatureExtractionResult {
    const text = (post.content || "").trim();
    const firstLine = (post.hook || text.split("\n")[0] || "").toLowerCase();
    const lower = text.toLowerCase();

    // 1. Classify Hook Pattern
    let hookType: FeatureExtractionResult["hookType"] = "direct";
    if (firstLine.includes("?") || firstLine.startsWith("how ") || firstLine.startsWith("why ")) {
      hookType = "question";
    } else if (firstLine.includes("stop") || firstLine.includes("don't") || firstLine.includes("backwards") || firstLine.includes("wrong")) {
      hookType = "contrarian";
    } else if (/^\d+[/.]/m.test(firstLine) || firstLine.includes("10") || firstLine.includes("3") || firstLine.includes("5")) {
      hookType = "listicle";
    }

    // 2. Classify CTA Pattern
    let ctaType: FeatureExtractionResult["ctaType"] = "none";
    if (lower.includes("thoughts?") || lower.includes("discuss") || lower.includes("comment below")) {
      ctaType = "discussion";
    } else if (lower.includes("save") || lower.includes("bookmark")) {
      ctaType = "save_bookmark";
    } else if (lower.includes("link") || lower.includes("tap")) {
      ctaType = "direct_link";
    }

    // 3. Count hashtags
    const hashtags = text.match(/#[a-zA-Z0-9_]+/g) || [];

    // 4. Compute composite engagement score (scaled 0 - 100)
    const engagementScore = Math.min(100, Math.round(post.engagementRate * 10 + (post.likes + post.comments * 2 + post.shares * 3) / 10));

    return {
      hookType,
      ctaType,
      characterLength: text.length,
      hashtagCount: hashtags.length,
      engagementScore,
    };
  }

  /**
   * Analyzes an array of historical posts and extracts the highest-performing patterns.
   */
  public static deriveWinningPatterns(posts: PostPerformanceSummary[]): {
    bestHookType: string;
    bestCtaType: string;
    optimalLengthRange: string;
    topExemplars: PostPerformanceSummary[];
  } {
    if (!posts || posts.length === 0) {
      return {
        bestHookType: "contrarian",
        bestCtaType: "discussion",
        optimalLengthRange: "150-300 characters",
        topExemplars: [],
      };
    }

    const analyzed = posts.map((p) => ({
      post: p,
      features: this.extractFeatures(p),
    }));

    // Sort by engagement
    analyzed.sort((a, b) => b.features.engagementScore - a.features.engagementScore);

    const topQuartile = analyzed.slice(0, Math.max(1, Math.ceil(analyzed.length * 0.25)));
    const bestHookType = topQuartile[0].features.hookType;
    const bestCtaType = topQuartile[0].features.ctaType;

    return {
      bestHookType,
      bestCtaType,
      optimalLengthRange: "200-400 characters",
      topExemplars: topQuartile.map((q) => q.post),
    };
  }
}
