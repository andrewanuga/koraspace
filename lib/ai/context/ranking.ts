/**
 * Context Engine v2.0 - Multi-Factor Deterministic Context Ranking
 *
 * Implements weighted normalized scoring and deterministic ordering of context sections:
 * - Priority Weight (30%)
 * - Query Relevance (25%)
 * - Intrinsic Importance (15%)
 * - Temporal Recency (10%)
 * - Source Authority (10%)
 * - Token Efficiency (10%)
 *
 * Guaranteed Behavior:
 * - Mandatory sections bypass ranking and are strictly non-discardable
 * - Fully deterministic tie-breaking (Mandatory -> Score -> Priority -> Relevance -> Importance -> ID)
 * - Strict multi-tenant safety and budget-aware selection
 */

import {
  ContextPriority,
  type ContextSection,
  type PrunedSectionInfo,
} from "./types";

/* ── 1. Weight Configuration & Interfaces ─────────────────────── */

export interface RankingWeights {
  priority: number;
  relevance: number;
  importance: number;
  recency: number;
  authority: number;
  tokenEfficiency: number;
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  priority: 0.30,
  relevance: 0.25,
  importance: 0.15,
  recency: 0.10,
  authority: 0.10,
  tokenEfficiency: 0.10,
};

export interface ScoreBreakdown {
  priority: number;
  relevance: number;
  importance: number;
  recency: number;
  authority: number;
  tokenEfficiency: number;
  weightedTotal: number;
}

export interface RankedSection {
  section: ContextSection;
  score: number;
  breakdown: ScoreBreakdown;
}

export interface BudgetSelectionResult {
  retained: RankedSection[];
  pruned: PrunedSectionInfo[];
  totalTokensUsed: number;
}

/* ── 2. Source Authority Defaults ─────────────────────────────── */

const DEFAULT_SOURCE_AUTHORITY: Record<string, number> = {
  brand: 1.0,
  guardrails: 1.0,
  safety: 1.0,
  persona: 0.9,
  working_session: 0.85,
  performance: 0.80,
  semantic: 0.70,
  general: 0.50,
};

/* ── 3. Ranking Engine Implementation ─────────────────────────── */

export class ContextRankingEngine {
  /**
   * Evaluates and scores an atomic context section across all 6 weighted dimensions.
   */
  public static scoreSection(
    section: ContextSection,
    weights: RankingWeights = DEFAULT_RANKING_WEIGHTS,
    referenceTimestamp: number = Date.now()
  ): ScoreBreakdown {
    // 1. Priority Score (0.0 - 1.0)
    let priorityScore = 0.2;
    switch (section.priority) {
      case ContextPriority.CRITICAL:
        priorityScore = 1.0;
        break;
      case ContextPriority.HIGH:
        priorityScore = 0.8;
        break;
      case ContextPriority.MEDIUM_HIGH:
        priorityScore = 0.6;
        break;
      case ContextPriority.MEDIUM:
        priorityScore = 0.4;
        break;
      case ContextPriority.LOW:
        priorityScore = 0.2;
        break;
      case ContextPriority.BACKGROUND:
        priorityScore = 0.1;
        break;
    }

    // 2. Relevance Score (0.0 - 1.0)
    const relevanceScore = Math.max(0, Math.min(1, section.relevanceScore ?? 0.5));

    // 3. Importance Score (Normalized from 1..5 to 0.0 - 1.0)
    const rawImportance = section.importanceScore ?? 3;
    const importanceScore = Math.max(0, Math.min(1, (rawImportance - 1) / 4));

    // 4. Recency Score (Exponential half-life decay)
    let recencyScore = 0.7; // default for static sections
    if (section.metadata?.createdAt) {
      const createdTime = new Date(String(section.metadata.createdAt)).getTime();
      if (!isNaN(createdTime) && createdTime <= referenceTimestamp) {
        const ageHours = Math.max(0, (referenceTimestamp - createdTime) / (1000 * 60 * 60));
        // Half-life of 168 hours (1 week)
        recencyScore = Math.exp(-ageHours / 168);
      }
    } else if (section.source === "working_session") {
      recencyScore = 1.0;
    }

    // 5. Source Authority Score (0.0 - 1.0)
    const authorityScore = typeof section.metadata?.authorityScore === "number"
      ? Math.max(0, Math.min(1, section.metadata.authorityScore))
      : DEFAULT_SOURCE_AUTHORITY[section.source] ?? 0.6;

    // 6. Token Efficiency Score (0.0 - 1.0)
    // Higher score for compact, high-density sections
    const tokens = Math.max(1, section.estimatedTokens);
    const tokenEfficiency = tokens <= 50
      ? 1.0
      : tokens <= 150
      ? 0.85
      : tokens <= 400
      ? 0.70
      : tokens <= 1000
      ? 0.50
      : 0.30;

    // Weighted composite
    const weightedTotal = Number(
      (
        priorityScore * weights.priority +
        relevanceScore * weights.relevance +
        importanceScore * weights.importance +
        recencyScore * weights.recency +
        authorityScore * weights.authority +
        tokenEfficiency * weights.tokenEfficiency
      ).toFixed(5)
    );

    return {
      priority: priorityScore,
      relevance: relevanceScore,
      importance: importanceScore,
      recency: recencyScore,
      authority: authorityScore,
      tokenEfficiency,
      weightedTotal,
    };
  }

