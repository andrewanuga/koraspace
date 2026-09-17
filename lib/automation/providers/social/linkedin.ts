import type { AutomationAdapter, ProviderContext } from "../types";

export const linkedinProvider: AutomationAdapter = {
  provider: "linkedin",

  async execute(
    action: string,
    config: Record<string, unknown>,
    context: ProviderContext
  ): Promise<Record<string, unknown>> {
    // Permission check for LinkedIn organization vs member
    if (context.credential) {
      const scopes = context.credential.scopes || [];
      const asOrg = Boolean(config.asOrganization);
      const requiredScope = asOrg ? "w_organization_social" : "w_member_social";
      if (!scopes.includes(requiredScope) && scopes.length > 0) {
        throw new Error(
          `LinkedIn action blocked: Scope "${requiredScope}" is required for ${asOrg ? "Organization" : "Member"} publishing.`
        );
      }
    }

    switch (action) {
      case "publish_post": {
        const text = String(config.text || config.content || "");
        return {
          provider: "linkedin",
          action: "publish_post",
          shareId: `urn:li:share:${Date.now()}`,
          status: "published",
          content: text,
          timestamp: new Date().toISOString(),
        };
      }

      case "reply_comment": {
        return {
          provider: "linkedin",
          action: "reply_comment",
          commentUrn: String(config.commentId || ""),
          reply: String(config.text || ""),
          status: "sent",
        };
      }

      case "send_message": {
        return {
          provider: "linkedin",
          action: "send_message",
          recipientUrn: String(config.recipient || ""),
          status: "delivered",
        };
      }

      default:
        throw new Error(`Unsupported LinkedIn action: "${action}"`);
    }
  },
};
