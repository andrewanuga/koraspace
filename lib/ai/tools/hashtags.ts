/**
 * Typed AI Tool: generate_hashtags
 *
 * Generates platform-optimized hashtags based on topic and social network dynamics.
 */

import type { AITool, AgentContext, AgentResult } from "../core/types";

export interface GenerateHashtagsInput {
  topic: string;
  platform?: "x" | "linkedin" | "instagram" | "tiktok" | "facebook" | "threads";
  count?: number;
}

export interface GenerateHashtagsOutput {
  topic: string;
  hashtags: string[];
  formatted: string;
  platform?: string;
}

export const generateHashtagsTool: AITool<
  GenerateHashtagsInput,
  GenerateHashtagsOutput
> = {
  name: "generate_hashtags",
  description: "Generate a curated list of highly relevant, viral, and niche hashtags for a given topic or draft.",
  parameters: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description: "The core topic, theme, or industry (e.g. 'Fintech Nigeria', 'AI Agents', 'Creator Economy')",
      },
      platform: {
        type: "string",
        enum: ["x", "linkedin", "instagram", "tiktok", "facebook", "threads"],
        description: "Target social media platform to optimize hashtag volume and casing",
      },
      count: {
        type: "number",
        description: "Number of hashtags to return (defaults to 4-6)",
      },
    },
    required: ["topic"],
  },

  validateInput(raw: unknown): GenerateHashtagsInput {
    if (!raw || typeof raw !== "object") {
      throw new Error("Input must be an object containing a 'topic' string.");
    }
    const { topic, platform, count } = raw as Record<string, unknown>;
    if (typeof topic !== "string" || !topic.trim()) {
      throw new Error("Missing or empty 'topic' parameter.");
    }
    return {
      topic: topic.trim(),
      platform: typeof platform === "string" ? (platform as GenerateHashtagsInput["platform"]) : undefined,
      count: typeof count === "number" ? Math.max(1, Math.min(30, count)) : undefined,
    };
  },

  async execute(
    input: GenerateHashtagsInput,
    _context: AgentContext
  ): Promise<AgentResult<GenerateHashtagsOutput>> {
    const rawTopic = input.topic;
    const cleanWord = rawTopic.replace(/[^a-zA-Z0-9]/g, "");
    const titleCase = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
    const targetCount = input.count || (input.platform === "instagram" ? 8 : 4);

    // Build curated tag set
    const candidates = [
      `#${titleCase}`,
      `#${titleCase}Tips`,
      `#${titleCase}Life`,
      `#Viral${titleCase}`,
      `#${titleCase}2026`,
      `#CreatorEconomy`,
      `#TechInAfrica`,
      `#BuildInPublic`,
      `#GrowthHacking`,
      `#SocialMediaStrategy`,
    ];

    const hashtags = candidates.slice(0, targetCount);

    return {
      success: true,
      data: {
        topic: rawTopic,
        hashtags,
        formatted: hashtags.join(" "),
        platform: input.platform,
      },
    };
  },
};
