import type { AutomationAdapter, ProviderContext } from "../types";

export const pinterestProvider: AutomationAdapter = {
  provider: "pinterest",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    if (action === "create_pin") {
      const boardId = String(config.boardId || "default");
      const title = String(config.title || "");
      const mediaUrl = String(config.mediaUrl || config.imageUrl || "");
      const link = String(config.link || "");

      return {
        provider: "pinterest",
        action: "create_pin",
        pinId: `pin_${Date.now()}`,
        boardId,
        title,
        mediaUrl,
        link,
        status: "created",
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error(`Unsupported Pinterest action: "${action}"`);
  },
};
