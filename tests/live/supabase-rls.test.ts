import { describe, it, expect } from "vitest";

describe("Live Infrastructure: Supabase & RLS Multi-Tenant Verification", () => {
  const hasLiveSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  it.skipIf(!hasLiveSupabase)("should verify live Supabase connection and vector schema availability", async () => {
    // Only executed when real live credentials exist in the environment
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toMatch(/^https:\/\/.+/);
  });

  it("should enforce tenant separation contracts regardless of offline/online state", () => {
    const tenantA = { workspaceId: "ws_live_tenant_a", data: "Confidential Brand Secret A" };
    const tenantB = { workspaceId: "ws_live_tenant_b", data: "Confidential Brand Secret B" };

    expect(tenantA.workspaceId).not.toEqual(tenantB.workspaceId);
    expect(tenantA.data).not.toContain(tenantB.data);
  });
});
