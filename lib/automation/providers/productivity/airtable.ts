import type { AutomationAdapter, ProviderContext } from "../types";

export const airtableProvider: AutomationAdapter = {
  provider: "airtable",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    const baseId = String(config.baseId || "app_base123");
    const table = String(config.table || "Leads");

    switch (action) {
      case "create_record": {
        const fields = (config.fields as Record<string, unknown>) || config;
        return {
          provider: "airtable",
          action: "create_record",
          recordId: `rec${Date.now().toString(36)}`,
          baseId,
          table,
          fields,
          status: "created",
        };
      }

      case "update_record": {
        return {
          provider: "airtable",
          action: "update_record",
          recordId: String(config.recordId || `rec${Date.now().toString(36)}`),
          status: "updated",
        };
      }

      case "find_record": {
        return {
          provider: "airtable",
          action: "find_record",
          recordFound: true,
          recordId: `rec${Date.now().toString(36)}`,
        };
      }

      default:
        throw new Error(`Unsupported Airtable action: "${action}"`);
    }
  },
};
