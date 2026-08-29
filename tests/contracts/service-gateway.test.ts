import { describe, it, expect } from "vitest";
import { ServiceAuthEngine } from "@/lib/ai/core/service-auth";

describe("Service-to-Service Gateway Authentication", () => {
  const workspaceId = "ws_platform_service_101";
  const userId = "usr_platform_admin";

  it("should generate valid outbound headers with HMAC signature and correlation ID", () => {
    const headersRecord = ServiceAuthEngine.signOutboundHeaders(workspaceId, userId);

    expect(headersRecord["x-workspace-id"]).toBe(workspaceId);
    expect(headersRecord["x-user-id"]).toBe(userId);
    expect(headersRecord["x-service-signature"]).toBeDefined();
    expect(headersRecord["x-request-timestamp"]).toBeDefined();
    expect(headersRecord["x-correlation-id"]).toMatch(/^cor_\d+/);
  });

  it("should successfully authenticate valid service requests", () => {
    const outbound = ServiceAuthEngine.signOutboundHeaders(workspaceId, userId);
    const headers = new Headers(outbound);

    const authResult = ServiceAuthEngine.authenticateRequest(headers);

    expect(authResult.authenticated).toBe(true);
    expect(authResult.context?.workspaceId).toBe(workspaceId);
    expect(authResult.context?.isServiceCall).toBe(true);
  });

  it("should reject requests missing x-workspace-id header", () => {
    const headers = new Headers({ "x-caller-service": "core-platform" });
    const authResult = ServiceAuthEngine.authenticateRequest(headers);

    expect(authResult.authenticated).toBe(false);
    expect(authResult.error).toContain("Missing required 'x-workspace-id'");
  });

  it("should reject requests with stale or tampered timestamps (> 5 min)", () => {
    const oldTimestamp = (Math.floor(Date.now() / 1000) - 600).toString(); // 10 minutes ago
    const headers = new Headers({
      "x-workspace-id": workspaceId,
      "x-request-timestamp": oldTimestamp,
    });

    const authResult = ServiceAuthEngine.authenticateRequest(headers);

    expect(authResult.authenticated).toBe(false);
    expect(authResult.error).toContain("Request timestamp is stale");
  });
});
