/**
 * Verification Test Suite for Memory & Brand Intelligence Engine
 */

import { BrandIntelligenceLoader } from "../lib/ai/memory/brand";
import { PersonaLearningEngine } from "../lib/ai/memory/persona";
import { PerformanceMemoryEngine } from "../lib/ai/memory/performance";
import { MemoryRetrievalEngine } from "../lib/ai/memory/retrieval";
import type { AgentContext } from "../lib/ai/core/types";
import type { BrandIntelligence, PerformanceInsight } from "../lib/ai/memory/types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
    failed++;
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("🧪 Running Memory & Brand Intelligence Tests");
  console.log("==================================================\n");

  const context: AgentContext = {
    userId: "test-workspace-mem",
    workspaceId: "test-workspace-mem",
    autonomyMode: "assist",
  };

  // ── 1. Brand Intelligence Loader & Defaults ──────────────────────
  const brand = await BrandIntelligenceLoader.load("test-workspace-mem");
  assert(
    Boolean(
      brand.workspaceId === "test-workspace-mem" &&
        brand.brandVoice &&
        brand.brandVoice.length > 0 &&
        brand.forbiddenTerms.length > 0
    ),
    "BrandIntelligenceLoader loads valid brand contracts with default guardrails"
  );

  // ── 2. Brand Prompt Section Formatting ───────────────────────────
  const customBrand: BrandIntelligence = {
    workspaceId: "test-workspace-custom",
    brandName: "Acme AI",
    niche: "B2B SaaS",
    brandVoice: "Authoritative, educational, and direct",
    toneSummary: "balanced, medium sentences, occasional emoji use",
    targetAudience: ["Enterprise founders", "Product managers"],
    contentPillars: ["AI Automation", "Case Studies"],
    preferredTerms: ["high-signal", "leverage", "ROI"],
    forbiddenTerms: ["guaranteed overnight success", "get rich quick"],
    ctaPreferences: ["Leave a thought in the comments"],
    brandGuidelines: ["Provide verified metrics."],
    styleTraits: {
      formality: "balanced",
      emojiUse: "occasional",
      sentenceLength: "medium",
      exclaimRate: 0,
      avgWordsPerSentence: 15,
    },
    sampleCount: 10,
  };

  const formattedBrand = BrandIntelligenceLoader.formatPromptSection(customBrand);
  assert(
    formattedBrand.includes("WORKSPACE BRAND INTELLIGENCE") &&
      formattedBrand.includes("Enterprise founders") &&
      formattedBrand.includes("guaranteed overnight success"),
    "BrandIntelligenceLoader formats structured system prompt section"
  );

  // ── 3. Brand Guardrail Compliance Check ───────────────────────────
  const violatingText = "Try our product today for guaranteed overnight success!";
  const complianceViolated = BrandIntelligenceLoader.checkCompliance(violatingText, customBrand);
  assert(
    complianceViolated.compliant === false &&
      complianceViolated.violations.length > 0 &&
      complianceViolated.violations[0].includes("guaranteed overnight success"),
    "Brand compliance checker detects forbidden terms"
  );

  const safeText = "Here is our 3-step breakdown of how B2B teams achieve higher leverage.";
  const complianceSafe = BrandIntelligenceLoader.checkCompliance(safeText, customBrand);
  assert(
    complianceSafe.compliant === true && complianceSafe.violations.length === 0,
    "Brand compliance checker passes clean text"
  );

  // ── 4. Persona Learning Engine Style Analysis ────────────────────
  const sampleTexts = [
    "Hey guys! Super excited to share this new update lol 🎉",
    "Haha yeah, omg this works so well fr 🔥",
    "Let's gooo! Check out the link below and drop a like 👍",
  ];
  const { traits, summary } = PersonaLearningEngine.analyzeStyle(sampleTexts);
  assert(
    traits.formality === "casual" &&
      traits.emojiUse === "frequent" &&
      summary.includes("casual"),
    "PersonaLearningEngine correctly identifies casual, emoji-rich tone"
  );

  // ── 5. Performance Memory Formatting ─────────────────────────────
  const samplePerf: PerformanceInsight = {
    workspaceId: "test-workspace-perf",
    totalPostsAnalyzed: 12,
    avgEngagementRate: 6.8,
    topPerformingFormats: ["Educational Breakdown"],
    strongestHooks: ["Most founders get AI automation wrong."],
    topCtaPatterns: ["Save this for later"],
    bestPostingHoursUtc: [9, 14],
    topPosts: [
      {
        id: "post-1",
        platform: "linkedin",
        content: "Most founders get AI automation wrong. Here is why...",
        impressions: 5000,
        likes: 180,
        comments: 42,
        shares: 15,
        engagementRate: 7.2,
        postedAt: new Date().toISOString(),
      },
    ],
  };

  const formattedPerf = PerformanceMemoryEngine.formatPromptSection(samplePerf);
  assert(
    formattedPerf.includes("WORKSPACE PERFORMANCE MEMORY") &&
      formattedPerf.includes("7.2% engagement") &&
      formattedPerf.includes("Most founders get AI automation wrong"),
    "PerformanceMemoryEngine formats empirical performance patterns"
  );

  // ── 6. Unified Memory Retrieval Engine ───────────────────────────
  const memoryBundle = await MemoryRetrievalEngine.retrieveContext(
    "How should we announce our new AI feature?",
    context
  );
  assert(
    memoryBundle.brand !== undefined &&
      memoryBundle.formattedSystemContext.includes("WORKSPACE BRAND INTELLIGENCE"),
    "MemoryRetrievalEngine retrieves and bundles workspace intelligence"
  );

  console.log("\n==================================================");
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
