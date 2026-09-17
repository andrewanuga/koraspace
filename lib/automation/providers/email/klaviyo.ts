import type { AutomationAdapter, ProviderContext } from "../types";

export const klaviyoProvider: AutomationAdapter = {
  provider: "klaviyo",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case "create_profile": {
        const email = String(config.email || "");
        const firstName = String(config.firstName || config.first_name || "");
        return {
          provider: "klaviyo",
          action: "create_profile",
          profileId: `klav_${Date.now()}`,
          email,
          firstName,
          status: "created",
        };
      }

      case "send_event": {
        return {
          provider: "klaviyo",
          action: "send_event",
          metricName: String(config.metricName || config.event || "Automation Triggered"),
          status: "tracked",
        };
      }

      default:
        throw new Error(`Unsupported Klaviyo action: "${action}"`);
    }
  },
};
