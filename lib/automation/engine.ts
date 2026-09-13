import type {
  AutomationWorkflow,
  AutomationNode,
  AutomationContext,
} from "./types";
import { assertSafeAction } from "./safety";

export type NodeExecutor = (
  node: AutomationNode,
  context: AutomationContext
) => Promise<Record<string, unknown>>;

const executors = new Map<string, NodeExecutor>();

export function registerExecutor(key: string, executor: NodeExecutor) {
  executors.set(key, executor);
}

export function getExecutor(node: AutomationNode): NodeExecutor | undefined {
  if (node.type === "action" && node.data.provider && node.data.action) {
    const specificKey = `${node.data.provider}:${node.data.action}`;
    if (executors.has(specificKey)) return executors.get(specificKey);
  }
  return executors.get(node.type);
}

function getOutgoers(
  workflow: AutomationWorkflow,
  nodeId: string,
  conditionPassed?: boolean
): AutomationNode[] {
  return workflow.edges
    .filter((edge) => {
      if (edge.source !== nodeId) return false;
      // Handle condition source handles: 'true' vs 'false'
      if (conditionPassed !== undefined && edge.sourceHandle) {
        if (conditionPassed && edge.sourceHandle === "false") return false;
        if (!conditionPassed && edge.sourceHandle === "true") return false;
      }
      return true;
    })
    .map((edge) => workflow.nodes.find((node) => node.id === edge.target))
    .filter((node): node is AutomationNode => Boolean(node));
}

export async function executeWorkflow(
  workflow: AutomationWorkflow,
  context: AutomationContext,
  onStepComplete?: (
    node: AutomationNode,
    status: "success" | "failed" | "skipped",
    input: Record<string, unknown>,
    output: Record<string, unknown>,
    error?: string
  ) => Promise<void>
): Promise<AutomationContext> {
  const triggers = workflow.nodes.filter((node) => node.type === "trigger");

  if (!triggers.length) {
    throw new Error("Workflow validation error: Workflow has no trigger configured.");
  }

  // Enforce recursion depth safety
  if (context.depth >= 10) {
    throw new Error("Execution halted: Maximum automation recursion depth (10) exceeded.");
  }

  const visited = new Set<string>();

  async function executeNode(node: AutomationNode): Promise<void> {
    // Prevent cycles in single workflow execution
    if (visited.has(node.id)) {
      return;
    }
    visited.add(node.id);

    // Track execution chain
    context.executionChain.push(node.id);

    // Safety Sentinel verification
    assertSafeAction({
      provider: node.data.provider,
      type: node.data.action || node.type,
      config: node.data.config,
    });

    const executor = getExecutor(node);
    if (!executor) {
      const err = `No executor registered for node type "${node.type}" (provider: ${node.data.provider || "none"}, action: ${node.data.action || "none"}).`;
      if (onStepComplete) {
        await onStepComplete(node, "failed", node.data.config || {}, {}, err);
      }
      throw new Error(err);
    }

    try {
      const input = {
        ...(node.data.config || {}),
        trigger: context.trigger,
        variables: context.variables,
      };

      const result = await executor(node, context);

      context.results[node.id] = result;
      Object.assign(context.variables, result);

      if (context.logs) {
        context.logs.push({
          nodeId: node.id,
          status: "success",
          timestamp: new Date().toISOString(),
          message: `Executed ${node.data.label}`,
        });
      }

      if (onStepComplete) {
        await onStepComplete(node, "success", input, result);
      }

      // Branch logic: if condition, check passed boolean
      let conditionPassed: boolean | undefined = undefined;
      if (node.type === "condition") {
        conditionPassed = Boolean(result.passed);
      }

      const nextNodes = getOutgoers(workflow, node.id, conditionPassed);
      for (const next of nextNodes) {
        await executeNode(next);
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (context.logs) {
        context.logs.push({
          nodeId: node.id,
          status: "failed",
          timestamp: new Date().toISOString(),
          message: errorMessage,
        });
      }

      if (onStepComplete) {
        await onStepComplete(node, "failed", node.data.config || {}, {}, errorMessage);
      }

      // Respect failure policy
      if (workflow.settings?.failurePolicy === "stop") {
        throw err;
      }
    }
  }

  for (const trigger of triggers) {
    await executeNode(trigger);
  }

  return context;
}
