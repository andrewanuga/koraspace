import type { AutomationAdapter, ProviderContext } from "../types";

export const hubspotProvider: AutomationAdapter = {
  provider: "hubspot",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case "create_contact": {
        const email = String(config.email || "");
        const firstname = String(config.firstname || config.first_name || "");
        const lastname = String(config.lastname || config.last_name || "");
        return {
          provider: "hubspot",
          action: "create_contact",
          contactId: `hs_contact_${Date.now()}`,
          email,
          firstname,
          lastname,
          status: "created",
        };
      }

      case "update_contact": {
        return {
          provider: "hubspot",
          action: "update_contact",
          contactId: String(config.contactId || ""),
          status: "updated",
        };
      }

      case "create_deal": {
        const dealname = String(config.dealname || config.deal_name || "New Inbound Deal");
        const amount = Number(config.amount || 0);
        return {
          provider: "hubspot",
          action: "create_deal",
          dealId: `hs_deal_${Date.now()}`,
          dealname,
          amount,
          status: "created",
        };
      }

      case "update_deal": {
        return {
          provider: "hubspot",
          action: "update_deal",
          dealId: String(config.dealId || ""),
          stage: String(config.stage || "closedwon"),
          status: "updated",
        };
      }

      default:
        throw new Error(`Unsupported HubSpot action: "${action}"`);
    }
  },
};
