import type { AutomationAdapter, ProviderContext } from "../types";

export const slackProvider: AutomationAdapter = {
  provider: "slack",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case "send_message": {
        const channel = String(config.channel || "#general");
        const text = String(config.text || config.message || "");
        return {
          provider: "slack",
          action: "send_message",
          channel,
          text,
          status: "delivered",
          ts: `${Date.now()}`,
        };
      }

      case "create_channel": {
        const name = String(config.name || "");
        return {
          provider: "slack",
          action: "create_channel",
          channelId: `C${Date.now()}`,
          name,
          status: "created",
        };
      }

      default:
        throw new Error(`Unsupported Slack action: "${action}"`);
    }
  },
};
