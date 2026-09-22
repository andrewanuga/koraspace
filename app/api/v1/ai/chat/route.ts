/**
 * v1 AI Chat Route Adapter: POST /api/v1/ai/chat
 *
 * Thin adapter authenticating service calls and dispatching to ChatAgent.
 */

import { NextRequest } from "next/server";
import { ServiceAuthEngine } from "@/lib/ai/core/service-auth";
import { ServiceEnvelopeBuilder } from "@/lib/ai/core/service-envelope";
import { V1ChatRequestSchema, type V1ChatResponse } from "@/lib/ai/contracts/v1";
import { ChatAgent } from "@/lib/ai/agents/chat/agent";

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
    const parsed = V1ChatRequestSchema.safeParse({ ...body, workspaceId });
    if (!parsed.success) {
      return ServiceEnvelopeBuilder.error(
        new Error(`Invalid request payload: ${parsed.error.issues.map((i) => i.message).join(", ")}`),
        { workspaceId, correlationId, startTime, fallbackStatus: 400 }
      );
    }

    // 3. Delegate to Domain Agent
    const result = await ChatAgent.execute(
      {
        messages: [{ role: "user", content: parsed.data.message }],
      },
      {
        userId: auth.context.userId,
        workspaceId,
        model: parsed.data.model,
      }
    );

    const responseData: V1ChatResponse = {
      reply: result.data?.content || "No reply generated.",
      toolCallsExecuted: result.data?.plan?.requiredTools || [],
      memoryItemsUsed: 0,
      selfCorrections: 0,
      costUsd: 0.0005,
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
