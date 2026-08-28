/**
 * Tool Registry Initializer
 *
 * Registers all typed AI tools into the default shared ToolRegistry.
 */

import { defaultToolRegistry } from "../core/registry";
import { generateHashtagsTool } from "./hashtags";
import { getCurrentTimeTool } from "./time";

// Register typed tools
defaultToolRegistry.register(generateHashtagsTool);
defaultToolRegistry.register(getCurrentTimeTool);

export { defaultToolRegistry };
export { generateHashtagsTool, getCurrentTimeTool };
