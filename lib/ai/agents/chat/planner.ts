/**
 * ChatAgent Intent & Plan Decomposition Engine
 *
 * Analyzes incoming user requests to formulate structured execution plans:
 * - Detects user intent (research, fact check, competitor analysis, scheduling, virality evaluation)
 * - Identifies candidate tools from the registry
 * - Assesses risk level and permission boundaries
 */

import type { ChatPlan, InputMessage } from "./types";
import { defaultToolRegistry } from "../../tools/index";

export class ChatPlanner {
  /**
   * Evaluates the conversation messages and formulates an initial execution plan.
   */
  public static plan(messages: InputMessage[]): ChatPlan {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const lower = lastUserMsg.toLowerCase();

    const requiredTools: string[] = [];
    const plannedSteps: string[] = [];
    let intent = "general_conversation";
    let isComplex = false;
    let estimatedRisk: "low" | "medium" | "high" = "low";

    // 1. Competitor Analysis Intent
    if (
      lower.includes("competitor") ||
      lower.includes("audit") ||
      lower.includes("benchmark") ||
      (lower.includes("vs") && (lower.includes("handle") || lower.includes("account")))
    ) {
      intent = "competitor_analysis";
      isComplex = true;
      requiredTools.push("analyze_competitor");
      if (lower.includes("http://") || lower.includes("https://")) {
        requiredTools.push("scrape_url");
        plannedSteps.push("1. Scrape competitor web/social landing page");
      }
      plannedSteps.push("2. Analyze competitor strategy, engagement, and gaps");
      plannedSteps.push("3. Synthesize actionable differentiation strategies");
    }

    // 2. Virality & Content Optimization Intent
    else if (
      lower.includes("virality") ||
      lower.includes("score my post") ||
      lower.includes("rate this") ||
      lower.includes("will this go viral") ||
      lower.includes("critique") ||
      lower.includes("improve draft")
    ) {
      intent = "virality_evaluation";
      isComplex = true;
      requiredTools.push("evaluate_virality");
      plannedSteps.push("1. Evaluate draft virality score (hook, CTA, readability)");
      plannedSteps.push("2. Identify specific weaknesses (e.g. weak hook or low conversion odds)");
      plannedSteps.push("3. Formulate optimized revision");
    }

    // 3. Fact Verification Intent
    else if (
      lower.includes("verify") ||
      lower.includes("is it true") ||
      lower.includes("fact check") ||
      lower.includes("claim") ||
      lower.includes("source")
    ) {
      intent = "fact_verification";
      isComplex = true;
      requiredTools.push("verify_claim");
      plannedSteps.push("1. Parse factual claims in statement");
      plannedSteps.push("2. Cross-reference with authoritative sources");
      plannedSteps.push("3. Present verdict with supporting evidence");
    }

    // 4. Repurpose Longform Intent
    else if (
      lower.includes("repurpose") ||
      lower.includes("turn this into") ||
      lower.includes("convert to thread") ||
      lower.includes("make a carousel")
    ) {
      intent = "content_repurposing";
      isComplex = true;
      requiredTools.push("repurpose_longform");
      plannedSteps.push("1. Extract core arguments and narrative arc from longform text");
      plannedSteps.push("2. Structure platform-native derivatives (thread, post, script)");
    }

    // 5. Temporal / Weather Intent
    else if (lower.includes("time") || lower.includes("what day") || lower.includes("timezone")) {
      intent = "temporal_lookup";
      requiredTools.push("get_current_time");
      plannedSteps.push("1. Fetch current temporal context");
    } else if (lower.includes("weather") || lower.includes("temperature in") || lower.includes("forecast")) {
      intent = "weather_lookup";
      requiredTools.push("get_weather");
      plannedSteps.push("1. Fetch real-time weather metrics for target location");
    }

    // 6. Mutating action checks
    if (lower.includes("schedule") || lower.includes("publish now") || lower.includes("delete")) {
      estimatedRisk = "medium";
    }

    // Filter requiredTools to only those actually available in the ToolRegistry
    const validatedTools = requiredTools.filter((t) => defaultToolRegistry.has(t));

    return {
      intent,
      isComplex,
      requiredTools: validatedTools,
      plannedSteps,
      estimatedRisk,
    };
  }
}