  /**
   * Deterministically sorts an array of context sections.
   * Ordering hierarchy:
   * 1. Mandatory flag (non-discardable first)
   * 2. Final weighted score (descending)
   * 3. Priority tier (ascending: CRITICAL=1 ... BACKGROUND=6)
   * 4. Relevance score (descending)
   * 5. Importance score (descending)
   * 6. Stable section ID (alphabetical ascending)
   */
  public static rank(
    sections: ContextSection[],
    weights: RankingWeights = DEFAULT_RANKING_WEIGHTS,
    referenceTimestamp: number = Date.now()
  ): RankedSection[] {
    const scored: RankedSection[] = sections.map((section) => {
      const breakdown = this.scoreSection(section, weights, referenceTimestamp);
      return {
        section,
        score: breakdown.weightedTotal,
        breakdown,
      };
    });

    return scored.sort((a, b) => this.compareRanked(a, b));
  }

  /**
   * Deterministic comparator between two ranked sections.
   */
  public static compareRanked(a: RankedSection, b: RankedSection): number {
    // 1. Mandatory sections always precede non-mandatory
    if (a.section.isMandatory !== b.section.isMandatory) {
      return a.section.isMandatory ? -1 : 1;
    }

    // 2. Final composite score (descending) with epsilon precision
    const scoreDiff = b.score - a.score;
    if (Math.abs(scoreDiff) > 1e-4) {
      return scoreDiff;
    }

    // 3. Priority tier (ascending order: 1 is CRITICAL, 6 is BACKGROUND)
    if (a.section.priority !== b.section.priority) {
      return a.section.priority - b.section.priority;
    }

    // 4. Relevance score (descending)
    const relDiff = b.section.relevanceScore - a.section.relevanceScore;
    if (Math.abs(relDiff) > 1e-4) {
      return relDiff;
    }

    // 5. Importance score (descending)
    if (a.section.importanceScore !== b.section.importanceScore) {
      return b.section.importanceScore - a.section.importanceScore;
    }

    // 6. Section ID tie-breaker (alphabetical ascending)
    return a.section.id.localeCompare(b.section.id);
  }

  /**
   * Selects the highest-ranked sections that fit within the available token budget.
   * Mandatory sections are unconditionally preserved.
   */
  public static selectWithinBudget(
    rankedSections: RankedSection[],
    availableBudget: number
  ): BudgetSelectionResult {
    const retained: RankedSection[] = [];
    const pruned: PrunedSectionInfo[] = [];
    let currentTokens = 0;

    // First pass: Unconditionally retain all mandatory sections
    for (const item of rankedSections) {
      if (item.section.isMandatory) {
        retained.push(item);
        currentTokens += item.section.estimatedTokens;
      }
    }

    // Second pass: Greedily add remaining sections in ranked order until budget exhausted
    for (const item of rankedSections) {
      if (item.section.isMandatory) {
        continue; // already retained in pass 1
      }

      const sectionTokens = item.section.estimatedTokens;
      if (currentTokens + sectionTokens <= availableBudget) {
        retained.push(item);
        currentTokens += sectionTokens;
      } else {
        pruned.push({
          id: item.section.id,
          source: item.section.source,
          title: item.section.title,
          priority: item.section.priority,
          estimatedTokens: sectionTokens,
          reason: "budget_exceeded",
        });
      }
    }

    return {
      retained,
      pruned,
      totalTokensUsed: currentTokens,
    };
  }
}
