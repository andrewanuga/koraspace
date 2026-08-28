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
import { evaluateViralityTool } from "./virality";
import { analyzeCompetitorTool } from "./competitor";

// Register typed tools
defaultToolRegistry.register(generateHashtagsTool);
defaultToolRegistry.register(getCurrentTimeTool);
defaultToolRegistry.register(getWeatherTool);
defaultToolRegistry.register(scrapeUrlTool);
defaultToolRegistry.register(evaluateViralityTool);
defaultToolRegistry.register(analyzeCompetitorTool);

export { defaultToolRegistry };
export {
  generateHashtagsTool,
  getCurrentTimeTool,
  getWeatherTool,
  scrapeUrlTool,
  evaluateViralityTool,
  analyzeCompetitorTool,
};
