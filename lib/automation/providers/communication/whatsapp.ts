import type { AutomationAdapter, ProviderContext } from "../types";

export const whatsappProvider: AutomationAdapter = {
  provider: "whatsapp",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case "send_message":
      case "send_template": {
        const to = String(config.to || config.recipient || "");
        const body = String(config.message || config.template || "");
        return {
          provider: "whatsapp",
          action,
          to,
          body,
          status: "queued_for_delivery",
          timestamp: new Date().toISOString(),
        };
      }

      default:
        throw new Error(`Unsupported WhatsApp action: "${action}"`);
    }
  },
};
