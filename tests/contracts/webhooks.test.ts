import { describe, it, expect, beforeEach } from "vitest";
import { WebhookSecurityEngine } from "@/lib/ai/core/webhooks";
import { createHmac } from "crypto";

describe("Webhook Verification & Idempotency", () => {
  const secret = "test_webhook_secret_key_12345";
  const payload = JSON.stringify({ event: "comment.created", id: "evt_100", sender: "@creator" });

  beforeEach(() => {
    WebhookSecurityEngine.reset();
  });

  it("should accurately verify valid HMAC SHA-256 signatures", () => {
    const validSignature = createHmac("sha256", secret).update(payload).digest("hex");
    const verified = WebhookSecurityEngine.verifySignature(payload, validSignature, secret);

    expect(verified).toBe(true);
  });

  it("should reject invalid or tampered webhook signatures", () => {
    const fakeSignature = "invalid_signature_hex_0000000000000000000000000000000000000000000000000000000000000000";
    const verified = WebhookSecurityEngine.verifySignature(payload, fakeSignature, secret);

    expect(verified).toBe(false);
  });

  it("should de-duplicate replayed webhook events using idempotency keys", () => {
    const eventId = "evt_social_webhook_999";

    // 1st occurrence -> New
    const firstCheck = WebhookSecurityEngine.checkAndRecordIdempotency(eventId);
    expect(firstCheck.isDuplicate).toBe(false);

    // 2nd occurrence -> Duplicate detected & rejected
    const secondCheck = WebhookSecurityEngine.checkAndRecordIdempotency(eventId);
    expect(secondCheck.isDuplicate).toBe(true);
  });

  it("should validate fresh timestamps and drop stale replay payloads", () => {
    const currentSeconds = Math.floor(Date.now() / 1000);
    expect(WebhookSecurityEngine.isTimestampFresh(currentSeconds, 300)).toBe(true);

    const oldSeconds = currentSeconds - 600; // 10 minutes old
    expect(WebhookSecurityEngine.isTimestampFresh(oldSeconds, 300)).toBe(false);
  });
});
