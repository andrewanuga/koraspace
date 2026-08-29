import { describe, it, expect } from "vitest";
import { POST as handleChat } from "@/app/api/v1/ai/chat/route";
import { POST as handleGhost } from "@/app/api/v1/ai/ghost/evaluate/route";
import { POST as handleContent } from "@/app/api/v1/ai/content/generate/route";
import { POST as handleMemory } from "@/app/api/v1/ai/memory/search/route";
import { ServiceAuthEngine } from "@/lib/ai/core/service-auth";
import { NextRequest } from "next/server";

describe("v1 AI Service Route Adapters", () => {
  const workspaceId = "ws_v1_adapter_test_103";
  const userId = "usr_adapter_01";

  const createSignedRequest = (path: string, body: any, customHeaders?: Record<string, string>) => {
    const signedHeaders = ServiceAuthEngine.signOutboundHeaders(workspaceId, userId);
    return new NextRequest(`http://localhost:3000${path}`, {
      method: "POST",
      headers: {
        ...signedHeaders,
        "Content-Type": "application/json",
        ...customHeaders,
      },
      body: JSON.stringify(body),
    });
  };

  it("POST /api/v1/ai/chat - should execute ChatAgent and return v1 ServiceEnvelope", async () => {
    const req = createSignedRequest("/api/v1/ai/chat", {
      message: "What is the time right now?",
    });

    const res = await handleChat(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.meta.version).toBe("v1");
    expect(body.data.reply).toBeDefined();
  });

  it("POST /api/v1/ai/ghost/evaluate - should evaluate social triage and return policy decision", async () => {
    const req = createSignedRequest("/api/v1/ai/ghost/evaluate", {
      message: "Can I get pricing details?",
      senderName: "Prospective Client",
      platform: "x",
      autonomyMode: "assist",
    });

    const res = await handleGhost(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.decision).toBeDefined();
    expect(body.data.riskLevel).toBeDefined();
  });

  it("POST /api/v1/ai/content/generate - should generate compliant multi-platform content", async () => {
    const req = createSignedRequest("/api/v1/ai/content/generate", {
      topic: "Autonomous AI Workflows",
      targetPlatform: "linkedin",
      repurposeTargets: ["x"],
    });

    const res = await handleContent(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.primaryDraft.platform).toBe("linkedin");
    expect(body.data.repurposedDrafts.length).toBe(1);
  });

  it("POST /api/v1/ai/memory/search - should retrieve workspace memories", async () => {
    const req = createSignedRequest("/api/v1/ai/memory/search", {
      query: "brand rules and forbidden phrases",
      limit: 3,
    });

    const res = await handleMemory(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("should reject unsigned or unauthorized calls with HTTP 401", async () => {
    const unsignedReq = new NextRequest("http://localhost:3000/api/v1/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello" }),
    });

    const res = await handleChat(unsignedReq);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });
});
