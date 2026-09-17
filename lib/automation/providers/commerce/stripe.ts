import type { AutomationAdapter, ProviderContext } from "../types";

export const stripeProvider: AutomationAdapter = {
  provider: "stripe",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case "create_customer": {
        const email = String(config.email || "");
        const name = String(config.name || "");
        return {
          provider: "stripe",
          action: "create_customer",
          customerId: `cus_${Date.now().toString(36)}`,
          email,
          name,
          status: "created",
        };
      }

      case "create_invoice": {
        const customerId = String(config.customerId || "");
        return {
          provider: "stripe",
          action: "create_invoice",
          invoiceId: `in_${Date.now().toString(36)}`,
          customerId,
          status: "draft",
        };
      }

      default:
        throw new Error(`Unsupported Stripe action: "${action}"`);
    }
  },
};
