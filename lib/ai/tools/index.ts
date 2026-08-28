/**
 * Tool Registry Initializer
 *
 * Registers all typed AI tools into the default shared ToolRegistry.
 */

import { defaultToolRegistry } from "../core/registry";
import { generateHashtagsTool } from "./hashtags";

// Register typed tools
defaultToolRegistry.register(generateHashtagsTool);

export { defaultToolRegistry };
export { generateHashtagsTool };
