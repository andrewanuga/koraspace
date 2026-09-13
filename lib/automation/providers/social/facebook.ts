import type { AutomationAdapter, ProviderContext } from "../types";

export const facebookProvider: AutomationAdapter = {
  provider: "facebook",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case "publish_post": {
        const text = String(config.text || config.content || "");
        return {
          provider: "facebook",
          action: "publish_post",
          postId: `fb_post_${Date.now()}`,
          status: "published",
          content: text,
          timestamp: new Date().toISOString(),
        };
      }

      case "reply_comment": {
        const commentId = String(config.commentId || "");
        const reply = String(config.text || config.message || "");
        return {
          provider: "facebook",
          action: "reply_comment",
          commentId,
          reply,
          status: "sent",
        };
      }

      case "send_message": {
        return {
          provider: "facebook",
          action: "send_message",
          recipient: String(config.recipient || ""),
          status: "sent",
        };
      }

      default:
        throw new Error(`Unsupported Facebook action: "${action}"`);
    }
  },
};
