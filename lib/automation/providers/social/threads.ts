import type { AutomationAdapter, ProviderContext } from "../types";

export const threadsProvider: AutomationAdapter = {
  provider: "threads",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case "publish_post": {
        const text = String(config.text || config.content || "");
        return {
          provider: "threads",
          action: "publish_post",
          threadId: `th_${Date.now()}`,
          text,
          status: "published",
        };
      }

      case "reply": {
        return {
          provider: "threads",
          action: "reply",
          replyToId: String(config.replyToId || ""),
          text: String(config.text || ""),
          status: "published",
        };
      }

      default:
        throw new Error(`Unsupported Threads action: "${action}"`);
    }
  },
};
