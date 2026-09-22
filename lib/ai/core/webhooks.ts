/**
 * Webhook Verification, Idempotency & Delivery Resilience
 *
 * Enforces cryptographic authenticity and replay protection for inbound
 * social and billing webhooks (Instagram, X, Paystack):
 * - HMAC SHA-256 signature verification
 * - Idempotency key tracking (prevents duplicate execution & double charges)
 * - Expiration window check (drops stale/replayed webhook payloads)
 */

import { createHmac, timingSafeEqual } from "crypto";

export interface WebhookValidationResult {
  isValid: boolean;
  isDuplicate: boolean;
  reason?: string;
}

// In-memory idempotency cache (keyed by idempotencyKey or eventId)
const processedWebhooks = new Map<string, number>();
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class WebhookSecurityEngine {
  /**
   * Verifies an HMAC-SHA256 signature against the raw request payload.
   */
  public static verifySignature(
    rawBody: string,
    signatureHeader: string,
    secret: string
  ): boolean {
    if (!rawBody || !signatureHeader || !secret) {
      return false;
    }

    try {
      const hmac = createHmac("sha256", secret);
      const expectedSig = hmac.update(rawBody).digest("hex");

      const sigBuffer = Buffer.from(signatureHeader, "utf-8");
      const expectedBuffer = Buffer.from(expectedSig, "utf-8");

      if (sigBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return timingSafeEqual(sigBuffer, expectedBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Validates idempotency, ensuring the same webhook event is never processed twice.
   */
  public static checkAndRecordIdempotency(eventId: string): { isDuplicate: boolean } {
    const now = Date.now();

    // Clean up expired idempotency keys
    for (const [id, timestamp] of processedWebhooks.entries()) {
      if (now - timestamp > IDEMPOTENCY_TTL_MS) {
        processedWebhooks.delete(id);
      }
    }

    if (processedWebhooks.has(eventId)) {
      return { isDuplicate: true };
    }

    processedWebhooks.set(eventId, now);
    return { isDuplicate: false };
  }

  /**
   * Verifies that the webhook timestamp is within an acceptable fresh window (e.g. 5 minutes).
   */
  public static isTimestampFresh(timestampSeconds: number, maxAgeSeconds: number = 300): boolean {
    const nowSeconds = Math.floor(Date.now() / 1000);
    return Math.abs(nowSeconds - timestampSeconds) <= maxAgeSeconds;
  }

  /**
   * Resets idempotency map (for testing).
   */
  public static reset(): void {
    processedWebhooks.clear();
  }
}
