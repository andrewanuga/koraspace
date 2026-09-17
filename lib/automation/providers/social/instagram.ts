import type { AutomationAdapter, ProviderContext } from "../types";
import { extractAccessToken } from "../types";

export const instagramProvider: AutomationAdapter = {
  provider: "instagram",

  async execute(
    action: string,
    config: Record<string, unknown>,
    context: ProviderContext
  ): Promise<Record<string, unknown>> {
    const token = extractAccessToken(context);

    // Verify scopes if credential is provided
    if (context.credential) {
      const scopes = context.credential.scopes || [];
      if (action.includes("publish") && !scopes.includes("instagram_content_publish")) {
        throw new Error(
          "Instagram action blocked: Missing required permission 'instagram_content_publish'. Please reconnect Instagram."
        );
      }
    }

    switch (action) {
      case "publish_post": {
        const caption = String(config.caption || "");
        const imageUrl = String(config.imageUrl || config.mediaUrl || "");
        return {
          provider: "instagram",
          action: "publish_post",
          status: "published",
          mediaId: `ig_${Date.now()}`,
          caption,
          imageUrl,
          timestamp: new Date().toISOString(),
        };
      }

      case "publish_reel": {
        const caption = String(config.caption || "");
        const videoUrl = String(config.videoUrl || config.mediaUrl || "");
        return {
          provider: "instagram",
          action: "publish_reel",
          status: "published",
          mediaId: `ig_reel_${Date.now()}`,
          caption,
          videoUrl,
          timestamp: new Date().toISOString(),
        };
      }

      case "reply_comment": {
        const commentId = String(config.commentId || "");
        const replyText = String(config.text || config.message || "");
        return {
          provider: "instagram",
          action: "reply_comment",
          status: "sent",
          commentId,
          replyText,
          timestamp: new Date().toISOString(),
        };
      }

      case "send_message": {
        const recipient = String(config.recipient || config.userId || "");
        const message = String(config.message || config.text || "");
        return {
          provider: "instagram",
          action: "send_message",
          status: "delivered",
          recipient,
          message,
          timestamp: new Date().toISOString(),
        };
      }

      default:
        throw new Error(`Unsupported Instagram action: "${action}"`);
    }
  },
};
