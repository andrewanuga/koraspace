/**
 * Provider-specific Token Bucket & Sliding Window Rate Limiter
 */

interface RateBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRatePerSec: number;
}

// In-memory sliding buckets keyed by provider:credentialId
const buckets = new Map<string, RateBucket>();

// Provider capacities (requests per minute converted to tokens/second)
const DEFAULT_CAPACITIES: Record<string, { capacity: number; perMinute: number }> = {
  instagram: { capacity: 30, perMinute: 30 },
  facebook: { capacity: 60, perMinute: 60 },
  threads: { capacity: 30, perMinute: 30 },
  tiktok: { capacity: 20, perMinute: 20 },
  linkedin: { capacity: 25, perMinute: 25 },
  x: { capacity: 50, perMinute: 50 },
  youtube: { capacity: 10, perMinute: 10 },
  pinterest: { capacity: 30, perMinute: 30 },
  reddit: { capacity: 60, perMinute: 60 },
  google_business_profile: { capacity: 30, perMinute: 30 },
  whatsapp: { capacity: 80, perMinute: 80 },
  telegram: { capacity: 30, perMinute: 30 },
  discord: { capacity: 50, perMinute: 50 },
  slack: { capacity: 60, perMinute: 60 },
  gmail: { capacity: 50, perMinute: 50 },
  outlook: { capacity: 50, perMinute: 50 },
  hubspot: { capacity: 100, perMinute: 100 },
  salesforce: { capacity: 100, perMinute: 100 },
  mailchimp: { capacity: 100, perMinute: 100 },
  shopify: { capacity: 120, perMinute: 120 },
  stripe: { capacity: 200, perMinute: 200 },
  google_sheets: { capacity: 60, perMinute: 60 },
  airtable: { capacity: 60, perMinute: 60 },
  webhook: { capacity: 300, perMinute: 300 },
};

export class ProviderRateLimiter {
  static checkAndConsume(
    provider: string,
    key: string,
    cost: number = 1
  ): { allowed: boolean; retryAfterMs: number } {
    const bucketKey = `${provider}:${key}`;
    const limits = DEFAULT_CAPACITIES[provider] || { capacity: 60, perMinute: 60 };
    const now = Date.now();

    let bucket = buckets.get(bucketKey);
    if (!bucket) {
      bucket = {
        tokens: limits.capacity,
        lastRefill: now,
        capacity: limits.capacity,
        refillRatePerSec: limits.perMinute / 60,
      };
      buckets.set(bucketKey, bucket);
    } else {
      // Refill tokens based on elapsed time
      const elapsedSeconds = (now - bucket.lastRefill) / 1000;
      bucket.tokens = Math.min(
        bucket.capacity,
        bucket.tokens + elapsedSeconds * bucket.refillRatePerSec
      );
      bucket.lastRefill = now;
    }

    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      return { allowed: true, retryAfterMs: 0 };
    }

    // Calculate required wait time
    const needed = cost - bucket.tokens;
    const retryAfterMs = Math.ceil((needed / bucket.refillRatePerSec) * 1000);
    return { allowed: false, retryAfterMs };
  }
}
