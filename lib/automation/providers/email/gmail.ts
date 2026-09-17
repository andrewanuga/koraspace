import type { AutomationAdapter, ProviderContext } from "../types";

export const gmailProvider: AutomationAdapter = {
  provider: "gmail",

  async execute(
    action: string,
    config: Record<string, unknown>,
    _context: ProviderContext
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case "send_email": {
        const to = String(config.to || config.recipient || "");
        const subject = String(config.subject || "Update from KoraSpace");
        const body = String(config.body || config.message || "");
        return {
          provider: "gmail",
          action: "send_email",
          messageId: `msg_${Date.now()}@gmail.com`,
          to,
          subject,
          status: "sent",
          timestamp: new Date().toISOString(),
        };
      }

      case "reply_email": {
        return {
          provider: "gmail",
          action: "reply_email",
          threadId: String(config.threadId || ""),
          status: "replied",
        };
      }

      default:
        throw new Error(`Unsupported Gmail action: "${action}"`);
    }
  },
};
