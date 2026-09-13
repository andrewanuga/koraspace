/**
 * KoraSpace Automation Safety & Policy Enforcement Sentinel
 * Enforces Zero-Trust action verification and blocks prohibited automation patterns.
 */

const PROHIBITED_PATTERNS = [
  /buy\s+followers/i,
  /buy\s+likes/i,
  /fake\s+engagement/i,
  /credential\s+harvest/i,
  /password\s+collect/i,
  /scrape\s+password/i,
  /mass\s+unsolicited/i,
  /fake\s+review/i,
  /spam\s+direct\s+message/i,
  /auto\s+follow\s+churn/i,
  /view\s+bot/i,
];

export interface SafeActionCheckInput {
  provider?: string;
  type: string;
  config?: Record<string, unknown>;
}

export function assertSafeAction(input: SafeActionCheckInput): void {
  const serialized = JSON.stringify(input.config || {});

  // 1. Prohibited pattern inspection
  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error(
        `Automation blocked by KoraSpace safety policy: matched prohibited pattern (${pattern.source}).`
      );
    }
  }

  // 2. Unsolicited bulk messaging guard
  if (
    (input.type === "send_message" || input.type === "send_email") &&
    Boolean(input.config?.bulk) === true &&
    !Boolean(input.config?.hasExplicitConsent)
  ) {
    throw new Error(
      "Bulk messaging is strictly blocked without verified subscriber consent. High-volume unsolicited messaging violates provider policies."
    );
  }

  // 3. Google Business Profile specific safety rule
  if (
    input.provider === "google_business_profile" &&
    input.type === "reply_review" &&
    !Boolean(input.config?.userConsented)
  ) {
    throw new Error(
      "Automated Google Business Profile review responses require express user authorization."
    );
  }

  // 4. Fake engagement guard
  if (input.type.startsWith("fake_") || input.type.includes("scrape_user")) {
    throw new Error("Scraping and artificial engagement actions are prohibited.");
  }
}
