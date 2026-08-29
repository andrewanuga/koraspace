/**
 * Koraspace AI Tool Registry Compatibility Facade
 *
 * Re-exports the canonical modular ToolRegistry and provides backward-compatible
 * accessors for legacy callers. All tools are registered and managed via `lib/ai/tools/index.ts`.
 */

import { defaultToolRegistry } from "./tools/index";
import type { AgentContext } from "./core/types";

// Canonical tool registry definitions
export const AI_TOOLS = defaultToolRegistry.getDefinitions();

/**
 * Backward-compatible tool execution facade that routes through defaultToolRegistry.
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: AgentContext
): Promise<unknown> {
  const result = await defaultToolRegistry.execute(name, args, context);
  if (!result.success) {
    const msg = typeof result.error === "string" ? result.error : result.error?.message || `Tool execution failed: ${name}`;
    throw new Error(msg);
  }
  return result.data;
}

export { defaultToolRegistry };
export * from "./tools/index";
