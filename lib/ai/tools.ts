/**
 * Koraspace AI Tool Registry Exports
 *
 * Re-exports the canonical modular ToolRegistry. All tools are registered and managed via `lib/ai/tools/index.ts`.
 */

import { defaultToolRegistry } from "./tools/index";

export { defaultToolRegistry };
export * from "./tools/index";

