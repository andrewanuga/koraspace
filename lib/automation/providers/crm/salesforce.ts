import type { AutomationAdapter, ProviderContext } from "../types";

export const salesforceProvider: AutomationAdapter = {
  provider: "salesforce",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case "create_lead": {
        const lastName = String(config.lastName || config.last_name || "Lead");
        const company = String(config.company || "Unknown");
        const email = String(config.email || "");
        return {
          provider: "salesforce",
          action: "create_lead",
          leadId: `00Q${Date.now().toString().slice(-12)}`,
          lastName,
          company,
          email,
          status: "Open - Not Contacted",
        };
      }

      case "update_lead": {
        return {
          provider: "salesforce",
          action: "update_lead",
          leadId: String(config.leadId || ""),
          status: "updated",
        };
      }

      case "create_opportunity": {
        return {
          provider: "salesforce",
          action: "create_opportunity",
          opportunityId: `006${Date.now().toString().slice(-12)}`,
          name: String(config.name || "New Business Opportunity"),
          stage: String(config.stage || "Prospecting"),
        };
      }

      default:
        throw new Error(`Unsupported Salesforce action: "${action}"`);
    }
  },
};
