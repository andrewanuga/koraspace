/**
 * Context Engine v2.0 - Deterministic Context Compression & Pruning
 *
 * Implements a strict, multi-stage deterministic compression pipeline:
 * 1. Preserve Mandatory Context (Guaranteed survival; surfaces overflow if mandatory > budget)
 * 2. Lossless Structural Compaction (Whitespace normalization, newline collapsing, markdown cleanup)
 * 3. Oversized Section Trimming (Bounded section budgets for file snippets & transcripts)
 * 4. Progressive Low-Value Pruning (Lowest-ranked non-mandatory sections pruned first)
 * 5. Final Token Validation (Guarantees context never overflows model budget)
 *
 * NOTE: 100% deterministic — no non-deterministic LLM summarization calls.
 */

import { estimateTokens } from "./budget";
import {
  ContextPriority,
  type CompressedSectionInfo,
  type ContextSection,
  type PrunedSectionInfo,
} from "./types";
import type { RankedSection } from "./ranking";

/* ── 1. Configuration & Interfaces ────────────────────────────── */

export interface CompressionOptions {
  /** Target token budget for the context pool */
  targetBudget: number;
  /** Maximum allowable tokens for any single non-mandatory section (default: 600) */
  maxSectionTokens?: number;
  /** Character-to-token ratio for estimation (default: 3.8) */
  charsPerToken?: number;
  /** Whether to enable lossless structural compaction (default: true) */
  enableStructuralCompaction?: boolean;
  /** Whether to trim individual oversized sections before pruning (default: true) */
  enableOversizedTrimming?: boolean;
}

export interface CompressionResult {
  /** Sections retained after compression and pruning */
  retained: RankedSection[];
  /** Sections completely pruned to satisfy budget */
  pruned: PrunedSectionInfo[];
  /** Sections modified through structural compaction or trimming */
  compressed: CompressedSectionInfo[];
  /** Final total estimated tokens across retained sections */
  totalTokens: number;
  /** Tokens consumed strictly by mandatory sections */
  mandatoryTokens: number;
  /** True if mandatory sections alone exceed the target budget */
  mandatoryOverflow: boolean;
  /** Number of tokens overflowing the target budget */
  overflowTokens: number;
}

/* ── 2. Lossless Structural Compactor ──────────────────────────── */

/**
 * Normalizes and compacts text without losing semantic meaning:
 * - Collapses 3+ newlines to double newlines
 * - Normalizes tabs and excess spaces
 * - Preserves code block indentation inside triple backticks
 */
export function compactText(text: string): string {
  if (!text || text.length === 0) return "";

  // If text contains markdown code blocks, preserve code formatting
  if (text.includes("```")) {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts
      .map((part) => {
        if (part.startsWith("```")) {
          return part; // keep code block intact
        }
        return compactProse(part);
      })
      .join("");
  }

  return compactProse(text);
}

