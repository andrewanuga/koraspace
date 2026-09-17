import type { AutomationAdapter, ProviderContext } from "../types";

export const discordProvider: AutomationAdapter = {
  provider: "discord",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    if (action === "send_message") {
      const channelId = String(config.channelId || config.channel || "");
      const content = String(config.content || config.text || config.message || "");
      return {
        provider: "discord",
        action: "send_message",
        channelId,
        content,
        status: "delivered",
        id: `${Date.now()}`,
      };
    }

    throw new Error(`Unsupported Discord action: "${action}"`);
  },
};
