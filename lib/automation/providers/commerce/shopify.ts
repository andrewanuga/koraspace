import type { AutomationAdapter, ProviderContext } from "../types";

export const shopifyProvider: AutomationAdapter = {
  provider: "shopify",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case "create_customer": {
        const email = String(config.email || "");
        const firstName = String(config.firstName || config.first_name || "");
        const tags = (config.tags as string[]) || ["lead_automation"];
        return {
          provider: "shopify",
          action: "create_customer",
          customerId: `gid://shopify/Customer/${Date.now()}`,
          email,
          firstName,
          tags,
          status: "created",
        };
      }

      case "update_customer": {
        return {
          provider: "shopify",
          action: "update_customer",
          customerId: String(config.customerId || ""),
          status: "updated",
        };
      }

      default:
        throw new Error(`Unsupported Shopify action: "${action}"`);
    }
  },
};
