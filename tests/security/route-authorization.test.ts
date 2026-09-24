import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { authorizeAIRoute, toAuthErrorResponse } from "@/lib/ai/core/route-auth";
import { WorkspaceRBAC, capabilitiesForRole, type WorkspaceRole } from "@/lib/ai/core/rbac";
import { GhostPolicyEngine } from "@/lib/ai/agents/ghost/policy";
import { GhostAgent } from "@/lib/ai/agents/ghost/agent";
import { ScoreAgent } from "@/lib/ai/agents/score";
import { TrendAgent } from "@/lib/ai/agents/trend";
import * as openrouter from "@/lib/ai/openrouter";
import type { GhostDecision, GhostInput } from "@/lib/ai/agents/ghost/types";
import type { AgentContext } from "@/lib/ai/core/types";

// Route handlers
import { POST as handleGenerate } from "@/app/api/ai/generate/route";
import { POST as handleScore } from "@/app/api/ai/score/route";
import { GET as handleTrends } from "@/app/api/ai/trends/route";
import { POST as handleGhost } from "@/app/api/ai/ghost/route";

// Mock Supabase Server Client & Workspace resolution
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/workspace", () => ({
  getActiveWorkspace: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspace";

describe("Milestone 3: End-to-End AI Route Governance & Boundary Defense", () => {
  const createMockSupabase = () => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { ai_model: "test-model", niche: "marketing" } }),
    }),
    rpc: vi.fn().mockResolvedValue({ error: null }),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ── 1. Canonical authorizeAIRoute Guard ───────────────────────── */
  describe("1. authorizeAIRoute Primitive", () => {
    it("should return 401 UNAUTHORIZED when no authenticated workspace exists", async () => {
      vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any);
      vi.mocked(getActiveWorkspace).mockResolvedValue(null);

      const result = await authorizeAIRoute("content:generate");
      expect(result.authorized).toBe(false);
      expect(result.error?.status).toBe(401);
      expect(result.error?.code).toBe("UNAUTHORIZED");

      const errorResp = toAuthErrorResponse(result as any);
      expect(errorResp.status).toBe(401);
    });

    it("should return 403 MISSING_CAPABILITY when role lacks required capability", async () => {
      vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any);
      vi.mocked(getActiveWorkspace).mockResolvedValue({
        workspaceId: "ws-team-123",
        role: "viewer",
        userId: "user-456",
      });

      const result = await authorizeAIRoute("content:generate");
      expect(result.authorized).toBe(false);
      expect(result.error?.status).toBe(403);
      expect(result.error?.code).toBe("MISSING_CAPABILITY");
      expect(result.error?.message).toContain('Role "viewer" lacks capability "content:generate"');

      const errorResp = toAuthErrorResponse(result as any);
      expect(errorResp.status).toBe(403);
    });

    it("should authorize successfully with authentic userId != workspaceId", async () => {
      vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any);
      vi.mocked(getActiveWorkspace).mockResolvedValue({
        workspaceId: "ws-team-123",
        role: "member",
        userId: "user-authentic-789",
      });

      const result = await authorizeAIRoute("content:generate");
      expect(result.authorized).toBe(true);
      if (result.authorized) {
        expect(result.workspaceId).toBe("ws-team-123");
        expect(result.userId).toBe("user-authentic-789");
        expect(result.role).toBe("member");
        expect(result.context.userId).toBe("user-authentic-789");
        expect(result.context.workspaceId).toBe("ws-team-123");
        expect(result.context.capabilities).toContain("content:generate");
        expect(result.context.capabilities).toContain("content:score");
      }
    });

    it("should allow request when no specific capability is required", async () => {
      vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any);
      vi.mocked(getActiveWorkspace).mockResolvedValue({
        workspaceId: "ws-1",
        role: "viewer",
        userId: "user-1",
      });

      const result = await authorizeAIRoute();
      expect(result.authorized).toBe(true);
    });
  });

  /* ── 2. Role Boundary Decisions: member & viewer ──────────────── */
  describe("2. Role Capability Matrix Boundary Invariants", () => {
    it("member must have content:score", () => {
      const memberCaps = capabilitiesForRole("member");
      expect(memberCaps).toContain("content:score");
    });

    it("member must NOT have inbox:read or inbox:reply", () => {
      const memberCaps = capabilitiesForRole("member");
      expect(memberCaps).not.toContain("inbox:read");
      expect(memberCaps).not.toContain("inbox:reply");
    });

    it("viewer must have inbox:read but NOT inbox:reply", () => {
      const viewerCaps = capabilitiesForRole("viewer");
      expect(viewerCaps).toContain("inbox:read");
      expect(viewerCaps).not.toContain("inbox:reply");
    });

    it("viewer must NOT have content:generate or content:score", () => {
      const viewerCaps = capabilitiesForRole("viewer");
      expect(viewerCaps).not.toContain("content:generate");
      expect(viewerCaps).not.toContain("content:score");
    });
  });

  /* ── 3. Pre-Execution Defense on Governed Route Handlers ───────── */
  describe("3. Pre-Execution Defense on AI Route Handlers", () => {
    it("POST /api/ai/generate: unauthorized viewer is rejected 403 and callAI is NEVER called", async () => {
      vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any);
      vi.mocked(getActiveWorkspace).mockResolvedValue({
        workspaceId: "ws-1",
        role: "viewer",
        userId: "u-viewer",
      });

      const callAISpy = vi.spyOn(openrouter, "callAI").mockResolvedValue({ content: "test", model: "m" });

      const req = new NextRequest("http://localhost/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Generate a post about marketing" }),
      });

      const res = await handleGenerate(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe("MISSING_CAPABILITY");
      // CRITICAL SECURITY ASSERTION: expensive AI call was NOT invoked
      expect(callAISpy).not.toHaveBeenCalled();
    });

    it("POST /api/ai/generate: authorized member executes successfully", async () => {
      vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any);
      vi.mocked(getActiveWorkspace).mockResolvedValue({
        workspaceId: "ws-1",
        role: "member",
        userId: "u-member",
      });

      const callAISpy = vi.spyOn(openrouter, "callAI").mockResolvedValue({ content: "Success post", model: "test-model" });
      vi.spyOn(openrouter, "isConfigured").mockReturnValue(true);

      const req = new NextRequest("http://localhost/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Generate a post about marketing" }),
      });

      const res = await handleGenerate(req);
      expect(res.status).toBe(200);
      expect(callAISpy).toHaveBeenCalled();
    });

    it("POST /api/ai/score: unauthorized viewer is rejected 403 and ScoreAgent.evaluate is NEVER called", async () => {
      vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any);
      vi.mocked(getActiveWorkspace).mockResolvedValue({
        workspaceId: "ws-1",
        role: "viewer",
        userId: "u-viewer",
      });

      const scoreSpy = vi.spyOn(ScoreAgent, "evaluate");

      const req = new NextRequest("http://localhost/api/ai/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Draft post to score" }),
      });

      const res = await handleScore(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe("MISSING_CAPABILITY");
      // CRITICAL SECURITY ASSERTION: ScoreAgent was NOT invoked
      expect(scoreSpy).not.toHaveBeenCalled();
    });

    it("POST /api/ai/score: authorized member executes ScoreAgent.evaluate", async () => {
      vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any);
      vi.mocked(getActiveWorkspace).mockResolvedValue({
        workspaceId: "ws-1",
        role: "member",
        userId: "u-member",
      });

      const scoreSpy = vi.spyOn(ScoreAgent, "evaluate").mockResolvedValue({
        success: true,
        data: {
          score: 88,
          prediction: "high",
          bestTime: "10am",
          reasoning: "Great hook",
          improvements: [],
        },
      });

      const req = new NextRequest("http://localhost/api/ai/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Draft post to score" }),
      });

      const res = await handleScore(req);
      expect(res.status).toBe(200);
      expect(scoreSpy).toHaveBeenCalled();
    });

    it("GET /api/ai/trends: unauthenticated caller is rejected 401 and TrendAgent is NEVER called", async () => {
      vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any);
      vi.mocked(getActiveWorkspace).mockResolvedValue(null);

      const trendSpy = vi.spyOn(TrendAgent, "discover");

      const req = new NextRequest("http://localhost/api/ai/trends?niche=marketing");
      const res = await handleTrends(req);
      expect(res.status).toBe(401);
      // CRITICAL SECURITY ASSERTION: TrendAgent was NOT invoked
      expect(trendSpy).not.toHaveBeenCalled();
    });

    it("POST /api/ai/ghost: member without inbox:read is rejected 403 and GhostAgent is NEVER called", async () => {
      vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any);
      vi.mocked(getActiveWorkspace).mockResolvedValue({
        workspaceId: "ws-1",
        role: "member",
        userId: "u-member",
      });

      const ghostSpy = vi.spyOn(GhostAgent, "evaluate");

      const req = new NextRequest("http://localhost/api/ai/ghost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: "Hello there!" }),
      });

      const res = await handleGhost(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe("MISSING_CAPABILITY");
      // CRITICAL SECURITY ASSERTION: GhostAgent was NOT invoked
      expect(ghostSpy).not.toHaveBeenCalled();
    });
  });

  /* ── 4. Ghost Two-Level Governance & Reply Draft Stripping ─────── */
  describe("4. Ghost Two-Level Governance & Draft Protection", () => {
    const viewerContext: AgentContext = {
      userId: "viewer-1",
      workspaceId: "ws-1",
      autonomyMode: "auto",
      capabilities: capabilitiesForRole("viewer"), // contains inbox:read, NOT inbox:reply
    };

    const adminContext: AgentContext = {
      userId: "admin-1",
      workspaceId: "ws-1",
      autonomyMode: "auto",
      capabilities: capabilitiesForRole("admin"), // contains inbox:read AND inbox:reply
    };

    it("allows triage / classification for viewer (ignore spam)", () => {
      const decision: GhostDecision = {
        action: "ignore",
        confidence: 95,
        reasoning: "Spam link dump",
        isLead: false,
        riskLevel: "low",
        suggestedTags: [],
      };
      const input: GhostInput = { message: "buy tokens at spam.xyz" };

      const policy = GhostPolicyEngine.evaluate(decision, input, viewerContext);
      expect(policy.decision).toBe("ALLOW");
      expect(policy.canDispatchImmediately).toBe(false);
      expect(policy.requiresHumanApproval).toBe(false);
    });

    it("allows lead classification for viewer but requires human approval", () => {
      const decision: GhostDecision = {
        action: "flag_lead",
        confidence: 90,
        reasoning: "Pricing inquiry",
        isLead: true,
        riskLevel: "low",
        suggestedTags: ["pricing"],
      };
      const input: GhostInput = { message: "How much is your pro plan?" };

      const policy = GhostPolicyEngine.evaluate(decision, input, viewerContext);
      expect(policy.decision).toBe("REQUIRE_APPROVAL");
      expect(policy.canDispatchImmediately).toBe(false);
      expect(policy.requiresHumanApproval).toBe(true);
    });

    it("suppresses autonomous reply dispatch in policy for caller lacking inbox:reply", () => {
      const routineReplyDecision: GhostDecision = {
        action: "auto_reply",
        confidence: 95,
        reasoning: "Routine compliment",
        reply: "Thank you for the support!",
        isLead: false,
        riskLevel: "low",
        suggestedTags: ["engagement"],
      };
      const input: GhostInput = { message: "Great post!" };

      const viewerPolicy = GhostPolicyEngine.evaluate(routineReplyDecision, input, viewerContext);
      expect(viewerPolicy.decision).toBe("REQUIRE_APPROVAL");
      expect(viewerPolicy.canDispatchImmediately).toBe(false);
      expect(viewerPolicy.requiresHumanApproval).toBe(true);
      expect(viewerPolicy.reasons.some((r) => r.includes("inbox:reply"))).toBe(true);

      const adminPolicy = GhostPolicyEngine.evaluate(routineReplyDecision, input, adminContext);
      expect(adminPolicy.decision).toBe("ALLOW");
      expect(adminPolicy.canDispatchImmediately).toBe(true);
      expect(adminPolicy.requiresHumanApproval).toBe(false);
    });

    it("GhostAgent.evaluate strictly strips reply draft when caller lacks inbox:reply", async () => {
      // Offline fallback produces auto_reply with draft reply for compliments
      const input: GhostInput = {
        message: "Great post, love this content!",
        platform: "x",
      };

      // Viewer evaluation: triage succeeds, but reply draft must NOT be returned
      const viewerRes = await GhostAgent.evaluate(input, viewerContext);
      expect(viewerRes.success).toBe(true);
      expect(viewerRes.data?.action).toBe("auto_reply");
      expect(viewerRes.data?.reply).toBeUndefined(); // STRIPPED: No draft leakage
      expect(viewerRes.data?.dispatched).toBe(false);
      expect(viewerRes.data?.policy.canDispatchImmediately).toBe(false);

      // Admin evaluation: has inbox:reply, so draft reply IS generated/retained
      const adminRes = await GhostAgent.evaluate(input, adminContext);
      expect(adminRes.success).toBe(true);
      expect(adminRes.data?.action).toBe("auto_reply");
      expect(adminRes.data?.reply).toBeDefined(); // RETAINED for authorized reply roles
      expect(typeof adminRes.data?.reply).toBe("string");
    });
  });

  /* ── 5. Memory Resource RBAC Invariants ───────────────────────── */
  describe("5. Memory RBAC Enforcement Matrix", () => {
    it("GET /api/ai/memory requires memory:read (owner, admin, member, viewer allowed)", () => {
      const roles: WorkspaceRole[] = ["owner", "admin", "member", "viewer"];
      for (const role of roles) {
        expect(WorkspaceRBAC.hasPermission(role, "memory:read")).toBe(true);
      }
    });

    it("POST /api/ai/memory requires memory:write (owner, admin, member allowed; viewer denied)", () => {
      expect(WorkspaceRBAC.hasPermission("owner", "memory:write")).toBe(true);
      expect(WorkspaceRBAC.hasPermission("admin", "memory:write")).toBe(true);
      expect(WorkspaceRBAC.hasPermission("member", "memory:write")).toBe(true);
      expect(WorkspaceRBAC.hasPermission("viewer", "memory:write")).toBe(false);
    });

    it("DELETE /api/ai/memory/[id] requires memory:delete (owner, admin allowed; member & viewer denied)", () => {
      expect(WorkspaceRBAC.hasPermission("owner", "memory:delete")).toBe(true);
      expect(WorkspaceRBAC.hasPermission("admin", "memory:delete")).toBe(true);
      expect(WorkspaceRBAC.hasPermission("member", "memory:delete")).toBe(false);
      expect(WorkspaceRBAC.hasPermission("viewer", "memory:delete")).toBe(false);
    });
  });

  /* ── 6. Chat Authorization Regression Check ───────────────────── */
  describe("6. Chat Agent Authorization Regression Check", () => {
    it("capabilitiesForRole accurately reflects permissions needed by Chat Agent", () => {
      const ownerCaps = capabilitiesForRole("owner");
      expect(ownerCaps).toContain("content:generate");
      expect(ownerCaps).toContain("web:search");
      expect(ownerCaps).toContain("social:read");

      const memberCaps = capabilitiesForRole("member");
      expect(memberCaps).toContain("content:generate");
      expect(memberCaps).toContain("web:search");
      expect(memberCaps).not.toContain("social:publish");
    });
  });
});
