/**
 * Verification Test Suite for Connected Memory & Agent Brains (Phase 5B)
 */

import { ChatAgent } from "../lib/ai/agents/chat/agent";
import { GhostAgent } from "../lib/ai/agents/ghost/agent";
import { MemoryFormationEngine } from "../lib/ai/memory/formation";
import { EmbeddingService } from "../lib/ai/memory/embeddings";
import type { AgentContext } from "../lib/ai/core/types";

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
  console.log("🧪 Running Connected Memory & Agent Brain Tests");
  console.log("==================================================\n");

  const context: AgentContext = {
    userId: "test-workspace-agent-mem",
    workspaceId: "test-workspace-agent-mem",
    autonomyMode: "assist",
  };

  // -- 1. Memory Formation: Brand Rule Detection ---------------------
  const ruleResult = MemoryFormationEngine.evaluateText(
    "Don't use the phrase 'revolutionary AI' in any of our drafts."
  );
  assert(
    ruleResult.worthRemembering === true &&
      ruleResult.memoryType === "brand_rule" &&
      ruleResult.importance === 5 &&
      ruleResult.extractedTerms?.forbidden?.includes("revolutionary AI") === true,
    "MemoryFormationEngine classifies brand rule and extracts forbidden term"
  );

  // -- 2. Memory Formation: Target Audience Fact Detection -----------
  const factResult = MemoryFormationEngine.evaluateText(
    "Our target audience consists of Nigerian tech entrepreneurs and founders."
  );
  assert(
    factResult.worthRemembering === true &&
      factResult.memoryType === "fact" &&
      factResult.importance === 5 &&
      Boolean(factResult.extractedTerms?.audience?.includes("Nigerian tech entrepreneurs")),
    "MemoryFormationEngine classifies business fact and extracts target audience"
  );

  // -- 3. Memory Formation: Preference Detection --------------------
  const prefResult = MemoryFormationEngine.evaluateText(
    "From now on, always write in a technical, concise tone for LinkedIn."
  );
  assert(
    prefResult.worthRemembering === true &&
      prefResult.memoryType === "preference" &&
      prefResult.importance === 4,
    "MemoryFormationEngine classifies user tone preference with high importance"
  );

  // -- 4. Memory Formation: Trivial Chatter Discard -----------------
  const trivialResult1 = MemoryFormationEngine.evaluateText("ok thanks");
  const trivialResult2 = MemoryFormationEngine.evaluateText("🔥❤️🙌");
  assert(
    trivialResult1.worthRemembering === false &&
      trivialResult2.worthRemembering === false &&
      trivialResult1.importance === 1,
    "MemoryFormationEngine discards trivial conversational fluff"
  );

  // -- 5. Embedding & Lexical Similarity ----------------------------
  const sim1 = EmbeddingService.lexicalSimilarity(
    "social media growth strategy",
    "Here is our complete strategy for social media growth"
  );
  const sim2 = EmbeddingService.lexicalSimilarity(
    "weather in Lagos",
    "how to bake chocolate cookies"
  );
  assert(
    sim1 > 0.6 && sim2 === 0,
    "EmbeddingService lexical similarity ranks matching concepts high and unrelated zero"
  );

  // -- 6. ChatAgent Execution with Memory Context -------------------
  const chatRes = await ChatAgent.execute(
    {
      messages: [{ role: "user", content: "Draft an announcement about our new feature." }],
    },
    context
  );
  assert(
    chatRes.success === true &&
      Boolean(chatRes.data?.content && chatRes.data.content.length > 20) &&
      chatRes.data?.plan !== undefined,
    "ChatAgent executes with memory context injection"
  );

  // -- 7. GhostAgent Execution with Memory Context ------------------
  const ghostRes = await GhostAgent.evaluate(
    {
      message: "How much does the enterprise plan cost?",
    },
    context
  );
  assert(
    ghostRes.success === true &&
      ghostRes.data?.action === "flag_lead" &&
      ghostRes.data?.policy.requiresHumanApproval === true,
    "GhostAgent executes with memory context and policy gating"
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
