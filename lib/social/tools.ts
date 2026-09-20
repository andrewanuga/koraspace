// Non-social integrations: calendar, analytics, and productivity/automation tools.
// Connected records live in the `integrations` table (provider + status + config).

export type ToolId =
  | "google_calendar" | "google_analytics" | "google_sheets"
  | "slack" | "notion" | "discord" | "mailchimp" | "zapier" | "webhook"
  | "cal_com" | "calendly" | "shopify" | "elevenlabs" | "hubspot";

export interface ToolDef {
  id: ToolId;
  name: string;
  category: "Calendar" | "Analytics" | "Productivity" | "Automation" | "Email" | "Commerce" | "AI & Media" | "CRM";
  color: string;
  desc: string;
  connectType: "oauth" | "api_key" | "webhook";
  env: string[];
  oauth?: {
    authorizeUrl: string; tokenUrl: string; scopes: string[];
    userScopes?: string[];
    clientIdEnv: string; clientSecretEnv: string; docs: string;
    extra?: Record<string, string>;
  };
  keySetup?: { label: string; docs: string };
}

const GOOGLE = {
  authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  clientIdEnv: "GOOGLE_CLIENT_ID",
  clientSecretEnv: "GOOGLE_CLIENT_SECRET",
  docs: "https://console.cloud.google.com/apis/credentials",
  extra: { access_type: "offline", prompt: "consent" },
};

