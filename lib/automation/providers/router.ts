import { createClient } from "@/lib/supabase/server";
import type { ProviderContext } from "./types";
import { ProviderRateLimiter } from "../rate-limit";

// Social
import { instagramProvider } from "./social/instagram";
import { facebookProvider } from "./social/facebook";
import { linkedinProvider } from "./social/linkedin";
import { xProvider } from "./social/x";
import { tiktokProvider } from "./social/tiktok";
import { youtubeProvider } from "./social/youtube";
import { threadsProvider } from "./social/threads";
import { pinterestProvider } from "./social/pinterest";

// Communication
import { telegramProvider } from "./communication/telegram";
import { whatsappProvider } from "./communication/whatsapp";
import { slackProvider } from "./communication/slack";
import { discordProvider } from "./communication/discord";

// Email
import { gmailProvider } from "./email/gmail";
import { mailchimpProvider } from "./email/mailchimp";
import { klaviyoProvider } from "./email/klaviyo";

// CRM
import { hubspotProvider } from "./crm/hubspot";
import { salesforceProvider } from "./crm/salesforce";

// Commerce
import { shopifyProvider } from "./commerce/shopify";
import { stripeProvider } from "./commerce/stripe";

// Productivity & Webhook
import { googleSheetsProvider } from "./productivity/google-sheets";
import { airtableProvider } from "./productivity/airtable";
import { genericProvider } from "./generic";

const adapters: Record<string, any> = {
  instagram: instagramProvider,
  facebook: facebookProvider,
  linkedin: linkedinProvider,
  x: xProvider,
  tiktok: tiktokProvider,
  youtube: youtubeProvider,
  threads: threadsProvider,
  pinterest: pinterestProvider,
  telegram: telegramProvider,
  whatsapp: whatsappProvider,
  slack: slackProvider,
  discord: discordProvider,
  gmail: gmailProvider,
  mailchimp: mailchimpProvider,
  klaviyo: klaviyoProvider,
  hubspot: hubspotProvider,
  salesforce: salesforceProvider,
  shopify: shopifyProvider,
  stripe: stripeProvider,
  google_sheets: googleSheetsProvider,
  airtable: airtableProvider,
  webhook: genericProvider,
};

export async function executeIntegrationAction(
  provider: string,
  action: string,
  config: Record<string, unknown>,
  context: ProviderContext
): Promise<Record<string, unknown>> {
  // 1. Rate Limit Sentinel
  const rateLimitKey = context.credentialId || context.userId;
  const rateCheck = ProviderRateLimiter.checkAndConsume(provider, rateLimitKey, 1);
  if (!rateCheck.allowed) {
    throw new Error(
      `Rate limit exceeded for ${provider}. Please wait ${Math.ceil(
        rateCheck.retryAfterMs / 1000
      )} seconds before retrying.`
    );
  }

  // 2. Fetch credential if credentialId specified or auto-detect
  if (context.credentialId) {
    try {
      const supabase = await createClient();
      const { data: cred } = await supabase
        .from("automation_credentials")
        .select("*")
        .eq("user_id", context.userId)
        .eq("id", context.credentialId)
        .single();

      if (cred) {
        context.credential = cred;
      }
    } catch {
      // Allow execution in simulated / testing mode
    }
  }

  // 3. Match adapter
  const adapter = adapters[provider] || genericProvider;
  return adapter.execute(action, config, context);
}
