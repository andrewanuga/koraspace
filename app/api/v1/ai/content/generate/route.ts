/**
 * v1 Content Generate Route Adapter: POST /api/v1/ai/content/generate
 *
 * Thin adapter authenticating service calls and generating multi-platform content drafts.
 */

import { NextRequest } from "next/server";
import { ServiceAuthEngine } from "@/lib/ai/core/service-auth";
import { ServiceEnvelopeBuilder } from "@/lib/ai/core/service-envelope";
import { V1ContentGenerateRequestSchema } from "@/lib/ai/contracts/v1";
import { ContentIntelligenceEngine } from "@/lib/ai/content/engine";
import type { ContentIntelligenceResult } from "@/lib/ai/content/types";

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
    const parsed = V1ContentGenerateRequestSchema.safeParse({ ...body, workspaceId });
    if (!parsed.success) {
      return ServiceEnvelopeBuilder.error(
        new Error(`Invalid request payload: ${parsed.error.issues.map((i) => i.message).join(", ")}`),
        { workspaceId, correlationId, startTime, fallbackStatus: 400 }
      );
    }

    // 3. Delegate to Domain Engine
    const result: ContentIntelligenceResult = await ContentIntelligenceEngine.generate(
      {
        topic: parsed.data.topic,
        targetPlatform: parsed.data.targetPlatform,
        objective: parsed.data.objective,
        repurposeTargets: parsed.data.repurposeTargets,
        customInstructions: parsed.data.customInstructions,
      },
      workspaceId
    );

    return ServiceEnvelopeBuilder.success(result, {
      workspaceId,
      correlationId,
      traceId: result.traceId,
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