export const TOOLS: Record<ToolId, ToolDef> = {
  google_calendar: {
    id: "google_calendar", name: "Google Calendar", category: "Calendar", color: "#4285F4",
    desc: "Push scheduled posts + messages onto your calendar.",
    connectType: "oauth", env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    oauth: { ...GOOGLE, scopes: ["https://www.googleapis.com/auth/calendar.events"] },
  },
  google_analytics: {
    id: "google_analytics", name: "Google Analytics", category: "Analytics", color: "#E37400",
    desc: "Attribute traffic and conversions to your posts.",
    connectType: "oauth", env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    oauth: { ...GOOGLE, scopes: ["https://www.googleapis.com/auth/analytics.readonly"] },
  },
  google_sheets: {
    id: "google_sheets", name: "Google Sheets", category: "Productivity", color: "#0F9D58",
    desc: "Export analytics + content calendars to a sheet.",
    connectType: "oauth", env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    oauth: { ...GOOGLE, scopes: ["https://www.googleapis.com/auth/spreadsheets"] },
  },
  slack: {
    id: "slack", name: "Slack", category: "Productivity", color: "#4A154B",
    desc: "Autonomous AI Agent, lead alerts, channel triage, and canvas collaboration in Slack.",
    connectType: "oauth", env: ["SLACK_CLIENT_ID", "SLACK_CLIENT_SECRET"],
    oauth: {
      authorizeUrl: "https://slack.com/oauth/v2/authorize",
      tokenUrl: "https://slack.com/api/oauth.v2.access",
      scopes: [
        "app_mentions:read",
        "assistant:write",
        "bookmarks:read",
        "bookmarks:write",
        "calls:read",
        "calls:write",
        "canvases:read",
        "canvases:write",
        "channels:history",
        "channels:join",
        "channels:manage",
        "channels:read",
        "channels:write.invites",
        "channels:write.topic",
        "chat:write",
        "chat:write.customize",
        "commands",
        "incoming-webhook",
        "users:write",
      ],
      userScopes: [
        "bookmarks:read",
        "bookmarks:write",
        "calls:read",
        "channels:history",
        "channels:read",
        "channels:write",
        "chat:write",
        "email",
        "identity.avatar",
        "im:history",
        "profile",
        "users:read",
        "users:read.email",
        "users:write",
      ],
      clientIdEnv: "SLACK_CLIENT_ID",
      clientSecretEnv: "SLACK_CLIENT_SECRET",
      docs: "https://api.slack.com/apps",
    },
  },
  notion: {
    id: "notion", name: "Notion", category: "Productivity", color: "#ffffff",
    desc: "Pull content briefs and ideas from a workspace.",
    connectType: "oauth", env: ["NOTION_CLIENT_ID", "NOTION_CLIENT_SECRET"],
    oauth: {
      authorizeUrl: "https://api.notion.com/v1/oauth/authorize", tokenUrl: "https://api.notion.com/v1/oauth/token",
      scopes: [], clientIdEnv: "NOTION_CLIENT_ID", clientSecretEnv: "NOTION_CLIENT_SECRET",
      docs: "https://developers.notion.com/docs/authorization", extra: { owner: "user" },
    },
  },
  discord: {
    id: "discord", name: "Discord", category: "Productivity", color: "#5865F2",
    desc: "Alerts + bot actions in your server.",
    connectType: "oauth", env: ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET"],
    oauth: {
      authorizeUrl: "https://discord.com/oauth2/authorize", tokenUrl: "https://discord.com/api/oauth2/token",
      scopes: ["identify", "webhook.incoming"], clientIdEnv: "DISCORD_CLIENT_ID", clientSecretEnv: "DISCORD_CLIENT_SECRET",
      docs: "https://discord.com/developers/applications",
    },
  },
  mailchimp: {
    id: "mailchimp", name: "Mailchimp", category: "Email", color: "#FFE01B",
    desc: "Sync subscribers and campaign performance.",
    connectType: "api_key", env: ["MAILCHIMP_API_KEY"],
    keySetup: { label: "Mailchimp API key", docs: "https://mailchimp.com/help/about-api-keys/" },
  },
  zapier: {
    id: "zapier", name: "Zapier", category: "Automation", color: "#FF4F00",
    desc: "Connect 6,000+ apps via a Zapier webhook.",
    connectType: "webhook", env: [],
    keySetup: { label: "Zapier catch-hook URL", docs: "https://zapier.com/apps/webhook/integrations" },
  },
  webhook: {
    id: "webhook", name: "Webhooks", category: "Automation", color: "#a855f7",
    desc: "Push events to your own HTTPS endpoint.",
    connectType: "webhook", env: [],
    keySetup: { label: "Your webhook URL", docs: "https://en.wikipedia.org/wiki/Webhook" },
  },
  cal_com: {
    id: "cal_com", name: "Cal.com", category: "Calendar", color: "#292929",
    desc: "Book calls directly from social DMs & comments into your calendar.",
    connectType: "api_key", env: ["CAL_COM_API_KEY"],
    keySetup: { label: "Cal.com API key (cal_live_...)", docs: "https://cal.com/docs/api-reference/v2/introduction" },
  },
  calendly: {
    id: "calendly", name: "Calendly", category: "Calendar", color: "#006BFF",
    desc: "Convert high-intent social conversations into booked demo calls.",
    connectType: "api_key", env: ["CALENDLY_API_KEY"],
    keySetup: { label: "Calendly Personal Access Token", docs: "https://developer.calendly.com/api-docs" },
  },
  shopify: {
    id: "shopify", name: "Shopify", category: "Commerce", color: "#95BF47",
    desc: "Sync product catalog, inventory, and generate cart checkout links for DM-to-Sale.",
    connectType: "api_key", env: ["SHOPIFY_ADMIN_ACCESS_TOKEN", "SHOPIFY_STORE_DOMAIN"],
    keySetup: { label: "Shopify Admin API Token (shpat_...)", docs: "https://shopify.dev/docs/apps/auth/admin-app-access-tokens" },
  },
  elevenlabs: {
    id: "elevenlabs", name: "ElevenLabs AI Audio", category: "AI & Media", color: "#6366F1",
    desc: "Instant ultra-realistic voiceover generation for video reels and audio repurposing.",
    connectType: "api_key", env: ["ELEVENLABS_API_KEY"],
    keySetup: { label: "ElevenLabs API Key", docs: "https://elevenlabs.io/docs/api-reference/quick-start" },
  },
  hubspot: {
    id: "hubspot", name: "HubSpot", category: "CRM", color: "#FF7A59",
    desc: "Sync contacts, inbound leads, customer lifecycle, and deals with HubSpot CRM.",
    connectType: "api_key", env: ["HUBSPOT_ACCESS_TOKEN"],
    keySetup: { label: "HubSpot Private App Access Token (pat-na1-...)", docs: "https://developers.hubspot.com/docs/api/private-apps" },
  },
};

export const TOOL_LIST = Object.values(TOOLS);

export function isToolConfigured(id: ToolId): boolean {
  const t = TOOLS[id];
  return t.env.every((k) => !!process.env[k]);
}
