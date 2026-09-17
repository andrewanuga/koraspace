import type { AutomationAdapter, ProviderContext } from "../types";

export const youtubeProvider: AutomationAdapter = {
  provider: "youtube",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    if (action === "publish_video") {
      const title = String(config.title || "");
      const videoUrl = String(config.videoUrl || "");
      const privacy = String(config.privacy || "public");

      // Quota validation simulation
      if (config.simulateQuotaExceeded) {
        throw Object.assign(new Error("YouTube Data API upload daily quota exceeded."), {
          code: "quotaExceeded",
          retryable: false,
        });
      }

      return {
        provider: "youtube",
        action: "publish_video",
        videoId: `yt_${Date.now()}`,
        title,
        privacy,
        videoUrl,
        quotaCost: 1600,
        status: "uploaded",
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error(`Unsupported YouTube action: "${action}"`);
  },
};
