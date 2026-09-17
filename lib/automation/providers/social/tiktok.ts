import type { AutomationAdapter, ProviderContext } from "../types";

export const tiktokProvider: AutomationAdapter = {
  provider: "tiktok",

  async execute(
    action: string,
    config: Record<string, unknown>,
    context: ProviderContext
  ): Promise<Record<string, unknown>> {
    if (context.credential) {
      const scopes = context.credential.scopes || [];
      if (!scopes.includes("video.publish") && scopes.length > 0) {
        throw new Error(
          "TikTok action blocked: Missing required 'video.publish' permission."
        );
      }

      // Check if client is audited / approved for public direct post
      const isAudited = context.credential.metadata?.postingApproved ?? true;
      if (!isAudited) {
        throw new Error(
          "TikTok direct posting requires audited client status. Unaudited apps are restricted to private creator inbox drafts."
        );
      }
    }

    if (action === "publish_video") {
      const videoUrl = String(config.videoUrl || "");
      const title = String(config.title || config.caption || "");
      return {
        provider: "tiktok",
        action: "publish_video",
        publishId: `v_pub_${Date.now()}`,
        status: "processing_upload",
        title,
        videoUrl,
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error(`Unsupported TikTok action: "${action}"`);
  },
};
