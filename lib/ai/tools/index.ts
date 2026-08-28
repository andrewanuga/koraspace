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
import { repurposeLongformTool } from "./repurpose";
import { verifyClaimTool } from "./verify";

// Register typed tools
defaultToolRegistry.register(generateHashtagsTool);
defaultToolRegistry.register(getCurrentTimeTool);
defaultToolRegistry.register(getWeatherTool);
defaultToolRegistry.register(scrapeUrlTool);
defaultToolRegistry.register(evaluateViralityTool);
defaultToolRegistry.register(analyzeCompetitorTool);
defaultToolRegistry.register(repurposeLongformTool);
defaultToolRegistry.register(verifyClaimTool);

export { defaultToolRegistry };
export {
  generateHashtagsTool,
  getCurrentTimeTool,
  getWeatherTool,
  scrapeUrlTool,
  evaluateViralityTool,
  analyzeCompetitorTool,
  repurposeLongformTool,
  verifyClaimTool,
};
