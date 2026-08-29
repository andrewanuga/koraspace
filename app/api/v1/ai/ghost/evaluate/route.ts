/**
 * v1 Ghost Evaluate Route Adapter: POST /api/v1/ai/ghost/evaluate
 *
 * Thin adapter authenticating service calls and evaluating social triage with GhostAgent.
 */

import { NextRequest } from "next/server";
import { ServiceAuthEngine } from "@/lib/ai/core/service-auth";
import { ServiceEnvelopeBuilder } from "@/lib/ai/core/service-envelope";
import { V1GhostEvaluateRequestSchema, type V1GhostEvaluateResponse } from "@/lib/ai/contracts/v1";
import { GhostAgent } from "@/lib/ai/agents/ghost/agent";

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
    const parsed = V1GhostEvaluateRequestSchema.safeParse({ ...body, workspaceId });
    if (!parsed.success) {
      return ServiceEnvelopeBuilder.error(
        new Error(`Invalid request payload: ${parsed.error.issues.map((i) => i.message).join(", ")}`),
        { workspaceId, correlationId, startTime, fallbackStatus: 400 }
      );
    }

    // 3. Delegate to Domain Agent
    const result = await GhostAgent.evaluate(
      {
        message: parsed.data.message,
        senderName: parsed.data.senderName,
        platform: parsed.data.platform,
      },
      {
        userId: auth.context.userId,
        workspaceId,
        autonomyMode: parsed.data.autonomyMode,
      }
    );

    const responseData: V1GhostEvaluateResponse = {
      decision: result.data?.policy.decision || "REQUIRE_APPROVAL",
      action: result.data?.action || "auto_reply",
      proposedReply: result.data?.reply,
      confidence: result.data?.confidence || 80,
      isLead: result.data?.isLead || false,
      riskLevel: result.data?.riskLevel || "low",
      reasons: result.data?.policy.reasons || [],
    };

    return ServiceEnvelopeBuilder.success(responseData, {
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
