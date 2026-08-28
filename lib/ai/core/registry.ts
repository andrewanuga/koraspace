/**
 * Central Tool Registry & Execution Governance for Socially AI.
 *
 * Responsibilities:
 * - Tool registration, discovery, and schema generation
 * - Pre-execution permission verification
 * - Input validation & normalization
 * - Safe exception handling & latency telemetry
 */

import type {
  AITool,
  AgentContext,
  AgentResult,
  ToolDefinition,
} from "./types";

export class ToolRegistry {
  private tools = new Map<string, AITool<any, any>>();

  /**
   * Register one or more tools into the registry.
   */
  public register(tool: AITool<any, any>): this {
    if (this.tools.has(tool.name)) {
      console.warn(`[ToolRegistry] Overwriting existing tool: "${tool.name}"`);
    }
    this.tools.set(tool.name, tool);
    return this;
  }

  /**
   * Remove a tool from the registry.
   */
  public unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Retrieve a tool by its exact identifier.
   */
  public get<TInput = Record<string, unknown>, TOutput = unknown>(
    name: string
  ): AITool<TInput, TOutput> | undefined {
    return this.tools.get(name) as AITool<TInput, TOutput> | undefined;
  }

  /**
   * Check if a tool exists in the registry.
   */
  public has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get all registered tools.
   */
  public list(): AITool<any, any>[] {
    return Array.from(this.tools.values());
  }

  /**
   * Export OpenRouter/OpenAI-compatible definitions for function calling.
   * Can optionally filter tools based on context or whitelist.
   */
  public getDefinitions(
    filter?: (tool: AITool<any, any>) => boolean
  ): ToolDefinition[] {
    const list = filter ? this.list().filter(filter) : this.list();
    return list.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  /**
   * Execute a tool with full governance, permission validation, and telemetry.
   */
  public async execute<TOutput = unknown>(
    name: string,
    rawInput: unknown,
    context: AgentContext
  ): Promise<AgentResult<TOutput>> {
    const startTime = Date.now();
    const tool = this.get(name);

    // 1. Check Tool Existence
    if (!tool) {
      return {
        success: false,
        error: {
          code: "TOOL_NOT_FOUND",
          message: `Tool "${name}" is not registered in the system.`,
        },
        metadata: {
          latencyMs: Date.now() - startTime,
          toolCallsExecuted: [name],
        },
      };
    }

    // 2. Permission Check (if granular permissions are configured in context)
    if (tool.requiredPermissions && tool.requiredPermissions.length > 0) {
      if (context.permissions) {
        const hasAll = tool.requiredPermissions.every((p) =>
          context.permissions?.includes(p)
        );
        if (!hasAll) {
          return {
            success: false,
            error: {
              code: "PERMISSION_DENIED",
              message: `Execution of tool "${name}" denied. Missing required permissions: ${tool.requiredPermissions.join(
                ", "
              )}`,
            },
            metadata: {
              latencyMs: Date.now() - startTime,
              toolCallsExecuted: [name],
            },
          };
        }
      }
    }

    // 3. Input Validation
    let validatedInput = rawInput;
    if (typeof tool.validateInput === "function") {
      try {
        validatedInput = tool.validateInput(rawInput);
      } catch (validationErr: any) {
        return {
          success: false,
          error: {
            code: "INVALID_TOOL_INPUT",
            message: validationErr?.message || `Invalid arguments for tool "${name}".`,
            details: validationErr,
          },
          metadata: {
            latencyMs: Date.now() - startTime,
            toolCallsExecuted: [name],
          },
        };
      }
    }

    // 4. Safe Tool Execution
    try {
      const result = await tool.execute(validatedInput as Record<string, unknown>, context);
      return {
        ...result,
        metadata: {
          ...result.metadata,
          latencyMs: Date.now() - startTime,
          toolCallsExecuted: [name],
        },
      } as AgentResult<TOutput>;
    } catch (execErr: any) {
      console.error(`[ToolRegistry] Error executing tool "${name}":`, execErr);
      return {
        success: false,
        error: {
          code: "TOOL_EXECUTION_ERROR",
          message: execErr?.message || `Unexpected error executing tool "${name}".`,
          details: execErr,
        },
        metadata: {
          latencyMs: Date.now() - startTime,
          toolCallsExecuted: [name],
        },
      };
    }
  }
}

/** Default shared singleton instance */
export const defaultToolRegistry = new ToolRegistry();
