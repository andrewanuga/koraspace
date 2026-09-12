// lib/ai/context/assembler.ts

import {
  ContextRequest,
  ContextAssemblyResult,
  ContextTokenBudget,
  ContextBundle,
  ContextSection,
  SourceResult,
} from "./types";
import { ContextRankingEngine, RankedSection } from "./ranking";
import { ContextCompressionEngine, CompressionOptions } from "./compression";
import { TokenBudgetEngine } from "./budget";

/**
 * Helper that gathers raw source results, runs deterministic ranking,
 * token budgeting, compression, and formats the final system prompt
 * and message list.
 */
export async function assembleContext(params: {
  request: ContextRequest;
  tokenBudget: ContextTokenBudget;
  sourceResults: Record<string, SourceResult>;
  fetchedResults: SourceResult[];
}): Promise<ContextAssemblyResult> {
  const { request, tokenBudget, sourceResults, fetchedResults } = params;

  // 1️⃣ Aggregate all sections into a bundle.
  const allSections: ContextSection[] = [];
  for (const res of fetchedResults) {
    if (res.sections && res.sections.length > 0) {
      allSections.push(...res.sections);
    }
  }

  const bundle: ContextBundle = {
    sections: allSections,
    totalEstimatedTokens: allSections.reduce((s, sec) => s + sec.estimatedTokens, 0),
    sourceResults,
    timestamp: Date.now(),
  };

  // 2️⃣ Rank sections deterministically.
  const ranked: RankedSection[] = ContextRankingEngine.rank(bundle.sections);

  // 3️⃣ Apply budget selection (mandatory sections always kept).
  const selection = ContextRankingEngine.selectWithinBudget(
    ranked,
    tokenBudget.availableContextBudget
  );

  // 4️⃣ Compression – deterministic pruning/compaction.
  const compressionOpts: CompressionOptions = {
    targetBudget: tokenBudget.availableContextBudget,
    // defaults are fine; can be tuned later.
  };

  const compression = ContextCompressionEngine.compress(selection.retained, compressionOpts);

  // 5️⃣ Build system prompt.
  const baseSystemPrompt = request.userSystemPrompt ||
    "You are Koraspace AI, an elite autonomous social media agent.";

  // Include compliance rules from brand source if available.
  const compliance = bundle.sourceResults["brand"]?.rawData?.brand;
  const forbiddenTerms = compliance?.forbiddenTerms ?? [];
  const brandGuidelines = compliance?.brandGuidelines ?? [];

  const complianceSection = forbiddenTerms.length > 0 || brandGuidelines.length > 0
    ? `### MANDATORY BRAND GUARDRAILS (NEVER VIOLATE)\n` +
      `Strictly forbidden terms: ${forbiddenTerms.map(t => `"${t}"`).join(", ")}\n` +
      (brandGuidelines.length > 0 ? `Compliance guidelines:\n- ${brandGuidelines.join("\n- ")}` : "")
    : "";

  const retainedContents = compression.retained
    .map((rs) => rs.section.content)
    .join("\n\n");

  const systemPrompt = [baseSystemPrompt, complianceSection, retainedContents]
    .filter(Boolean)
    .join("\n\n");

  // 6️⃣ Preserve original message stream ordering.
  const messages = request.messages || [];

  // 7️⃣ Validate token usage.
  const usage = {
    systemPrompt: TokenBudgetEngine.validateUsage(
      { systemPrompt: 0, messages: 0, total: 0 },
      tokenBudget
    ),
    // We'll compute actual token estimates now.
  };

  const systemPromptTokens = estimateTokens(systemPrompt);
  const messagesTokens = estimateMessagesTokens(messages);
  const totalTokens = systemPromptTokens + messagesTokens;

  const validation = TokenBudgetEngine.validateUsage(
    { systemPrompt: systemPromptTokens, messages: messagesTokens, total: totalTokens },
    tokenBudget
  );

  // 8️⃣ Assemble final result.
  const result: ContextAssemblyResult = {
    systemPrompt,
    messages,
    tokenBudget,
    tokensUsed: {
      systemPrompt: systemPromptTokens,
      messages: messagesTokens,
      total: totalTokens,
    },
    retainedSectionIds: compression.retained.map((rs) => rs.section.id),
    prunedSections: compression.pruned,
    compressedSections: compression.compressed,
    complianceRules: {
      forbiddenTerms,
      brandGuidelines,
    },
    metadata: {
      modelId: tokenBudget.totalWindow.toString(), // placeholder, could be modelProfile.modelId
      assemblyLatencyMs: Date.now() - bundle.timestamp,
      sourceLatencies: Object.fromEntries(
        Object.entries(sourceResults).map(([k, v]) => [k, v.latencyMs])
      ),
    },
  };

  // Ensure we never exceed budget – if we do, throw (should not happen).
  if (!validation.isValid) {
    throw new Error(`Context assembly exceeded token budget by ${validation.overflowTokens} tokens`);
  }

  return result;
}

// Helper token estimation functions (reuse from budget module).
import { estimateTokens, estimateMessagesTokens } from "./budget";

/** Simple placeholder for modelId in metadata; could be refined later. */
function placeholderModelId(): string {
  return "unknown-model";
}