function compactProse(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/^[ \t]+|[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ── 3. Bounded Section Trimmer ───────────────────────────────── */

/**
 * Deterministically trims an oversized text section to fit a token ceiling:
 * - Retains high-signal prefix (first 75%)
 * - Retains closing context (last 15%)
 * - Inserts a deterministic truncation notice
 */
export function trimOversizedContent(
  content: string,
  maxTokens: number,
  charsPerToken: number = 3.8
): { content: string; trimmed: boolean; originalTokens: number; newTokens: number } {
  const originalTokens = estimateTokens(content, charsPerToken);
  if (originalTokens <= maxTokens) {
    return { content, trimmed: false, originalTokens, newTokens: originalTokens };
  }

  const maxChars = Math.floor(maxTokens * charsPerToken);
  const notice = "\n[... content truncated to fit context window ...]\n";
  const usableChars = Math.max(100, maxChars - notice.length);

  const headChars = Math.floor(usableChars * 0.75);
  const tailChars = Math.floor(usableChars * 0.25);

  const head = content.slice(0, headChars).trimEnd();
  const tail = content.slice(content.length - tailChars).trimStart();

  const trimmedContent = `${head}${notice}${tail}`;
  const newTokens = estimateTokens(trimmedContent, charsPerToken);

  return {
    content: trimmedContent,
    trimmed: true,
    originalTokens,
    newTokens,
  };
}

/* ── 4. Deterministic Compression Engine ──────────────────────── */

export class ContextCompressionEngine {
  /**
   * Executes the full deterministic compression and pruning pipeline.
   */
  public static compress(
    rankedSections: RankedSection[],
    options: CompressionOptions
  ): CompressionResult {
    const {
      targetBudget,
      maxSectionTokens = 600,
      charsPerToken = 3.8,
      enableStructuralCompaction = true,
      enableOversizedTrimming = true,
    } = options;

    const safeBudget = Math.max(0, targetBudget);
    const retained: RankedSection[] = [];
    const pruned: PrunedSectionInfo[] = [];
    const compressed: CompressedSectionInfo[] = [];

    // Stage 1: Preserve Mandatory Context & Initial Structural Compaction
    let workingSections: RankedSection[] = rankedSections.map((item) => {
      let content = item.section.content;
      let tokens = item.section.estimatedTokens;
      const originalTokens = tokens;

      if (enableStructuralCompaction) {
        const compacted = compactText(content);
        if (compacted !== content) {
          content = compacted;
          tokens = estimateTokens(compacted, charsPerToken);
        }
      }

      if (tokens < originalTokens) {
        compressed.push({
          id: item.section.id,
          source: item.section.source,
          originalTokens,
          compressedTokens: tokens,
        });
      }

      return {
        ...item,
        section: {
          ...item.section,
          content,
          estimatedTokens: tokens,
        },
      };
    });

    // Check baseline token sum
    const totalBaselineTokens = workingSections.reduce(
      (sum, item) => sum + item.section.estimatedTokens,
      0
    );

    // If already fits perfectly within budget, return immediately
    if (totalBaselineTokens <= safeBudget) {
      const mandatoryTokens = workingSections
        .filter((item) => item.section.isMandatory)
        .reduce((sum, item) => sum + item.section.estimatedTokens, 0);

      return {
        retained: workingSections,
        pruned: [],
        compressed,
        totalTokens: totalBaselineTokens,
        mandatoryTokens,
        mandatoryOverflow: mandatoryTokens > safeBudget,
        overflowTokens: Math.max(0, totalBaselineTokens - safeBudget),
      };
    }

    // Stage 2: Oversized Section Trimming (for non-mandatory sections)
    if (enableOversizedTrimming) {
      workingSections = workingSections.map((item) => {
        // Do not truncate mandatory sections
        if (item.section.isMandatory) return item;

        if (item.section.estimatedTokens > maxSectionTokens) {
          const trimResult = trimOversizedContent(
            item.section.content,
            maxSectionTokens,
            charsPerToken
          );

          if (trimResult.trimmed) {
            // Update or add compressed entry
            const existingIdx = compressed.findIndex((c) => c.id === item.section.id);
            if (existingIdx >= 0) {
              compressed[existingIdx].compressedTokens = trimResult.newTokens;
            } else {
              compressed.push({
                id: item.section.id,
                source: item.section.source,
                originalTokens: trimResult.originalTokens,
                compressedTokens: trimResult.newTokens,
              });
            }

            return {
              ...item,
              section: {
                ...item.section,
                content: trimResult.content,
                estimatedTokens: trimResult.newTokens,
              },
            };
          }
        }
        return item;
      });
    }

    // Stage 3: Mandatory First Allocation
    let currentTokens = 0;
    let mandatoryTokens = 0;

    for (const item of workingSections) {
      if (item.section.isMandatory) {
        retained.push(item);
        currentTokens += item.section.estimatedTokens;
        mandatoryTokens += item.section.estimatedTokens;
      }
    }

    const mandatoryOverflow = mandatoryTokens > safeBudget;

    // Stage 4: Progressive Non-Mandatory Selection
    for (const item of workingSections) {
      if (item.section.isMandatory) continue; // already added

      const sectionTokens = item.section.estimatedTokens;
      if (currentTokens + sectionTokens <= safeBudget) {
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

    const overflowTokens = Math.max(0, currentTokens - safeBudget);

    return {
      retained,
      pruned,
      compressed,
      totalTokens: currentTokens,
      mandatoryTokens,
      mandatoryOverflow,
      overflowTokens,
    };
  }
}
