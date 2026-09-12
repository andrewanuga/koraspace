/**
 * Verification Test Suite for Unified ChatAgent, ChatPlanner, and ChatExecutor
 */

import { ChatAgent } from "../lib/ai/agents/chat/agent";
import { ChatPlanner } from "../lib/ai/agents/chat/planner";
import { ChatExecutor } from "../lib/ai/agents/chat/executor";
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
  console.log("🧪 Running Unified ChatAgent & Planner Tests");
  console.log("==================================================\n");

  const context: AgentContext = {
    userId: "test-user-chat",
    workspaceId: "test-workspace-chat",
    autonomyMode: "assist",
  };

  // ── 1. Planner: Competitor Analysis Decomposition ────────────────
  const plan1 = ChatPlanner.plan([
    { role: "user", content: "Can you analyze our competitor https://acme.com and find strategic gaps?" },
  ]);
  assert(
    plan1.intent === "competitor_analysis" &&
      plan1.requiredTools.includes("analyze_competitor") &&
      plan1.requiredTools.includes("scrape_url"),
    "ChatPlanner decomposes competitor research intent into scrape_url + analyze_competitor"
  );

  // ── 2. Planner: Virality Evaluation Intent ────────────────────────
  const plan2 = ChatPlanner.plan([
    { role: "user", content: "Score my post and tell me if this draft will go viral" },
  ]);
  assert(
    plan2.intent === "virality_evaluation" && plan2.requiredTools.includes("evaluate_virality"),
    "ChatPlanner decomposes virality intent into evaluate_virality"
  );

  // ── 3. Planner: Fact Verification Intent ──────────────────────────
  const plan3 = ChatPlanner.plan([
    { role: "user", content: "Please verify if the claim that TikTok was banned in 2024 is true" },
  ]);
  assert(
    plan3.intent === "fact_verification" && plan3.requiredTools.includes("verify_claim"),
    "ChatPlanner decomposes fact checking into verify_claim"
  );

  // ── 4. Planner: Temporal & Weather Intent ─────────────────────────
  const plan4 = ChatPlanner.plan([
    { role: "user", content: "What day of the week is it and what is the current time?" },
  ]);
  assert(
    plan4.intent === "temporal_lookup" && plan4.requiredTools.includes("get_current_time"),
    "ChatPlanner identifies temporal lookup into get_current_time"
  );

  // ── 5. Planner: Repurposing Intent ────────────────────────────────
  const plan5 = ChatPlanner.plan([
    { role: "user", content: "Please repurpose this long article into a 5-tweet thread and LinkedIn post" },
  ]);
  assert(
    plan5.intent === "content_repurposing" && plan5.requiredTools.includes("repurpose_longform"),
    "ChatPlanner identifies repurposing intent into repurpose_longform"
  );

  // ── 6. Executor: Safe Tool Invocation ─────────────────────────────
  const execResult = await ChatExecutor.executeTool(
    1,
    {
      toolName: "get_current_time",
      args: { timeZone: "UTC" },
      timestamp: Date.now(),
    },
    context
  );
  assert(
    execResult.step.observation?.success === true &&
      execResult.step.observation.output.formatted !== undefined &&
      execResult.step.observation.latencyMs >= 0,
    "ChatExecutor successfully runs registered tool with observation trace"
  );

  // ── 7. Executor: Unregistered Tool Handling ───────────────────────
  const unregResult = await ChatExecutor.executeTool(
    2,
    {
      toolName: "non_existent_tool_xyz",
      args: {},
      timestamp: Date.now(),
    },
    context
  );
  assert(
    Boolean(
      unregResult.step.observation?.success === false &&
        unregResult.step.observation.error?.includes("not registered")
    ),
    "ChatExecutor safely handles unregistered tool requests without crashing"
  );

  // ── 8. ChatAgent.execute() End-to-End Fallback ───────────────────
  const chatRes = await ChatAgent.execute(
    {
      messages: [{ role: "user", content: "How do I build an audience on LinkedIn?" }],
    },
    context
  );
  assert(
    chatRes.success === true &&
      chatRes.data?.content.length! > 20 &&
      chatRes.data?.plan !== undefined,
    "ChatAgent.execute() returns structured output with plan and draft content"
  );

  // ── 9. ChatAgent.executeTool() Direct Dispatch ───────────────────
  const hashtagsRes = await ChatAgent.executeTool(
    "generate_hashtags",
    { topic: "AI productivity", platform: "linkedin", count: 5 },
    context
  );
  assert(
    hashtagsRes.success === true && (hashtagsRes.data as any).hashtags?.length > 0,
    "ChatAgent.executeTool() successfully dispatches generate_hashtags tool"
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
