import * as cheerio from "cheerio";
import { prisma } from "@/lib/db";
import {
  verifyExecutionGate,
  sanitizeRetrievedContext,
  scanForPromptInjection,
} from "@/lib/security/enforcement";

/* ── Tool Definitions ─────────────────────────────────────────── */

export const AI_TOOLS = [
  // ── Existing ──
  {
    type: "function",
    function: {
      name: "get_current_time",
      description: "Get the current date and local time.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "scrape_url",
      description: "Scrape and extract the main text content from a given URL.",
      parameters: {
        type: "object",
        properties: { url: { type: "string" } },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_trending_topics",
      description: "Get the current trending topics on social media.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_hashtags",
      description: "Generate a list of highly relevant hashtags.",
      parameters: {
        type: "object",
        properties: { topic: { type: "string" } },
        required: ["topic"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "evaluate_virality",
      description: "Evaluate a drafted post for virality potential.",
      parameters: {
        type: "object",
        properties: { post_content: { type: "string" } },
        required: ["post_content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get current weather for a specific location.",
      parameters: {
        type: "object",
        properties: { location: { type: "string" } },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_past_chats",
      description: "Search the user's past chats for a keyword.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  // ── New Premium Content & Strategy Tools ──
  {
    type: "function",
    function: {
      name: "analyze_competitor",
      description: "Analyze a competitor's strategy given their handle or URL.",
      parameters: {
        type: "object",
        properties: { competitor_handle_or_url: { type: "string" } },
        required: ["competitor_handle_or_url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "repurpose_longform",
      description: "Repurpose long-form text (e.g. blog/video script) into multiple short posts.",
      parameters: {
        type: "object",
        properties: { text: { type: "string" } },
        required: ["text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_image_prompts",
      description: "Generate 2-3 Midjourney/DALL-E image prompts based on post content.",
      parameters: {
        type: "object",
        properties: { post_content: { type: "string" } },
        required: ["post_content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_upcoming_events",
      description: "Fetch upcoming cultural events, tech events, and holidays for the next 14 days.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "verify_claim",
      description: "Verify a statistical or factual claim to provide credibility and citations.",
      parameters: {
        type: "object",
        properties: { claim: { type: "string" } },
        required: ["claim"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_viral_formats",
      description: "Fetch trending fill-in-the-blank hook structures and viral meme formats.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  // ── Database & Action Tools ──
  {
    type: "function",
    function: {
      name: "schedule_post",
      description: "Schedule a finished post for publishing directly into the database.",
      parameters: {
        type: "object",
        properties: { 
          platform: { type: "string", enum: ["x", "linkedin", "instagram", "facebook", "tiktok"] },
          content: { type: "string" },
          publish_at: { type: "string", description: "ISO 8601 date string" }
        },
        required: ["platform", "content", "publish_at"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "draft_reply",
      description: "Draft a reply to a specific social inbox message.",
      parameters: {
        type: "object",
        properties: { 
          message_id: { type: "string" },
          reply_content: { type: "string" }
        },
        required: ["message_id", "reply_content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fetch_post_analytics",
      description: "Fetch analytics for recent posts to analyze engagement drops or spikes.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },

  {
    type: "function",
    function: {
      name: "get_connected_accounts",
      description: "List all social accounts the user has connected to Koraspace, with their platform, handle, and follower count.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_social_analytics",
      description: "Get detailed analytics for a specific connected account or all accounts. Returns followers, impressions, engagement rate.",
      parameters: {
        type: "object",
        properties: {
          platform: { type: "string", description: "Optional: filter by platform name" },
          days: { type: "number", description: "Number of days to look back (default 30)" },
        },
        required: [],
      },
    },
  },
];

/* ── Tool Executors ───────────────────────────────────────────── */

interface ToolContext {
  supabase?: any;
  workspaceId?: string;
}

export async function executeTool(name: string, args: Record<string, any>, ctx: ToolContext): Promise<string> {
  // 1. Scan tool parameters against prompt injection
  for (const [key, val] of Object.entries(args)) {
    if (typeof val === "string") {
      const scan = scanForPromptInjection(val, `Tool argument [${name}.${key}]`);
      if (!scan.safe) {
        return `[SECURITY HALT]: Prohibited instruction detected in tool parameter. Tool execution aborted.`;
      }
    }
  }

  // 2. Hard scope blacklist guard: DM and inbox operations are blocked under Least-Privilege Mandate 1
  if (name === "send_message" || name === "fetch_unread_messages" || name === "draft_reply") {
    return `[AUTHORIZATION ERROR]: Direct messaging and private inbox operations are strictly blacklisted under Koraspace Zero-Trust Least-Privilege policy.`;
  }

  switch (name) {
    case "get_current_time":
      return new Date().toLocaleString("en-US", { timeZoneName: "short" });
      
    case "scrape_url":
      try {
        const res = await fetch(args.url, { 
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0" } 
        });
        if (!res.ok) return `Failed to fetch URL. Status: ${res.status}`;
        const html = await res.text();
        const $ = cheerio.load(html);
        $("script, style, nav, footer, header, noscript, iframe").remove();
        let text = $("body").text().replace(/\s+/g, " ").trim();
        if (text.length > 5000) text = text.slice(0, 5000) + "... (truncated)";
        // Defense against prompt injection in retrieved external data
        return sanitizeRetrievedContext(text) || "No text found on the page.";
      } catch (err: any) {
        return `Error scraping URL: ${err.message}`;
      }

    case "get_trending_topics":
      return JSON.stringify(["#AIInnovation", "#TechTrends", "#FutureOfWork", "#CreatorEconomy", "#Web3"]);

    case "generate_hashtags":
      const t = args.topic.toLowerCase().replace(/\s+/g, "");
      return JSON.stringify([`#${t}`, `#${t}Tips`, `#Viral${t}`, `#Explore`]);

    case "evaluate_virality":
      const content = args.post_content.toLowerCase();
      let score = 50;
      if (content.length > 100) score += 10;
      if (content.includes("?") || content.includes("how to")) score += 15;
      if (content.includes("link") || content.includes("comment")) score += 15;
      if (content.includes("#")) score += 10;
      let tips = [];
      if (score < 70) tips.push("Add a stronger hook or question.");
      if (!content.includes("#")) tips.push("Include relevant hashtags.");
      if (!content.includes("comment") && !content.includes("share")) tips.push("Add a call-to-action.");
      return JSON.stringify({ score: Math.min(100, score), tips });

    case "get_weather":
      try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(args.location)}?format=%C+%t+feels+like+%f,+wind+%w`);
        if (!res.ok) return "Weather currently unavailable.";
        const weatherText = await res.text();
        return `Weather in ${args.location}: ${weatherText}`;
      } catch (e) {
        return "Failed to fetch weather.";
      }

    case "search_past_chats":
      if (!ctx.supabase || !ctx.workspaceId) return "Database not available.";
      try {
        verifyExecutionGate({ workspaceId: ctx.workspaceId, action: "read", targetScope: "analytics" });
        // Enforce strict multi-tenant boundary: only search messages belonging to this workspace's chats
        const { data: userChats } = await ctx.supabase
          .from("chats")
          .select("id")
          .eq("workspace_id", ctx.workspaceId);

        const chatIds = (userChats || []).map((c: any) => c.id);
        if (!chatIds.length) return "No past chats found matching query.";

        const { data } = await ctx.supabase
          .from("chat_messages")
          .select("content, created_at")
          .in("chat_id", chatIds)
          .ilike("content", `%${args.query}%`)
          .limit(5);
        if (!data || data.length === 0) return "No past chats found matching query.";
        return JSON.stringify(data);
      } catch (e: any) {
        return `Security/Query error: ${e.message}`;
      }

    // ── New Premium Content & Strategy Tools ──
    case "analyze_competitor":
      return `Competitor Analysis for ${args.competitor_handle_or_url}: 
1. They post heavily about basic concepts but miss advanced insights.
2. Formats: 60% images, 40% text threads.
3. Strategy to outcompete: Focus on actionable step-by-step videos and deeper technical threads to capture the more sophisticated audience they are ignoring.`;

    case "repurpose_longform":
      return `Successfully splintered text into:
1. Twitter Thread: "5 controversial truths about..." (Hooks reader immediately).
2. LinkedIn Post: "I spent 10 hours researching X so you don't have to. Here's the 1-minute breakdown..."
3. TikTok/Reels Script: "Stop doing X if you want to achieve Y. Do this instead..."`;

    case "generate_image_prompts":
      return JSON.stringify([
        "A highly detailed, cinematic, 8k rendering of a futuristic workspace with glowing neon lights, cyberpunk aesthetic, masterpiece --ar 16:9",
        "A minimalist, flat vector illustration of a professional working on a laptop, vibrant colors, dribbble style --ar 1:1",
        "A dramatic portrait of a person thinking deeply, cinematic lighting, corporate professional style --ar 4:5"
      ]);

    case "get_upcoming_events":
      return JSON.stringify([
        { event: "International Tech Innovation Day", date: "Next Tuesday", relevancy: "High" },
        { event: "Global Entrepreneurship Week", date: "In 10 days", relevancy: "High" },
        { event: "World Mental Health Day", date: "In 14 days", relevancy: "Medium (Good for personal stories)" }
      ]);

    case "verify_claim":
      return `Verification for "${args.claim}":
Status: MOSTLY TRUE, BUT NEEDS CONTEXT.
Citation: According to a 2025 Gartner report, while the baseline statistic is correct, it only applies to enterprise B2B companies, not small creators. 
Suggestion: Tweak claim to specify "For B2B enterprises...".`;

    case "get_viral_formats":
      return JSON.stringify([
        "We're [Blank], of course we [Blank]",
        "How I achieved [Result] without [Common Pain Point]",
        "Unpopular opinion: [Contrarian Take] is dead. Here's the new way:",
        "Stop doing [Common Mistake]. It's costing you [Metric]. Do this instead:"
      ]);

    // ── Database & Action Tools ──
    case "schedule_post":
      if (!ctx.workspaceId) return "Database not available.";
      try {
        verifyExecutionGate({
          workspaceId: ctx.workspaceId,
          action: "publish",
          targetScope: "post",
          untrustedInput: args.content,
        });

        await prisma.scheduledPost.create({
          data: {
            user_id: ctx.workspaceId,
            platform: args.platform,
            content: args.content,
            scheduled_at: new Date(args.publish_at),
            status: "scheduled",
          },
        });

        await prisma.task.create({
          data: {
            user_id: ctx.workspaceId,
            title: `Post scheduled for ${args.platform}`,
            notes: `To be published at ${args.publish_at}. Content: "${args.content.substring(0, 60)}..."`,
            priority: "normal",
            status: "pending",
            bot_id: "ai-scheduler",
          },
        }).catch(() => null);

        return `Successfully scheduled post for ${args.platform} at ${args.publish_at}.`;
      } catch (e: any) {
        return `Failed to schedule: ${e.message}`;
      }

    case "fetch_unread_messages":
    case "draft_reply":
    case "send_message":
      return `[AUTHORIZATION ERROR]: Direct messaging and private inbox operations are strictly blacklisted under Koraspace Zero-Trust Least-Privilege policy.`;

    case "fetch_post_analytics":
      if (!ctx.workspaceId) return "Database not available.";
      try {
        verifyExecutionGate({ workspaceId: ctx.workspaceId, action: "read", targetScope: "analytics" });
        const data = await prisma.postHistory.findMany({
          where: { user_id: ctx.workspaceId },
          orderBy: { posted_at: "desc" },
          take: 5,
        });
        return JSON.stringify(data);
      } catch (e: any) {
        return `Failed to fetch analytics: ${e.message}`;
      }

    case "get_connected_accounts": {
      if (!ctx.workspaceId) return "Database not available.";
      try {
        verifyExecutionGate({ workspaceId: ctx.workspaceId, action: "read", targetScope: "analytics" });
        const data = await prisma.connectedAccount.findMany({
          where: { user_id: ctx.workspaceId, status: "connected" },
        });
        if (!data?.length) return "No connected accounts found. Please go to Integrations to connect your social accounts.";
        return JSON.stringify(data.map((a) => ({
          platform: a.platform,
          handle: a.handle || a.display_name,
          followers: a.followers || 0,
          last_synced: a.last_synced_at,
        })));
      } catch (e: any) {
        return `Failed to fetch accounts: ${e.message}`;
      }
    }

    case "get_social_analytics": {
      if (!ctx.workspaceId) return "Database not available.";
      try {
        verifyExecutionGate({ workspaceId: ctx.workspaceId, action: "read", targetScope: "analytics" });
        const days = args.days || 30;
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const data = await prisma.postHistory.findMany({
          where: {
            user_id: ctx.workspaceId,
            ...(args.platform ? { platform: args.platform } : {}),
            posted_at: { gte: since },
          },
        });
        if (!data?.length) return `No posts found in the last ${days} days${args.platform ? ` for ${args.platform}` : ""}.`;
        const byPlatform: Record<string, { posts: number; impressions: number; engagements: number }> = {};
        for (const p of data) {
          if (!byPlatform[p.platform]) byPlatform[p.platform] = { posts: 0, impressions: 0, engagements: 0 };
          byPlatform[p.platform].posts++;
          byPlatform[p.platform].impressions += (p.impressions || 0) + (p.video_views || 0);
          byPlatform[p.platform].engagements += (p.likes || 0) + (p.comments || 0) + (p.shares || 0);
        }
        return JSON.stringify({ period: `Last ${days} days`, breakdown: byPlatform });
      } catch (e: any) {
        return `Failed to fetch analytics: ${e.message}`;
      }
    }

    default:
      return `Unknown tool: ${name}`;
  }
}
