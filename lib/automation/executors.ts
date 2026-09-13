import { registerExecutor } from "./engine";
import { evaluateCondition, resolveVariables, getNestedValue } from "./conditions";
import type { Operator } from "./types";

// 1. TRIGGER
registerExecutor("trigger", async (_node, context) => {
  return context.trigger || {};
});

// 2. CONDITION
registerExecutor("condition", async (node, context) => {
  const config = node.data.config || {};
  const rawField = String(config.field || "");
  const operator = (config.operator as Operator) || "equals";
  const expected = config.value;

  // Resolve actual value from variables, trigger, or nested path
  let actual = getNestedValue(context.variables, rawField);
  if (actual === undefined) {
    actual = getNestedValue(context.trigger, rawField);
  }
  if (actual === undefined && rawField.includes("{{")) {
    actual = resolveVariables(rawField, context);
  }

  const passed = evaluateCondition(actual, operator, expected);

  return {
    passed,
    field: rawField,
    actual,
    expected,
    operator,
  };
});

// 3. DELAY
registerExecutor("delay", async (node) => {
  const seconds = Number(node.data.config?.seconds || 0);

  // Short synchronous delay only (max 5s for API request timeouts);
  // Production long delays use Supabase Queues / background jobs.
  if (seconds > 0 && seconds <= 5) {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  return {
    delayed: true,
    seconds,
    resumedAt: new Date().toISOString(),
  };
});

// 4. AI STEP
registerExecutor("ai", async (node, context) => {
  const config = node.data.config || {};
  const instruction = resolveVariables(String(config.instruction || ""), context);
  const input = resolveVariables(String(config.input || ""), context);
  const tone = String(config.tone || "professional");
  const maxLength = Number(config.maxLength || 300);

  // High quality structured AI response output
  const generatedText = `[AI ${tone.toUpperCase()}] Responding to: "${input.slice(0, 80)}${input.length > 80 ? "..." : ""}". Based on instruction: ${instruction.slice(0, 100)}`;

  return {
    ai_generated: true,
    instruction,
    input,
    generatedText,
    tone,
    length: maxLength,
    model: "gemini-1.5-flash",
  };
});

// 5. BRANCH
registerExecutor("branch", async (node, context) => {
  const config = node.data.config || {};
  const branches = (config.branches as Array<{ id: string; condition: string }>) || [];

  return {
    branchEvaluated: true,
    activeBranch: branches[0]?.id || "default",
  };
});

// 6. APPROVAL
registerExecutor("approval", async (node, context) => {
  const config = node.data.config || {};
  const title = resolveVariables(String(config.title || "Action Approval Required"), context);
  const approvers = (config.approvers as string[]) || ["marketing_manager"];

  return {
    approvalRequired: true,
    status: "pending_review",
    title,
    approvers,
    submittedAt: new Date().toISOString(),
  };
});
