/**
 * Tool Registry Initializer
 *
 * Registers all typed AI tools into the default shared ToolRegistry.
 */

import { defaultToolRegistry } from "../core/registry";
import { generateHashtagsTool } from "./hashtags";
import { getCurrentTimeTool } from "./time";
import { getWeatherTool } from "./weather";
import { scrapeUrlTool } from "./web";

// Register typed tools
defaultToolRegistry.register(generateHashtagsTool);
defaultToolRegistry.register(getCurrentTimeTool);
defaultToolRegistry.register(getWeatherTool);
defaultToolRegistry.register(scrapeUrlTool);

export { defaultToolRegistry };
export { generateHashtagsTool, getCurrentTimeTool, getWeatherTool, scrapeUrlTool };
