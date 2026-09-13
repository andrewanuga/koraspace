import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { executeWorkflow } from "@/lib/automation/engine";
import { registerIntegrationExecutors } from "@/lib/automation/providers";
import type { AutomationWorkflow, AutomationContext } from "@/lib/automation/types";

interface RouteContext {
  params: Promise<{
    automationId: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { automationId } = await context.params;
    const supabase = await createClient();

    // 1. Fetch webhook config
    const { data: webhook } = await (supabase as any)
      .from("automation_webhooks")
      .select("*")
      .eq("automation_id", automationId)
      .eq("enabled", true)
      .single();

    // Validate signature if webhook configured with secret
    if (webhook?.secret_hash) {
      const signature =
        request.headers.get("x-kora-webhook-secret") ||
        request.headers.get("x-webhook-secret");

      if (!signature) {
        return NextResponse.json({ error: "Missing webhook signature header." }, { status: 401 });
      }

      const calculatedHash = createHash("sha256").update(signature).digest("hex");
      if (calculatedHash !== webhook.secret_hash) {
        return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
      }
    }

    // 2. Fetch automation definition
    const { data: automation } = await (supabase as any)
      .from("automations")
      .select("*")
      .eq("id", automationId)
      .single();

    if (!automation) {
      return NextResponse.json({ error: "Target automation not found." }, { status: 404 });
    }

    if (automation.status !== "active") {
      return NextResponse.json(
        { error: "Automation is not active; webhook ignored." },
        { status: 400 }
      );
    }

    const payload = await request.json().catch(() => ({}));

    // 3. Idempotency Check via external_event_id
    const externalEventId =
      request.headers.get("x-event-id") ||
      payload?.id ||
      payload?.event_id ||
      payload?.data?.id ||
      `${automationId}_${Date.now()}`;

    const provider = automation.trigger_type || "webhook";

    // Attempt to register event in automation_events
    try {
      const { error: eventError } = await (supabase as any)
        .from("automation_events")
        .insert({
          user_id: automation.user_id,
          provider,
          event_type: "webhook_received",
          external_event_id: String(externalEventId),
          payload,
        });

      if (eventError && eventError.code === "23505") {
        // Duplicate external event detected (Postgres unique constraint violation)
        return NextResponse.json(
          { received: true, ignored: true, reason: "duplicate_event" },
          { status: 200 }
        );
      }
    } catch {
      // Continue if event table check passes
    }

    // 4. Trigger workflow execution
    registerIntegrationExecutors();

    const workflow: AutomationWorkflow = {
      id: automation.id,
      name: automation.name,
      status: automation.status,
      nodes: automation.nodes || [],
      edges: automation.edges || [],
      settings: automation.settings || {
        timezone: "UTC",
        maxRunsPerHour: 100,
        failurePolicy: "continue",
      },
    };

    const initialContext: AutomationContext = {
      userId: automation.user_id,
      automationId: automation.id,
      depth: 0,
      executionChain: [],
      trigger: {
        payload,
        externalEventId,
        headers: Object.fromEntries(request.headers.entries()),
      },
      variables: {},
      results: {},
    };

    // Execute in background
    executeWorkflow(workflow, initialContext).catch((err) => {
      console.error("Async webhook workflow execution error:", err);
    });

    return NextResponse.json({
      received: true,
      automationId,
      eventId: externalEventId,
    });
  } catch (err: any) {
    console.error("Exception in Webhook POST:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
