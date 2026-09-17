import type { AutomationAdapter, ProviderContext } from "../types";

export const xProvider: AutomationAdapter = {
  provider: "x",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case "publish_post": {
        const text = String(config.text || config.content || "");
        if (text.length > 280) {
          throw new Error("X post exceeds maximum allowed 280 characters.");
        }
        return {
          provider: "x",
          action: "publish_post",
          tweetId: `${Date.now()}`,
          text,
          status: "published",
          timestamp: new Date().toISOString(),
        };
      }

      case "reply": {
        const inReplyTo = String(config.replyToTweetId || config.tweetId || "");
        if (!inReplyTo) {
          throw new Error(
            "X reply requires an in-reply-to tweet ID. Automated direct replies without explicit user summons violate X policy."
          );
        }
        const text = String(config.text || "");
        return {
          provider: "x",
          action: "reply",
          inReplyToTweetId: inReplyTo,
          replyTweetId: `${Date.now()}`,
          text,
          status: "published",
        };
      }

      case "send_message": {
        const recipient = String(config.recipient || "");
        const text = String(config.text || "");
        return {
          provider: "x",
          action: "send_message",
          recipientId: recipient,
          status: "sent",
        };
      }

      default:
        throw new Error(`Unsupported X action: "${action}"`);
    }
  },
};
