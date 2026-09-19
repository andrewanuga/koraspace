import type { AutomationAdapter, ProviderContext } from "../types";

/**
 * Koraspace Enterprise Slack Integration Adapter
 *
 * Implements high-performance Slack operations utilizing Bot Token Scopes:
 * - chat:write, chat:write.customize, assistant:write
 * - channels:manage, channels:join, channels:write.topic, channels:write.invites
 * - canvases:read, canvases:write
 * - bookmarks:read, bookmarks:write
 * - users:read, users:read.email, users:write
 */

const SLACK_API_BASE = "https://slack.com/api";

async function slackFetch(
  endpoint: string,
  token: string,
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const res = await fetch(`${SLACK_API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Slack API Error [${endpoint}]: ${data.error || "Request failed"}`);
  }
  return data;
}

export const slackProvider: AutomationAdapter = {
  provider: "slack",

  async execute(
    action: string,
    config: Record<string, unknown>,
    context: ProviderContext
  ): Promise<Record<string, unknown>> {
    const token =
      String(config.token || config.access_token || context.auth?.access_token || process.env.SLACK_BOT_TOKEN || "");

    switch (action) {
      // ── 1. Send Message (with Block Kit & Customization) ─────────────────
      case "send_message": {
        const channel = String(config.channel || "#general");
        const text = String(config.text || config.message || "");
        const blocks = config.blocks as Array<Record<string, unknown>> | undefined;
        const thread_ts = config.thread_ts ? String(config.thread_ts) : undefined;
        const username = config.username ? String(config.username) : "Koraspace AI";
        const icon_emoji = config.icon_emoji ? String(config.icon_emoji) : ":sparkles:";
        const icon_url = config.icon_url ? String(config.icon_url) : undefined;

        if (token) {
          const payload: Record<string, unknown> = {
            channel,
            text,
            ...(blocks ? { blocks } : {}),
            ...(thread_ts ? { thread_ts } : {}),
            username,
            ...(icon_url ? { icon_url } : { icon_emoji }),
          };
          const res = await slackFetch("chat.postMessage", token, payload);
          return {
            provider: "slack",
            action: "send_message",
            channel,
            ts: res.ts,
            status: "delivered",
            timestamp: new Date().toISOString(),
          };
        }

        return {
          provider: "slack",
          action: "send_message",
          channel,
          text,
          status: "delivered",
          ts: `${Date.now()}`,
        };
      }

      // ── 2. Assistant / App Agent Response ────────────────────────────────
      case "assistant_respond": {
        const channel = String(config.channel || "");
        const text = String(config.text || config.message || "");
        const thread_ts = String(config.thread_ts || "");

        if (token && channel && thread_ts) {
          const res = await slackFetch("chat.postMessage", token, {
            channel,
            thread_ts,
            text,
            username: "Koraspace Assistant",
            icon_emoji: ":robot_face:",
          });
          return {
            provider: "slack",
            action: "assistant_respond",
            channel,
            ts: res.ts,
            status: "replied",
          };
        }
        return {
          provider: "slack",
          action: "assistant_respond",
          status: "queued",
        };
      }

      // ── 3. Channel Management ────────────────────────────────────────────
      case "create_channel": {
        const name = String(config.name || "")
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "-")
          .slice(0, 80);
        const is_private = Boolean(config.is_private);

        if (token && name) {
          const res = await slackFetch("conversations.create", token, { name, is_private });
          const channelData = res.channel as Record<string, unknown>;
          return {
            provider: "slack",
            action: "create_channel",
            channelId: channelData?.id,
            name: channelData?.name || name,
            status: "created",
          };
        }

        return {
          provider: "slack",
          action: "create_channel",
          channelId: `C${Date.now()}`,
          name,
          status: "created",
        };
      }

      case "set_channel_topic": {
        const channel = String(config.channel || config.channelId || "");
        const topic = String(config.topic || "");

        if (token && channel && topic) {
          await slackFetch("conversations.setTopic", token, { channel, topic });
          return {
            provider: "slack",
            action: "set_channel_topic",
            channel,
            topic,
            status: "updated",
          };
        }
        return { provider: "slack", action: "set_channel_topic", status: "simulated" };
      }

      case "join_channel": {
        const channel = String(config.channel || config.channelId || "");
        if (token && channel) {
          await slackFetch("conversations.join", token, { channel });
          return { provider: "slack", action: "join_channel", channel, status: "joined" };
        }
        return { provider: "slack", action: "join_channel", status: "simulated" };
      }

      case "invite_to_channel": {
        const channel = String(config.channel || config.channelId || "");
        const users = Array.isArray(config.users) ? config.users.join(",") : String(config.users || "");
        if (token && channel && users) {
          await slackFetch("conversations.invite", token, { channel, users });
          return { provider: "slack", action: "invite_to_channel", channel, users, status: "invited" };
        }
        return { provider: "slack", action: "invite_to_channel", status: "simulated" };
      }

      // ── 4. Canvases (Content Briefs & Marketing Docs) ───────────────────
      case "create_canvas": {
        const channel_id = String(config.channel || config.channel_id || "");
        const title = String(config.title || "Koraspace Content Campaign Canvas");
        const document_content = config.content as Record<string, unknown> | undefined;

        if (token && channel_id) {
          const res = await slackFetch("canvases.create", token, {
            channel_id,
            title,
            ...(document_content ? { document_content } : {}),
          });
          return {
            provider: "slack",
            action: "create_canvas",
            canvas_id: res.canvas_id,
            title,
            status: "created",
          };
        }
        return {
          provider: "slack",
          action: "create_canvas",
          canvas_id: `F${Date.now()}`,
          title,
          status: "simulated",
        };
      }

      // ── 5. Bookmarks ─────────────────────────────────────────────────────
      case "create_bookmark": {
        const channel_id = String(config.channel || config.channel_id || "");
        const title = String(config.title || "Koraspace Dashboard");
        const link = String(config.link || config.url || "https://koraspace.site");
        const emoji = config.emoji ? String(config.emoji) : ":chart_with_upwards_trend:";

        if (token && channel_id && link) {
          const res = await slackFetch("bookmarks.add", token, {
            channel_id,
            title,
            link,
            emoji,
            type: "link",
          });
          return {
            provider: "slack",
            action: "create_bookmark",
            bookmark: res.bookmark,
            status: "added",
          };
        }
        return { provider: "slack", action: "create_bookmark", status: "simulated" };
      }

      // ── 6. User Lookup & Presence ────────────────────────────────────────
      case "lookup_user": {
        const email = String(config.email || "");
        if (token && email) {
          const res = await slackFetch("users.lookupByEmail", token, { email });
          return {
            provider: "slack",
            action: "lookup_user",
            user: res.user,
            status: "found",
          };
        }
        return { provider: "slack", action: "lookup_user", status: "not_found" };
      }

      case "set_presence": {
        const presence = config.presence === "away" ? "away" : "auto";
        if (token) {
          await slackFetch("users.setPresence", token, { presence });
          return { provider: "slack", action: "set_presence", presence, status: "updated" };
        }
        return { provider: "slack", action: "set_presence", status: "simulated" };
      }

      default:
        throw new Error(`Unsupported Slack action: "${action}"`);
    }
  },
};
