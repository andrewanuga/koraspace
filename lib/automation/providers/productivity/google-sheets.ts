import type { AutomationAdapter, ProviderContext } from "../types";

export const googleSheetsProvider: AutomationAdapter = {
  provider: "google_sheets",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    const spreadsheetId = String(config.spreadsheetId || "sheet_123");
    const sheetName = String(config.sheetName || "Sheet1");

    switch (action) {
      case "create_row": {
        const values = (config.values as any[]) || [config.row || config];
        return {
          provider: "google_sheets",
          action: "create_row",
          spreadsheetId,
          sheetName,
          updatedRows: 1,
          status: "appended",
          timestamp: new Date().toISOString(),
        };
      }

      case "update_row": {
        return {
          provider: "google_sheets",
          action: "update_row",
          spreadsheetId,
          sheetName,
          rowIndex: Number(config.rowIndex || 2),
          status: "updated",
        };
      }

      case "find_row": {
        return {
          provider: "google_sheets",
          action: "find_row",
          spreadsheetId,
          matchFound: true,
          row: config.sampleRow || { id: 1, email: "lead@example.com" },
        };
      }

      default:
        throw new Error(`Unsupported Google Sheets action: "${action}"`);
    }
  },
};
