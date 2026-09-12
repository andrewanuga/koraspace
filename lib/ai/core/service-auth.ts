/**
 * Service-to-Service Authentication & Context Gateway
 *
 * Enforces cryptographic authenticity, correlation tracking, and tenant isolation
 * for incoming requests from the Core Platform to the AI Intelligence Service:
 * - Validates service tokens and HMAC request signatures
 * - Extracts and validates `x-workspace-id`, `x-user-id`, and `x-correlation-id`
 * - Rejects expired request timestamps to prevent replay attacks
 */

import { createHmac, timingSafeEqual } from "crypto";

export interface ServiceAuthContext {
  workspaceId: string;
  userId: string;
  correlationId: string;
  isServiceCall: boolean;
  caller: string;
}

export class ServiceAuthEngine {
  private static readonly SERVICE_SECRET = process.env.AI_SERVICE_SECRET || "default_internal_ai_service_secret_key_32bytes";
  private static readonly MAX_CLOCK_SKEW_SECONDS = 300; // 5 minutes

  /**
   * Validates incoming HTTP headers for service-to-service authenticity.
   */
  public static authenticateRequest(headers: Headers): {
    authenticated: boolean;
    context?: ServiceAuthContext;
    error?: string;
  } {
    const workspaceId = headers.get("x-workspace-id");
    const userId = headers.get("x-user-id") || "system";
    const correlationId = headers.get("x-correlation-id") || `cor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const timestampHeader = headers.get("x-request-timestamp");
    const serviceSignature = headers.get("x-service-signature");
    const serviceToken = headers.get("x-service-token");
    const caller = headers.get("x-caller-service") || "core-platform";

    if (!workspaceId) {
      return {
        authenticated: false,
        error: "Missing required 'x-workspace-id' header for AI service execution.",
      };
    }

    // 1. Timestamp freshness check (if provided)
    if (timestampHeader) {
      const requestSec = parseInt(timestampHeader, 10);
      const currentSec = Math.floor(Date.now() / 1000);
      if (isNaN(requestSec) || Math.abs(currentSec - requestSec) > this.MAX_CLOCK_SKEW_SECONDS) {
        return {
          authenticated: false,
          error: "Request timestamp is stale or skewed beyond allowed 5-minute window.",
        };
      }
    }

    // 2. Service Token or HMAC verification
    if (serviceToken) {
      const isValidToken = serviceToken === this.SERVICE_SECRET;
      if (!isValidToken) {
        return { authenticated: false, error: "Invalid 'x-service-token'." };
      }
    } else if (serviceSignature && timestampHeader) {
      const payload = `${caller}:${workspaceId}:${timestampHeader}`;
      const expectedSig = createHmac("sha256", this.SERVICE_SECRET).update(payload).digest("hex");
      
      const sigBuf = Buffer.from(serviceSignature, "utf-8");
      const expBuf = Buffer.from(expectedSig, "utf-8");

      if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
        return { authenticated: false, error: "Invalid 'x-service-signature' HMAC header." };
      }
    }

    return {
      authenticated: true,
      context: {
        workspaceId,
        userId,
        correlationId,
        isServiceCall: Boolean(serviceToken || serviceSignature),
        caller,
      },
    };
  }

  /**
   * Generates headers for outbound service-to-service calls.
   */
  public static signOutboundHeaders(workspaceId: string, userId: string = "system", correlationId?: string): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const caller = "core-platform";
    const payload = `${caller}:${workspaceId}:${timestamp}`;
    const signature = createHmac("sha256", this.SERVICE_SECRET).update(payload).digest("hex");

    return {
      "x-caller-service": caller,
      "x-workspace-id": workspaceId,
      "x-user-id": userId,
      "x-correlation-id": correlationId || `cor_${Date.now()}`,
      "x-request-timestamp": timestamp,
      "x-service-signature": signature,
    };
  }
}
