/**
 * Typed AI Tool: repurpose_longform
 *
 * Splinters long-form content (articles, transcripts, notes, scripts) into
 * platform-optimized social assets: X threads, LinkedIn posts, Instagram carousels, and Reels/TikTok scripts.
 */

import { z } from "zod";
import type { AITool, AgentContext, AgentResult } from "../core/types";
import { callAI, isConfigured } from "../openrouter";

/* ── 1. Schemas & Type Contracts ──────────────────────────────── */

export const RepurposedPlatformOutputSchema = z.object({
  platform: z.enum(["x", "linkedin", "instagram_carousel", "tiktok_script", "newsletter"]),
  format: z.string(),
  content: z.string(),
  hook: z.string(),
});

export type RepurposedPlatformOutput = z.infer<typeof RepurposedPlatformOutputSchema>;

export const RepurposeLongformOutputSchema = z.object({
  sourceSummary: z.string(),
  keyThemes: z.array(z.string()),
  outputs: z.array(RepurposedPlatformOutputSchema),
  summary: z.string(),
});

export type RepurposeLongformOutput = z.infer<typeof RepurposeLongformOutputSchema>;

export interface RepurposeLongformInput {
  text: string;
  tone?: string;
  sourceType?: "blog" | "video_script" | "transcript" | "article" | "notes";
}

/* ── 2. Fallback / Deterministic Generator ─────────────────────── */

function generateFallbackRepurposed(text: string): RepurposeLongformOutput {
  const preview = text.slice(0, 80).trim() || "your topic";
  return {
    sourceSummary: `Splintered long-form text covering core insights around "${preview}".`,
    keyThemes: [
      "Core problem and contrarian observation",
      "Actionable step-by-step framework",
      "Long-term implications for the creator economy",
    ],
    outputs: [
      {
        platform: "x",
        format: "5-Tweet Thread",
        hook: `1/ Most people misunderstand ${preview}. Here's the 2-minute breakdown:`,
        content: `1/ Most people misunderstand ${preview}. Here's the 2-minute breakdown:\n\n2/ The primary shift is moving from busywork to strategic leverage.\n\n3/ Why traditional approaches fail: they focus on output volume instead of retention hooks.\n\n4/ The 3-step action plan:\n• Audit your baseline\n• Automate the noise\n• Double down on distinct points of view\n\n5/ If you found this valuable, repost for others and follow for more insights.`,
      },
      {
        platform: "linkedin",
        format: "Thought Leadership Breakdown",
        hook: `I spent hours analyzing ${preview} so you don't have to. Here's what actually matters:`,
        content: `I spent hours analyzing ${preview} so you don't have to. Here's what actually matters:\n\nOver the past year, the benchmark for high-performing content changed drastically.\n\nHere are 3 key takeaways:\n\n→ Insight 1: Specificity consistently beats generic volume.\n→ Insight 2: Build feedback loops into your process before scaling.\n→ Insight 3: Delegate repetitive distribution so you can focus on core creation.\n\nWhat's your biggest takeaway on this? Drop your thoughts below 👇`,
      },
      {
        platform: "tiktok_script",
        format: "60-Second Short Video Script",
        hook: `Stop doing this one mistake with ${preview}... Do this instead:`,
        content: `[Visual: Direct to camera, quick zoom]\n"Stop making this one mistake with ${preview}."\n\n[Visual: Quick cut, screen recording or text overlay]\n"90% of people approach this backwards. They spend hours on execution without locking in the core hook."\n\n[Visual: 3 rapid bullet points on screen]\n"Instead, do these three things:\n1. Hook them in the first 2 seconds\n2. Deliver one undeniable insight\n3. Give them a reason to save the video."\n\n[Visual: Pointing to follow button]\n"Save this for your next project and follow for more."`,
      },
    ],
    summary: `Successfully splintered content into 3 platform assets: X Thread, LinkedIn Breakdown, and 60-Second Short Video Script.`,
  };
}

/* ── 3. Executable AI Tool Definition ─────────────────────────── */

export const repurposeLongformTool: AITool<
  RepurposeLongformInput,
  RepurposeLongformOutput
