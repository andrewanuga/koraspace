import type { RepurposePlatform } from "./types";

export function buildAnalysisPrompt(content: string): string {
  return `You are the KoraSpace Content Intelligence AI.
Analyze this creator source content and identify its strongest ideas, viral hooks, core takeaways, and multi-platform angles.

Respond with ONLY a valid JSON object matching this schema without markdown codeblocks or extra text:
{
  "summary": "1-2 sentence executive summary of the content",
  "key_points": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "topics": ["Topic 1", "Topic 2", "Topic 3"],
  "tone": "e.g. Inspiring, Educational, Punchy, Authoritative",
  "target_audience": "e.g. Solo founders, creators, software engineers",
  "hooks": [
    "Hook 1: Curiosity-driven hook",
    "Hook 2: Contrarian or bold statement hook",
    "Hook 3: How-to or step-by-step hook"
  ],
  "angles": [
    {
      "id": "angle_contrarian",
      "title": "Contrarian / Unpopular Truth",
      "hook": "Why most people fail at...",
      "angle_type": "contrarian",
      "description": "Challenges common assumptions with counter-intuitive proof."
    },
    {
      "id": "angle_educational",
      "title": "Actionable Framework",
      "hook": "The 3-step system I used to...",
      "angle_type": "educational",
      "description": "Breaks down complex insights into a tactical playbook."
    },
    {
      "id": "angle_story",
      "title": "Storytelling & Lesson",
      "hook": "I almost gave up when...",
      "angle_type": "storytelling",
      "description": "Uses narrative arc to deliver high emotional resonance."
    }
  ],
  "suggested_platforms": ["x", "linkedin", "instagram", "tiktok"]
}

SOURCE CONTENT:
${content}`;
}

export function buildRepurposePrompt({
  source,
  platform,
  brandVoice,
  selectedAngle,
  selectedHook,
}: {
  source: string;
  platform: RepurposePlatform;
  brandVoice?: string;
  selectedAngle?: string;
  selectedHook?: string;
}): string {
  const platformInstructions: Record<RepurposePlatform, string> = {
    instagram: `Format as an Instagram Single Post:
- Line 1: Attention-grabbing opening hook.
- Body: 3-5 short, readable paragraphs with line breaks.
- Call to Action: Clear engagement prompt (comment, save, share).
- Hashtags: 5-8 hyper-relevant hashtags placed at the bottom.`,

    "instagram-carousel": `Format as an Instagram Carousel (7-9 Slides):
Slide 1 (Cover): Bold hook + Sub-headline.
Slide 2-7 (Value): One clear takeaway or framework per slide with short punchy bullets.
Slide 8 (Summary): High-impact recap.
Slide 9 (CTA): "Save for later & follow for more".
Format clearly with "--- SLIDE [N] ---" headers.`,

    tiktok: `Format as a TikTok / Reels / Shorts Short Video Script:
- Hook (0-3s): High energy visual cue & vocal hook.
- Problem / Context (3-15s): Fast context setup.
- Core Value / Twist (15-45s): Main insights with on-screen visual suggestions in brackets [like this].
- Climax / CTA (45-60s): Fast, natural takeaway & prompt to follow.
- Include a suggested Caption and 4-6 Hashtags.`,

    youtube: `Format as a YouTube Video Blueprint / Script:
- 3 Catchy Video Titles (high CTR).
- Opening Hook (first 30 seconds to prevent drop-off).
- Core Outline with timestamp markers and talking points.
- Video Description with summary, timestamps, and links placeholder.
- Thumbnail Concept (Text on image + visual idea).`,

    x: `Format as an X (Twitter) Thread (5-7 Posts):
1/7: Main viral hook tweet that makes readers stop scrolling.
2/7 to 6/7: Numbered insight tweets with maximum punchiness and single-line spacing.
7/7: Summary takeaway tweet + Call to Repost and Follow.`,

    linkedin: `Format as a High-Dwell-Time LinkedIn Post:
- Hook: 1-2 sentence compelling opener that makes reader click "...see more".
- Re-hook: Immediate context or vulnerability.
- Core Body: Spaced out single-sentence bullets or numbered lessons.
- The Pivot / Key Learning: Practical business or career takeaway.
- CTA: Conversational question asking for audience perspective.
- 3-5 hashtags.`,

    blog: `Format as an SEO-Optimized Long-Form Blog Post:
# Title: SEO & Click-worthy Headline
## Introduction: Hook, problem statement, and article promise.
## Key Section 1 (H2) & Takeaways
## Key Section 2 (H2) & Takeaways
## Key Section 3 (H2) & Tactical Steps
## Conclusion & Actionable Next Steps`,

    newsletter: `Format as an Email Newsletter:
Subject Line: (Give 2 punchy options)
Preview Text: (Under 90 characters)
Greeting: Hey friend,
Personal Opening: Conversational story bridging to the core insight.
Deep Dive: The central lesson or framework.
Actionable Takeaway: One thing the reader can do today.
Sign-off & P.S. note with question or CTA.`,
  };

  return `You are KoraSpace AI, the premier content repurposing and strategy copilot.
Your mission is to transform the provided source content into an exceptional, publication-ready piece for: ${platform.toUpperCase()}.

BRAND VOICE:
${brandVoice || "Insightful, modern, punchy, conversational, and authentic."}

${selectedHook ? `USER SELECTED HOOK TO ANCHOR ON:\n"${selectedHook}"\n` : ""}
${selectedAngle ? `USER SELECTED CONTENT ANGLE:\n"${selectedAngle}"\n` : ""}

PLATFORM SPECIFIC GUIDELINES:
${platformInstructions[platform]}

CRITICAL RULES:
1. Do NOT write generic summaries. Elevate and re-imagine the core ideas for native engagement on ${platform}.
2. Make formatting clean with natural line breaks.
3. Deliver the final ready-to-use content directly.

SOURCE CONTENT:
${source}`;
}
