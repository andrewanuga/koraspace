import type { AutomationAdapter, ProviderContext } from "../types";

export const mailchimpProvider: AutomationAdapter = {
  provider: "mailchimp",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case "add_subscriber": {
        const email = String(config.email || "");
        const listId = String(config.listId || "default_audience");
        const tags = (config.tags as string[]) || [];
        return {
          provider: "mailchimp",
          action: "add_subscriber",
          subscriberId: `sub_${Date.now()}`,
          email,
          listId,
          tags,
          status: "subscribed",
        };
      }

      case "remove_subscriber": {
        return {
          provider: "mailchimp",
          action: "remove_subscriber",
          email: String(config.email || ""),
          status: "unsubscribed",
        };
      }

      case "send_campaign": {
        return {
          provider: "mailchimp",
          action: "send_campaign",
          campaignId: String(config.campaignId || `camp_${Date.now()}`),
          status: "sent",
        };
      }

      default:
        throw new Error(`Unsupported Mailchimp action: "${action}"`);
    }
  },
};
