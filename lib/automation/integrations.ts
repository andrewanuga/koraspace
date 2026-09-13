export type IntegrationCategory =
  | "social"
  | "crm"
  | "communication"
  | "commerce"
  | "productivity"
  | "email"
  | "ai"
  | "webhook";

export type AuthType = "oauth2" | "bot_token" | "api_key" | "webhook";

export interface IntegrationCapability {
  id: string;
  name: string;
  description: string;
  supported: boolean;
  requiredScopes?: string[];
  requiresAudit?: boolean;
}

export interface IntegrationDefinition {
  id: string;
  name: string;
  category: IntegrationCategory;
  auth: AuthType;
  description: string;
  triggers: string[];
  actions: string[];
  capabilities: string[];
  unavailableCapabilities?: string[];
  requiredScopes?: Record<string, string[]>;
  rateLimits?: {
    requestsPerMinute: number;
    notes?: string;
  };
}

export const INTEGRATIONS: IntegrationDefinition[] = [
  {
    id: "instagram",
    name: "Instagram",
    category: "social",
    auth: "oauth2",
    description: "Publish content, monitor comments, and engage audiences on Instagram Business.",
    triggers: [
      "new_comment",
      "new_mention",
      "new_message",
      "post_published",
    ],
    actions: [
      "publish_post",
      "publish_reel",
      "reply_comment",
      "send_message",
    ],
    capabilities: ["trigger", "publish", "comment", "analytics"],
    unavailableCapabilities: ["auto_follow", "bulk_dm", "auto_like"],
    requiredScopes: {
      publish_post: ["instagram_basic", "instagram_content_publish"],
      publish_reel: ["instagram_basic", "instagram_content_publish"],
      reply_comment: ["instagram_manage_comments"],
      send_message: ["instagram_manage_messages"],
    },
    rateLimits: { requestsPerMinute: 30, notes: "Subject to Meta Graph API hourly user limits" },
  },

  {
    id: "facebook",
    name: "Facebook Pages",
    category: "social",
    auth: "oauth2",
    description: "Manage posts, comments, and interactions across connected Facebook Pages.",
    triggers: [
      "new_comment",
      "new_message",
      "post_published",
    ],
    actions: [
      "publish_post",
      "reply_comment",
      "send_message",
    ],
    capabilities: ["trigger", "publish", "comment", "analytics", "webhook"],
    unavailableCapabilities: ["personal_profile_posting", "bulk_dm"],
    requiredScopes: {
      publish_post: ["pages_manage_posts", "pages_read_engagement"],
      reply_comment: ["pages_manage_engagement"],
    },
    rateLimits: { requestsPerMinute: 60 },
  },

  {
    id: "threads",
    name: "Threads",
    category: "social",
    auth: "oauth2",
    description: "Post text and media updates, reply to threads, and analyze discussion engagement.",
    triggers: [
      "new_mention",
      "new_reply",
    ],
    actions: [
      "publish_post",
      "reply",
    ],
    capabilities: ["trigger", "publish", "comment", "analytics"],
    unavailableCapabilities: ["auto_repost", "bulk_follow"],
    requiredScopes: {
      publish_post: ["threads_basic", "threads_content_publish"],
      reply: ["threads_basic", "threads_content_publish", "threads_manage_replies"],
    },
    rateLimits: { requestsPerMinute: 30 },
  },

  {
    id: "tiktok",
    name: "TikTok",
    category: "social",
    auth: "oauth2",
    description: "Direct video publishing and comment triggers for approved TikTok business creators.",
    triggers: [
      "new_comment",
    ],
    actions: [
      "publish_video",
    ],
    capabilities: ["trigger", "publish", "analytics"],
    unavailableCapabilities: ["auto_dm", "auto_like", "follow_users", "live_stream_control"],
    requiredScopes: {
      publish_video: ["video.publish", "user.info.basic"],
    },
    rateLimits: { requestsPerMinute: 20, notes: "Requires audited client status for public video posting" },
  },

  {
    id: "linkedin",
    name: "LinkedIn",
    category: "social",
    auth: "oauth2",
    description: "Post organizational shares, member updates, and capture lead reactions.",
    triggers: [
      "new_comment",
      "new_message",
    ],
    actions: [
      "publish_post",
      "reply_comment",
      "send_message",
    ],
    capabilities: ["trigger", "publish", "comment", "analytics"],
    unavailableCapabilities: ["connection_scraping", "bulk_inmail"],
    requiredScopes: {
      publish_post: ["w_member_social", "w_organization_social"],
      reply_comment: ["r_organization_social", "w_organization_social"],
    },
    rateLimits: { requestsPerMinute: 25 },
  },

  {
    id: "x",
    name: "X",
    category: "social",
    auth: "oauth2",
    description: "Post tweets, reply when mentioned, and stream engagement with X v2 API.",
    triggers: [
      "mention",
      "new_message",
    ],
    actions: [
      "publish_post",
      "reply",
      "send_message",
    ],
    capabilities: ["trigger", "publish", "comment", "message", "analytics"],
    unavailableCapabilities: ["automated_retweet_chains", "unsolicited_dms", "scrape_followers"],
    requiredScopes: {
      publish_post: ["tweet.read", "tweet.write", "users.read"],
      reply: ["tweet.read", "tweet.write"],
      send_message: ["dm.write"],
    },
    rateLimits: { requestsPerMinute: 50, notes: "Replies require summoned/explicit reply context" },
  },

  {
    id: "youtube",
    name: "YouTube",
    category: "social",
    auth: "oauth2",
    description: "Upload video assets, monitor comments, and track subscriber milestones.",
    triggers: [
      "new_comment",
      "new_subscriber",
    ],
    actions: [
      "publish_video",
    ],
    capabilities: ["trigger", "publish", "comment", "analytics"],
    unavailableCapabilities: ["subscriber_scraping", "comment_spamming"],
    requiredScopes: {
      publish_video: ["https://www.googleapis.com/auth/youtube.upload"],
    },
    rateLimits: { requestsPerMinute: 10, notes: "High quota consumption per upload (1,600 units)" },
  },

  {
    id: "pinterest",
    name: "Pinterest",
    category: "social",
    auth: "oauth2",
    description: "Create pins, schedule boards, and track visual discovery clicks.",
    triggers: [
      "new_pin",
    ],
    actions: [
      "create_pin",
    ],
    capabilities: ["trigger", "publish", "analytics"],
    unavailableCapabilities: ["mass_pinning", "board_hijacking"],
    requiredScopes: {
      create_pin: ["boards:read", "pins:read", "pins:write"],
    },
    rateLimits: { requestsPerMinute: 30 },
  },

  {
    id: "reddit",
    name: "Reddit",
    category: "social",
    auth: "oauth2",
    description: "Publish community updates, monitor keyword mentions, and track thread discussions.",
    triggers: [
      "new_comment",
      "mention",
    ],
    actions: [
      "publish_post",
      "reply",
    ],
    capabilities: ["trigger", "publish", "comment", "analytics"],
    unavailableCapabilities: ["vote_manipulation", "subreddit_flooding"],
    requiredScopes: {
      publish_post: ["submit", "read"],
      reply: ["submit"],
    },
    rateLimits: { requestsPerMinute: 60 },
  },

  {
    id: "google_business_profile",
    name: "Google Business Profile",
    category: "social",
    auth: "oauth2",
    description: "Post local promotions, reply to customer reviews, and update business status.",
    triggers: [
      "new_review",
    ],
    actions: [
      "publish_post",
      "reply_review",
    ],
    capabilities: ["trigger", "publish", "comment", "analytics"],
    unavailableCapabilities: ["fake_reviews", "automated_rating_manipulation"],
    requiredScopes: {
      publish_post: ["https://www.googleapis.com/auth/business.manage"],
      reply_review: ["https://www.googleapis.com/auth/business.manage"],
    },
    rateLimits: { requestsPerMinute: 30, notes: "Requires express user consent for automated review responses" },
  },

  {
    id: "whatsapp",
    name: "WhatsApp Business",
    category: "communication",
    auth: "oauth2",
    description: "Deliver approved template notifications and customer service conversational replies.",
    triggers: [
      "incoming_message",
    ],
    actions: [
      "send_message",
      "send_template",
    ],
    capabilities: ["trigger", "message", "webhook"],
    unavailableCapabilities: ["unsolicited_broadcast", "cold_messaging"],
    requiredScopes: {
      send_message: ["whatsapp_business_messaging"],
      send_template: ["whatsapp_business_messaging"],
    },
    rateLimits: { requestsPerMinute: 80 },
  },

  {
    id: "telegram",
    name: "Telegram",
    category: "communication",
    auth: "bot_token",
    description: "Send channel broadcasts, community alerts, and bot conversational responses.",
    triggers: [
      "incoming_message",
    ],
    actions: [
      "send_message",
    ],
    capabilities: ["trigger", "message", "webhook"],
    unavailableCapabilities: ["mass_user_invite", "unsolicited_private_dms"],
    rateLimits: { requestsPerMinute: 30, notes: "Telegram restricts bots to max 30 messages/sec globally, 1/sec per chat" },
  },

  {
    id: "discord",
    name: "Discord",
    category: "communication",
    auth: "bot_token",
    description: "Send server channel announcements, direct notifications, and webhook embeds.",
    triggers: [
      "new_message",
    ],
    actions: [
      "send_message",
    ],
    capabilities: ["trigger", "message", "webhook"],
    unavailableCapabilities: ["mass_direct_messaging", "unauthorized_server_joins"],
    rateLimits: { requestsPerMinute: 50 },
  },

  {
    id: "slack",
    name: "Slack",
    category: "communication",
    auth: "oauth2",
    description: "Dispatch team notifications, lead alerts, and channel updates.",
    triggers: [
      "new_message",
    ],
    actions: [
      "send_message",
      "create_channel",
    ],
    capabilities: ["trigger", "message", "webhook"],
    unavailableCapabilities: ["workspace_scraping", "unsolicited_workspace_dms"],
    requiredScopes: {
      send_message: ["chat:write", "channels:read"],
    },
    rateLimits: { requestsPerMinute: 60 },
  },

  {
    id: "gmail",
    name: "Gmail",
    category: "email",
    auth: "oauth2",
    description: "Send high-touch transactional lead notifications and track thread responses.",
    triggers: [
      "new_email",
    ],
    actions: [
      "send_email",
      "reply_email",
    ],
    capabilities: ["trigger", "message", "webhook"],
    unavailableCapabilities: ["bulk_cold_outreach", "mailbox_scraping"],
    requiredScopes: {
      send_email: ["https://www.googleapis.com/auth/gmail.send"],
    },
    rateLimits: { requestsPerMinute: 50 },
  },

  {
    id: "outlook",
    name: "Outlook",
    category: "email",
    auth: "oauth2",
    description: "Deliver Microsoft 365 executive email alerts and customer communications.",
    triggers: [
      "new_email",
    ],
    actions: [
      "send_email",
    ],
    capabilities: ["trigger", "message", "webhook"],
    unavailableCapabilities: ["bulk_cold_spam"],
    requiredScopes: {
      send_email: ["Mail.Send"],
    },
    rateLimits: { requestsPerMinute: 50 },
  },

  {
    id: "hubspot",
    name: "HubSpot",
    category: "crm",
    auth: "oauth2",
    description: "Sync contacts, deals, timeline events, and stage transitions.",
    triggers: [
      "contact_created",
      "deal_created",
      "deal_updated",
    ],
    actions: [
      "create_contact",
      "update_contact",
      "create_deal",
      "update_deal",
    ],
    capabilities: ["trigger", "crm", "webhook"],
    requiredScopes: {
      create_contact: ["crm.objects.contacts.write"],
      create_deal: ["crm.objects.deals.write"],
    },
    rateLimits: { requestsPerMinute: 100 },
  },

  {
    id: "salesforce",
    name: "Salesforce",
    category: "crm",
    auth: "oauth2",
    description: "Enterprise lead synchronization, opportunity management, and pipeline changes.",
    triggers: [
      "lead_created",
      "opportunity_created",
    ],
    actions: [
      "create_lead",
      "update_lead",
      "create_opportunity",
    ],
    capabilities: ["trigger", "crm", "webhook"],
    requiredScopes: {
      create_lead: ["api"],
    },
    rateLimits: { requestsPerMinute: 100 },
  },

  {
    id: "mailchimp",
    name: "Mailchimp",
    category: "email",
    auth: "oauth2",
    description: "Add subscribers, assign audience tags, and initiate automated journeys.",
    triggers: [
      "subscriber_added",
      "campaign_sent",
    ],
    actions: [
      "add_subscriber",
      "remove_subscriber",
      "send_campaign",
    ],
    capabilities: ["trigger", "message", "analytics", "webhook"],
    rateLimits: { requestsPerMinute: 100 },
  },

  {
    id: "shopify",
    name: "Shopify",
    category: "commerce",
    auth: "oauth2",
    description: "Trigger automations on new orders, abandoned checkouts, and customer purchases.",
    triggers: [
      "order_created",
      "customer_created",
      "product_created",
    ],
    actions: [
      "create_customer",
      "update_customer",
    ],
    capabilities: ["trigger", "commerce", "webhook"],
    requiredScopes: {
      create_customer: ["read_customers", "write_customers"],
    },
    rateLimits: { requestsPerMinute: 120 },
  },

  {
    id: "stripe",
    name: "Stripe",
    category: "commerce",
    auth: "api_key",
    description: "Trigger on successful payments, subscription creations, refunds, or payment failures.",
    triggers: [
      "payment_success",
      "payment_failed",
      "subscription_created",
      "subscription_cancelled",
    ],
    actions: [
      "create_customer",
      "create_invoice",
    ],
    capabilities: ["trigger", "commerce", "webhook"],
    rateLimits: { requestsPerMinute: 200 },
  },

  {
    id: "google_sheets",
    name: "Google Sheets",
    category: "productivity",
    auth: "oauth2",
    description: "Append rows, update spreadsheets, and sync campaign data in real-time.",
    triggers: [
      "row_created",
      "row_updated",
    ],
    actions: [
      "create_row",
      "update_row",
      "find_row",
    ],
    capabilities: ["trigger", "crm"],
    requiredScopes: {
      create_row: ["https://www.googleapis.com/auth/spreadsheets"],
    },
    rateLimits: { requestsPerMinute: 60 },
  },

  {
    id: "airtable",
    name: "Airtable",
    category: "productivity",
    auth: "oauth2",
    description: "Manage records, update marketing pipeline views, and store campaign assets.",
    triggers: [
      "record_created",
      "record_updated",
    ],
    actions: [
      "create_record",
      "update_record",
      "find_record",
    ],
    capabilities: ["trigger", "crm"],
    requiredScopes: {
      create_record: ["data.records:write"],
    },
    rateLimits: { requestsPerMinute: 60 },
  },

  {
    id: "webhook",
    name: "Webhooks / HTTP",
    category: "webhook",
    auth: "webhook",
    description: "Receive webhooks from external services or invoke custom REST API endpoints.",
    triggers: [
      "webhook",
    ],
    actions: [
      "http_request",
    ],
    capabilities: ["trigger", "webhook"],
    rateLimits: { requestsPerMinute: 300 },
  },
];