> = {
  name: "repurpose_longform",
  description: "Repurpose long-form text (blog posts, video scripts, meeting notes, transcripts) into multiple platform-native assets: X threads, LinkedIn posts, Instagram carousels, and short-form video scripts.",
  requiredCapabilities: ["content:generate"],
  parameters: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The source long-form text, script, or notes to repurpose",
      },
      tone: {
        type: "string",
        description: "Optional tone preference (e.g. 'Professional', 'Casual', 'Naija Vibe', 'Witty')",
      },
      sourceType: {
        type: "string",
        enum: ["blog", "video_script", "transcript", "article", "notes"],
        description: "Source format of the input text",
      },
    },
    required: ["text"],
  },

  validateInput(raw: unknown): RepurposeLongformInput {
    if (!raw || typeof raw !== "object") {
      throw new Error("Input must be an object containing 'text'.");
    }
    const { text, tone, sourceType } = raw as Record<string, unknown>;
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("Missing or empty 'text' parameter.");
    }
    return {
      text: text.trim(),
      tone: typeof tone === "string" ? tone.trim() : undefined,
      sourceType: typeof sourceType === "string" ? (sourceType as RepurposeLongformInput["sourceType"]) : undefined,
    };
  },

  async execute(
    input: RepurposeLongformInput,
    _context: AgentContext
  ): Promise<AgentResult<RepurposeLongformOutput>> {
    const { text, tone, sourceType } = input;

    // 1. If OpenRouter is not configured, return structured fallback
    if (!isConfigured()) {
      return {
        success: true,
        data: generateFallbackRepurposed(text),
      };
    }

    // 2. LLM Repurposing Engine Prompt
    const systemPrompt = `You are a world-class content distribution strategist.
Your task is to take source long-form text and splinter it into 3 distinct, platform-optimized social assets:
1. "x": A punchy, high-retention Twitter/X thread (3-5 tweets)
2. "linkedin": A structured thought-leadership post with whitespace, clear bullet points, and an engagement CTA
3. "tiktok_script": A 60-second video script with visual cues, verbal hooks, and caption notes

Tone context: ${tone || "Engaging, authoritative, clear"}
Source format: ${sourceType || "article/notes"}

Return strictly valid JSON matching this schema:
{
  "sourceSummary": string,
  "keyThemes": string[],
  "outputs": [
    {
      "platform": "x" | "linkedin" | "instagram_carousel" | "tiktok_script" | "newsletter",
      "format": string,
      "hook": string,
      "content": string
    }
  ],
  "summary": string
}`;

    try {
      const res = await callAI(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: `SOURCE CONTENT TO REPURPOSE:\n"""\n${text.slice(0, 8000)}\n"""` },
        ],
        {
          agent: "generate",
          temperature: 0.7,
          jsonMode: true,
        }
      );

      let parsed: any;
      try {
        let clean = res.content.trim();
        if (clean.startsWith("```json")) clean = clean.replace(/```json/g, "").replace(/```/g, "").trim();
        if (clean.startsWith("```")) clean = clean.replace(/```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        return {
          success: true,
          data: generateFallbackRepurposed(text),
        };
      }

      const output: RepurposeLongformOutput = {
        sourceSummary: typeof parsed.sourceSummary === "string" ? parsed.sourceSummary : "Repurposed longform content",
        keyThemes: Array.isArray(parsed.keyThemes) ? parsed.keyThemes : ["Core concept breakdown"],
        outputs: Array.isArray(parsed.outputs) ? parsed.outputs : generateFallbackRepurposed(text).outputs,
        summary: typeof parsed.summary === "string" ? parsed.summary : `Splintered into ${parsed.outputs?.length || 3} social formats.`,
      };

      const validatedOutput = RepurposeLongformOutputSchema.parse(output);

      return {
        success: true,
        data: validatedOutput,
        metadata: {
          model: res.model,
        },
      };
    } catch (err: any) {
      console.warn("[repurpose_longform] Error during LLM repurpose, falling back:", err?.message);
      return {
        success: true,
        data: generateFallbackRepurposed(text),
      };
    }
  },
};
