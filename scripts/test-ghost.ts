/**
 * Verification Test Suite for Unified GhostAgent & GhostPolicyEngine
 */

import { GhostAgent } from "../lib/ai/agents/ghost/agent";
import { GhostPolicyEngine } from "../lib/ai/agents/ghost/policy";
import { defaultToolRegistry } from "../lib/ai/tools/index";
import type { AgentContext } from "../lib/ai/core/types";
import type { GhostDecision, GhostInput } from "../lib/ai/agents/ghost/types";

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
  console.log("🧪 Running Unified GhostAgent & Policy Engine Tests");
  console.log("==================================================\n");

  const assistCtx: AgentContext = {
    userId: "test-user-1",
    workspaceId: "test-workspace-1",
    autonomyMode: "assist",
  };

  const autoCtx: AgentContext = {
    userId: "test-user-1",
    workspaceId: "test-workspace-1",
    autonomyMode: "auto",
  };

  // -- 1. Policy Engine: Lead Detection Gating ----------------------
  const leadDecision: GhostDecision = {
    action: "flag_lead",
    confidence: 95,
    reasoning: "User asking about service packages.",
    isLead: true,
    riskLevel: "low",
    suggestedTags: ["pricing"],
  };
  const leadInput: GhostInput = { message: "How much do your services cost?" };

  const leadAutoPolicy = GhostPolicyEngine.evaluate(leadDecision, leadInput, autoCtx);
  assert(
    leadAutoPolicy.decision === "REQUIRE_APPROVAL" &&
      leadAutoPolicy.canDispatchImmediately === false &&
      leadAutoPolicy.requiresHumanApproval === true,
    "Lead inquiry in AUTO mode must require human approval"
  );

  // -- 2. Policy Engine: Complaint Escalation Gating ----------------
  const complaintDecision: GhostDecision = {
    action: "escalate_complaint",
    confidence: 90,
    reasoning: "User reporting broken payment.",
    isLead: false,
    riskLevel: "high",
    suggestedTags: ["complaint"],
  };
  const complaintInput: GhostInput = { message: "My payment failed and your system is broken!" };

  const complaintPolicy = GhostPolicyEngine.evaluate(complaintDecision, complaintInput, autoCtx);
  assert(
    complaintPolicy.decision === "REQUIRE_APPROVAL" &&
      complaintPolicy.requiresHumanApproval === true &&
      complaintPolicy.canDispatchImmediately === false,
    "Complaint in AUTO mode must require human escalation"
  );

  // -- 3. Policy Engine: Routine Auto-Reply in Assist Mode ----------
  const routineReplyDecision: GhostDecision = {
    action: "auto_reply",
    confidence: 95,
    reasoning: "Compliment on new feature.",
    reply: "Thank you so much! Really appreciate it 🙏",
    isLead: false,
    riskLevel: "low",
    suggestedTags: ["engagement"],
  };
  const routineInput: GhostInput = { message: "Love the new update, great work!" };

  const assistReplyPolicy = GhostPolicyEngine.evaluate(routineReplyDecision, routineInput, assistCtx);
  assert(
    assistReplyPolicy.decision === "REQUIRE_APPROVAL" &&
      assistReplyPolicy.requiresHumanApproval === true &&
      assistReplyPolicy.canDispatchImmediately === false,
    "Auto-reply in ASSIST mode must hold draft for human click"
  );

  // -- 4. Policy Engine: Routine Auto-Reply in Auto Mode ------------
  const autoReplyPolicy = GhostPolicyEngine.evaluate(routineReplyDecision, routineInput, autoCtx);
  assert(
    autoReplyPolicy.decision === "ALLOW" &&
      autoReplyPolicy.canDispatchImmediately === true &&
      autoReplyPolicy.requiresHumanApproval === false,
    "High confidence auto-reply in AUTO mode is permitted to dispatch"
  );

  // -- 5. Policy Engine: Low Confidence Auto-Reply Gating -----------
  const lowConfDecision: GhostDecision = {
    action: "auto_reply",
    confidence: 65, // Below 80%
    reasoning: "Ambiguous compliment.",
    reply: "Thanks for reaching out!",
    isLead: false,
    riskLevel: "low",
    suggestedTags: [],
  };
  const lowConfPolicy = GhostPolicyEngine.evaluate(lowConfDecision, routineInput, autoCtx);
  assert(
    lowConfPolicy.decision === "REQUIRE_APPROVAL" &&
      lowConfPolicy.canDispatchImmediately === false &&
      lowConfPolicy.requiresHumanApproval === true,
    "Low confidence (< 80%) auto-reply in AUTO mode must be held for review"
  );

  // -- 6. End-to-End GhostAgent Evaluation --------------------------
  const leadEvalRes = await GhostAgent.evaluate(
    { message: "What is your pricing for consulting?" },
    assistCtx
  );

  assert(leadEvalRes.success === true, "GhostAgent.evaluate() returns success");
  assert(leadEvalRes.data?.action === "flag_lead", "GhostAgent correctly identifies lead action");
  assert(leadEvalRes.data?.isLead === true, "GhostAgent marks isLead as true");
  assert(leadEvalRes.data?.policy.requiresHumanApproval === true, "GhostAgent enforces policy in result");

  // -- 7. Tool Execution via ToolRegistry ---------------------------
  const toolRes = await defaultToolRegistry.execute(
    "get_current_time",
    { timeZone: "UTC" },
    assistCtx
  );
  assert(
    toolRes.success === true,
    "defaultToolRegistry.execute() successfully calls registered tool",
    JSON.stringify(toolRes.error)
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
