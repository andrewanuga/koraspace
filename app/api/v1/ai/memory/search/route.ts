/**
 * v1 Memory Search Route Adapter: POST /api/v1/ai/memory/search
 *
 * Thin adapter authenticating service calls and retrieving workspace memories.
 */

import { NextRequest } from "next/server";
import { ServiceAuthEngine } from "@/lib/ai/core/service-auth";
import { ServiceEnvelopeBuilder } from "@/lib/ai/core/service-envelope";
import { V1MemorySearchRequestSchema } from "@/lib/ai/contracts/v1";
import { BrandIntelligenceLoader } from "@/lib/ai/memory/brand";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let workspaceId = "default";
  let correlationId: string | undefined = undefined;

  try {
    // 1. Service-to-Service Authentication
    const auth = ServiceAuthEngine.authenticateRequest(req.headers);
    if (!auth.authenticated || !auth.context) {
      return ServiceEnvelopeBuilder.error(
        new Error(auth.error || "Unauthorized service request"),
        { workspaceId, correlationId, startTime, fallbackStatus: 401 }
      );
    }

    workspaceId = auth.context.workspaceId;
    correlationId = auth.context.correlationId;

    // 2. Validate Request Contract
    const body = await req.json();
    const parsed = V1MemorySearchRequestSchema.safeParse({ ...body, workspaceId });
    if (!parsed.success) {
      return ServiceEnvelopeBuilder.error(
        new Error(`Invalid request payload: ${parsed.error.issues.map((i) => i.message).join(", ")}`),
        { workspaceId, correlationId, startTime, fallbackStatus: 400 }
      );
    }

    // 3. Delegate to Brand & Memory Loader
    const brand = await BrandIntelligenceLoader.load(workspaceId);
    const guidelines = brand.brandGuidelines || ["Deliver concise, high-value tactical social content."];
    const memories = guidelines.slice(0, parsed.data.limit).map((rule, idx) => ({
      id: `mem_rule_${idx}`,
      workspaceId,
      source: "system" as const,
      memoryType: "brand_rule" as const,
      importance: 5 as const,
      content: rule,
      createdAt: new Date().toISOString(),
    }));

    return ServiceEnvelopeBuilder.success(memories, {
      workspaceId,
      correlationId,
      startTime,
    });
  } catch (err: any) {
    return ServiceEnvelopeBuilder.error(err, {
      workspaceId,
      correlationId,
      startTime,
    });
  }
}
