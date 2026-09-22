import { describe, it, expect, beforeEach } from "vitest";
import { WebhookSecurityEngine } from "@/lib/ai/core/webhooks";
import { createHmac } from "crypto";

describe("Live Infrastructure: Real Webhook Verification & Replay Protection", () => {
  const secret = "live_prod_webhook_secret_key_8888";
  const payload = JSON.stringify({
    event: "instagram.comment.created",
    id: "evt_live_ig_9999",
    timestamp: Math.floor(Date.now() / 1000),
    data: { text: "How much does your enterprise AI tier cost?" },
  });

  beforeEach(() => {
    WebhookSecurityEngine.reset();
  });

  it("should verify authentic HMAC-SHA256 signature for live incoming payload", () => {
    const signature = createHmac("sha256", secret).update(payload).digest("hex");
    const isValid = WebhookSecurityEngine.verifySignature(payload, signature, secret);

    expect(isValid).toBe(true);
  });

  it("should de-duplicate live replay attempts immediately", () => {
    const eventId = "evt_live_ig_9999";

    const firstCheck = WebhookSecurityEngine.checkAndRecordIdempotency(eventId);
    expect(firstCheck.isDuplicate).toBe(false);

    const replayCheck = WebhookSecurityEngine.checkAndRecordIdempotency(eventId);
    expect(replayCheck.isDuplicate).toBe(true);
  });
});
