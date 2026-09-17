import { describe, it, expect } from "vitest";
import {
  capabilitiesForRole,
  enforceCapability,
  ROLE_CAPABILITIES,
  type WorkspaceRole,
} from "@/lib/ai/core/rbac";
import {
  adaptLegacyPermissions,
  LEGACY_EXACT_MAP,
  CAPABILITY_DEFINITIONS,
  type Capability,
} from "@/lib/ai/core/capabilities";
import { decideInvocation, decidePlan } from "@/lib/ai/agents/chat/policyEngine";
import type { AgentContext } from "@/lib/ai/core/types";
import type { ChatPlan, ToolInvocation } from "@/lib/ai/agents/chat/types";
import { defaultToolRegistry } from "@/lib/ai/tools/index";

describe("Canonical Authorization & Capability Model", () => {
  describe("1. Role-to-Capability Resolution", () => {
    it("should resolve full capabilities for owner and admin", () => {
      const ownerCaps = capabilitiesForRole("owner");
      const adminCaps = capabilitiesForRole("admin");

      expect(ownerCaps).toContain("content:generate");
      expect(ownerCaps).toContain("content:score");
      expect(ownerCaps).toContain("social:read");
      expect(ownerCaps).toContain("social:schedule");
      expect(ownerCaps).toContain("social:publish");
      expect(ownerCaps).toContain("inbox:read");
      expect(ownerCaps).toContain("inbox:reply");
      expect(ownerCaps).toContain("web:search");

      expect(adminCaps).toEqual(ownerCaps);
    });

    it("should restrict member capabilities to content generation, scoring, social read, and web search", () => {
      const memberCaps = capabilitiesForRole("member");

      expect(memberCaps).toContain("content:generate");
      expect(memberCaps).toContain("content:score");
      expect(memberCaps).toContain("social:read");
      expect(memberCaps).toContain("web:search");

      expect(memberCaps).not.toContain("social:publish");
      expect(memberCaps).not.toContain("social:schedule");
      expect(memberCaps).not.toContain("inbox:read");
      expect(memberCaps).not.toContain("inbox:reply");
    });

    it("should restrict viewer capabilities to read-only capabilities", () => {
      const viewerCaps = capabilitiesForRole("viewer");

      expect(viewerCaps).toContain("social:read");
      expect(viewerCaps).toContain("inbox:read");

      expect(viewerCaps).not.toContain("content:generate");
      expect(viewerCaps).not.toContain("social:publish");
      expect(viewerCaps).not.toContain("web:search");
    });

    it("should enforce capability successfully when role possesses it", () => {
      expect(() => enforceCapability("owner", "social:publish")).not.toThrow();
      expect(() => enforceCapability("member", "content:generate")).not.toThrow();
    });

    it("should throw a forbidden error when role lacks capability", () => {
      expect(() => enforceCapability("viewer", "content:generate")).toThrow(
        'Forbidden: Role "viewer" lacks capability "content:generate".'
      );
      expect(() => enforceCapability("member", "social:publish")).toThrow(
        'Forbidden: Role "member" lacks capability "social:publish".'
      );
    });
  });

  describe("2. PolicyEngine Boundary Checks (Negative & Positive)", () => {
    const memberContext: AgentContext = {
      userId: "user-123",
      workspaceId: "ws-test",
      capabilities: capabilitiesForRole("member"),
    };

    const viewerContext: AgentContext = {
      userId: "user-456",
      workspaceId: "ws-test",
      capabilities: capabilitiesForRole("viewer"),
    };

    const emptyContext: AgentContext = {
      userId: "user-789",
      workspaceId: "ws-test",
      capabilities: [],
    };

    it("should ALLOW member to invoke tool matching their capability (generate_hashtags -> content:generate)", () => {
      const plan: ChatPlan = {
        intent: "Generate hashtags for post",
        isComplex: false,
        requiredTools: ["generate_hashtags"],
        plannedSteps: ["Generate hashtags"],
        estimatedRisk: "low",
      };

      const invocation: ToolInvocation = {
        toolName: "generate_hashtags",
        args: { topic: "AI Agents" },
        timestamp: Date.now(),
      };

      const planDecision = decidePlan(plan, memberContext);
      expect(planDecision.action).toBe("ALLOW");

      const invDecision = decideInvocation({
        toolInvocation: invocation,
        plan,
        context: memberContext,
      });
      expect(invDecision.action).toBe("ALLOW");
      expect(invDecision.reasonCodes).toEqual([]);
    });

    it("should DENY viewer from invoking content:generate tools with MISSING_CAPABILITY", () => {
      const plan: ChatPlan = {
        intent: "Generate hashtags for post",
        isComplex: false,
        requiredTools: ["generate_hashtags"],
        plannedSteps: ["Generate hashtags"],
        estimatedRisk: "low",
      };

      const invocation: ToolInvocation = {
        toolName: "generate_hashtags",
        args: { topic: "AI Agents" },
        timestamp: Date.now(),
      };

      const planDecision = decidePlan(plan, viewerContext);
      expect(planDecision.action).toBe("DENY");
      expect(planDecision.reasonCodes).toContain("MISSING_CAPABILITY");

      const invDecision = decideInvocation({
        toolInvocation: invocation,
        plan,
        context: viewerContext,
      });
      expect(invDecision.action).toBe("DENY");
      expect(invDecision.reasonCodes).toContain("MISSING_CAPABILITY");
      expect(invDecision.reasons[0]).toContain("Missing required capability");
    });

    it("should DENY actor with empty capabilities from invoking protected tools", () => {
      const plan: ChatPlan = {
        intent: "Scrape URL",
        isComplex: false,
        requiredTools: ["scrape_url"],
        plannedSteps: ["Scrape content"],
        estimatedRisk: "low",
      };

      const invocation: ToolInvocation = {
        toolName: "scrape_url",
        args: { url: "https://example.com" },
        timestamp: Date.now(),
      };

      const planDecision = decidePlan(plan, emptyContext);
      expect(planDecision.action).toBe("DENY");
      expect(planDecision.reasonCodes).toContain("MISSING_CAPABILITY");

      const invDecision = decideInvocation({
        toolInvocation: invocation,
        plan,
        context: emptyContext,
      });
      expect(invDecision.action).toBe("DENY");
      expect(invDecision.reasonCodes).toContain("MISSING_CAPABILITY");
    });

    it("should ALLOW utility tools requiring no capabilities even with empty capabilities (get_current_time)", () => {
      const plan: ChatPlan = {
        intent: "Get current time",
        isComplex: false,
        requiredTools: ["get_current_time"],
        plannedSteps: ["Fetch current time"],
        estimatedRisk: "low",
      };

      const invocation: ToolInvocation = {
        toolName: "get_current_time",
        args: { timeZone: "UTC" },
        timestamp: Date.now(),
      };

      const planDecision = decidePlan(plan, emptyContext);
      expect(planDecision.action).toBe("ALLOW");

      const invDecision = decideInvocation({
        toolInvocation: invocation,
        plan,
        context: emptyContext,
      });
      expect(invDecision.action).toBe("ALLOW");
    });
  });

  describe("3. Multi-Tenant / Workspace Isolation", () => {
    it("should enforce capabilities bound to the active workspace role and deny cross-workspace capability leak", () => {
      const authUserId = "user-multi-org";

      // In Workspace A, user is owner -> full capabilities
      const workspaceAContext: AgentContext = {
        userId: authUserId,
        workspaceId: "workspace-a-id",
        capabilities: capabilitiesForRole("owner"),
      };

      // In Workspace B, user is viewer -> read-only capabilities
      const workspaceBContext: AgentContext = {
        userId: authUserId,
        workspaceId: "workspace-b-id",
        capabilities: capabilitiesForRole("viewer"),
      };

      const plan: ChatPlan = {
        intent: "Repurpose longform content",
        isComplex: false,
        requiredTools: ["repurpose_longform"],
        plannedSteps: ["Repurpose draft"],
        estimatedRisk: "low",
      };

      const invocation: ToolInvocation = {
        toolName: "repurpose_longform",
        args: { text: "Longform article about AI governance..." },
        timestamp: Date.now(),
      };

      // Allowed under Workspace A context
      const decisionA = decideInvocation({
        toolInvocation: invocation,
        plan,
        context: workspaceAContext,
      });
      expect(decisionA.action).toBe("ALLOW");

      // Denied under Workspace B context for the same user
      const decisionB = decideInvocation({
        toolInvocation: invocation,
        plan,
        context: workspaceBContext,
      });
      expect(decisionB.action).toBe("DENY");
      expect(decisionB.reasonCodes).toContain("MISSING_CAPABILITY");
    });
  });

  describe("4. Strict Legacy Adapter Boundary (Fail-Closed)", () => {
    it("should initialize with an empty legacy mapping dictionary", () => {
      expect(Object.keys(LEGACY_EXACT_MAP)).toHaveLength(0);
    });

    it("should return an empty array for empty input", () => {
      expect(adaptLegacyPermissions([])).toEqual([]);
    });

    it("should throw a strict migration-required error for any unmapped legacy permission", () => {
      expect(() => adaptLegacyPermissions(["chat:execute"])).toThrow(
        'Legacy permission "chat:execute" has no direct Capability mapping – migration required.'
      );

      expect(() => adaptLegacyPermissions(["memory:read"])).toThrow(
        'Legacy permission "memory:read" has no direct Capability mapping – migration required.'
      );

      expect(() => adaptLegacyPermissions(["arbitrary:legacy:string"])).toThrow(
        'Legacy permission "arbitrary:legacy:string" has no direct Capability mapping – migration required.'
      );
    });
  });

  describe("5. Capability Metadata Integrity", () => {
    it("should have descriptive metadata and risk profiles for all canonical capabilities", () => {
      const capabilities: Capability[] = [
        "content:generate",
        "content:score",
        "social:read",
        "social:schedule",
        "social:publish",
        "inbox:read",
        "inbox:reply",
        "web:search",
      ];

      for (const cap of capabilities) {
        const def = CAPABILITY_DEFINITIONS[cap];
        expect(def).toBeDefined();
        expect(def.description.length).toBeGreaterThan(5);
        expect(["low", "medium", "high"]).toContain(def.defaultRisk);
      }
    });
  });
});
