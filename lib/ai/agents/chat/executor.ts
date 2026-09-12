/**
 * ChatAgent Governed Tool Executor
 *
 * Coordinates execution of tools through the central ToolRegistry:
 * - Permission and scope checks
 * - Schema validation
 * - Telemetry & latency tracking
 * - Structured observation formatting
 */

import type { AgentContext } from "../../core/types";
import { defaultToolRegistry } from "../../tools/index";
import type { AgentStep, ToolInvocation, ToolObservation } from "./types";

export class ChatExecutor {
  /**
   * Safely executes a tool call and returns a structured AgentStep observation.
   */
  public static async executeTool(
    stepIndex: number,
    invocation: ToolInvocation,
    context: AgentContext
  ): Promise<{ step: AgentStep; observationText: string }> {
    const startTime = Date.now();
    const { toolName } = invocation;

    // Policy check for this invocation
    const { decideInvocation } = await import('./policyEngine');
    const plan = (context as any).currentPlan as any;
    const decision = decideInvocation({ toolInvocation: invocation, plan, context });
    if (decision.action !== 'ALLOW') {
      const errorMsg = `Policy ${decision.action}: ${decision.reasons.join('; ')}`;
      const observation: ToolObservation = {
        toolName,
        success: false,
        output: null,
        error: errorMsg,
        latencyMs: Date.now() - startTime,
      };
      const step: AgentStep = {
        stepIndex,
        type: "observation",
        toolInvocation: invocation,
        observation,
        timestamp: Date.now(),
      };
      return { step, observationText: errorMsg };
    }

    const { args } = invocation;
    let success = false;
    let output: any = null;
    let error: string | undefined = undefined;
    let observationText = "";

    // 1. Check Tool Existence in Registry
    if (!defaultToolRegistry.has(toolName)) {
      error = `Tool "${toolName}" is not registered in ToolRegistry.`;
      observationText = `Error: ${error}`;
    } else {
      // 2. Execute via ToolRegistry governance
      try {
        const execResult = await defaultToolRegistry.execute(toolName, args, context);
        success = execResult.success;
        if (execResult.success && execResult.data) {
          output = execResult.data;
          observationText = typeof execResult.data === "string"
            ? execResult.data
            : JSON.stringify(execResult.data, null, 2);
        } else {
          error = execResult.error?.message || "Tool execution failed";
          output = execResult.error;
          observationText = `Error: ${error}`;
        }
      } catch (err: any) {
        error = err?.message || "Unexpected exception during tool execution";
        observationText = `Error: ${error}`;
      }
    }

    const latencyMs = Date.now() - startTime;

    const observation: ToolObservation = {
      toolName,
      success,
      output,
      error,
      latencyMs,
    };

    const step: AgentStep = {
      stepIndex,
      type: "observation",
      toolInvocation: invocation,
      observation,
      timestamp: Date.now(),
    };

    return { step, observationText };
  }
}
