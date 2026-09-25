import type { ChatPlan, PolicyDecision, PolicyAction, PolicyReasonCode } from './types';
import type { AgentContext, Capability } from '../../core/types';
import type { ToolInvocation } from './types';
import { defaultToolRegistry } from '../../tools/index';

/** Context for invocation decision */
export interface InvocationContext {
  toolInvocation: ToolInvocation;
  plan: ChatPlan;
  context: AgentContext;
}

/** Set of mutating tool names */
const MUTATING_TOOLS = new Set<string>([
  'publish_post',
  'delete_post',
  'schedule_event',
  'publish_linkedin_post',
]);

/**
 * Check if the agent context holds a given capability.
 */
function hasCapability(context: AgentContext, cap: Capability): boolean {
  return (context.capabilities ?? []).includes(cap);
}

/**
 * Decide whether a plan is permissible before the ReAct loop.
 */
export function decidePlan(plan: ChatPlan, context: AgentContext): PolicyDecision {
  const reasonCodes: PolicyReasonCode[] = [];
  const reasons: string[] = [];

  // Verify required tools exist in registry and check capability requirements
  for (const toolName of plan.requiredTools) {
    const tool = defaultToolRegistry.get(toolName);
    if (!tool) {
      reasonCodes.push('UNKNOWN_TOOL');
      reasons.push(`Tool "${toolName}" is not registered.`);
      continue;
    }

    if (tool.requiredCapabilities && tool.requiredCapabilities.length > 0) {
      for (const cap of tool.requiredCapabilities) {
        if (!hasCapability(context, cap)) {
          if (!reasonCodes.includes('MISSING_CAPABILITY')) {
            reasonCodes.push('MISSING_CAPABILITY');
          }
          reasons.push(`Missing required capability "${cap}" for tool "${toolName}".`);
        }
      }
    }
  }

  // High‑risk plans are denied outright
  if (plan.estimatedRisk === 'high') {
    reasonCodes.push('HIGH_RISK_ACTION');
    reasons.push('Plan estimated risk is high');
    return { action: 'DENY', reasonCodes, reasons };
  }

  // Mutating tools require confirmation
  const hasMutating = plan.requiredTools.some(t => MUTATING_TOOLS.has(t));
  if (hasMutating) {
    reasonCodes.push('CONFIRMATION_REQUIRED');
    reasons.push('Plan contains mutating tool(s)');
    return { action: 'REQUIRE_CONFIRMATION', reasonCodes, reasons, requiredConfirmation: 'User must approve the plan before execution.' };
  }

  // Any other collected errors lead to denial
  if (reasonCodes.length > 0) {
    return { action: 'DENY', reasonCodes, reasons };
  }

  // Default allow
  return { action: 'ALLOW', reasonCodes: [], reasons: [] };
}

/**
 * Decide whether a specific tool invocation is permissible.
 */
export function decideInvocation(ctx: InvocationContext): PolicyDecision {
  const { toolInvocation, plan, context } = ctx;
  const reasonCodes: PolicyReasonCode[] = [];
  const reasons: string[] = [];

  // Capability check for the invoked tool
  const tool = defaultToolRegistry.get(toolInvocation.toolName);
  if (!tool) {
    reasonCodes.push('UNKNOWN_TOOL');
    reasons.push(`Tool "${toolInvocation.toolName}" is not registered.`);
  } else if (tool.requiredCapabilities && tool.requiredCapabilities.length > 0) {
    for (const cap of tool.requiredCapabilities) {
      if (!hasCapability(context, cap)) {
        if (!reasonCodes.includes('MISSING_CAPABILITY')) {
          reasonCodes.push('MISSING_CAPABILITY');
        }
        reasons.push(`Missing required capability "${cap}" for tool "${toolInvocation.toolName}".`);
      }
    }
  }

  // Must be declared in plan if plan is present
  if (plan && plan.requiredTools && !plan.requiredTools.includes(toolInvocation.toolName)) {
    reasonCodes.push('PLAN_DEVIATION');
    reasons.push(`Tool "${toolInvocation.toolName}" not declared in plan.`);
  }

  // Approval fingerprint validation if present
  if (plan?.approval) {
    const expected = plan.approval.planFingerprint;
    const { computePlanFingerprint } = require('./types');
    const actual = computePlanFingerprint({ ...plan, approval: undefined });
    if (expected !== actual) {
      reasonCodes.push('STALE_APPROVAL');
      reasons.push('Plan fingerprint does not match approval.');
    }
  } else {
    // No approval – mutating tool needs confirmation
    if (MUTATING_TOOLS.has(toolInvocation.toolName)) {
      reasonCodes.push('CONFIRMATION_REQUIRED');
      reasons.push('Mutating tool invoked without prior approval.');
    }
  }

  // Decision precedence
  if (reasonCodes.includes('UNKNOWN_TOOL')) {
    return { action: 'DENY', reasonCodes, reasons };
  }
  if (reasonCodes.includes('PLAN_DEVIATION')) {
    return { action: 'DENY', reasonCodes, reasons };
  }
  if (reasonCodes.includes('STALE_APPROVAL')) {
    return { action: 'DENY', reasonCodes, reasons };
  }
  if (reasonCodes.includes('CONFIRMATION_REQUIRED')) {
    return { action: 'REQUIRE_CONFIRMATION', reasonCodes, reasons, requiredConfirmation: 'User must approve this mutating action.' };
  }
  if (reasonCodes.includes('MISSING_CAPABILITY')) {
    return { action: 'DENY', reasonCodes, reasons };
  }

  return { action: 'ALLOW', reasonCodes: [], reasons: [] };
}
