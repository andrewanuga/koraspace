import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { executeWorkflow } from "@/lib/automation/engine";
import { registerIntegrationExecutors } from "@/lib/automation/providers";
import type { AutomationWorkflow, AutomationContext } from "@/lib/automation/types";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
      const user = session?.user;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Empty body allowed
    }

    // 1. Fetch automation definition
    let { data: automation } = await (supabase as any)
      .from("automations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!automation) {
      // Fallback
      const fallback = await (supabase as any)
        .from("marketing_automations")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fallback.data) {
        automation = {
          ...fallback.data,
          nodes: fallback.data.nodes || fallback.data.steps || [],
          edges: fallback.data.edges || [],
        };
      }
    }

    if (!automation) {
      return NextResponse.json({ error: "Automation not found" }, { status: 404 });
    }

    // Parse workflow nodes & edges
    const nodes = Array.isArray(automation.nodes) ? automation.nodes : [];
    const edges = Array.isArray(automation.edges) ? automation.edges : [];

    if (!nodes.length) {
      return NextResponse.json(
        { error: "Automation has no nodes configured." },
        { status: 400 }
      );
    }

    // 2. Create execution run in database
    const startedAt = new Date().toISOString();
    let runId = `run_${Date.now()}`;

    const { data: runRecord } = await (supabase as any)
      .from("automation_runs")
      .insert({
        automation_id: automation.id,
        user_id: user.id,
        status: "running",
        trigger_payload: body.trigger || {},
        context: {},
        started_at: startedAt,
      })
      .select("*")
      .single();

    if (runRecord?.id) {
      runId = runRecord.id;
    }

    // 3. Register integration executors
    registerIntegrationExecutors();

    const workflow: AutomationWorkflow = {
      id: automation.id,
      name: automation.name,
      status: automation.status,
      nodes,
      edges,
      settings: automation.settings || {
        timezone: "UTC",
        maxRunsPerHour: 100,
        failurePolicy: "continue",
      },
    };

    const initialContext: AutomationContext = {
      userId: user.id,
      automationId: automation.id,
      runId,
      depth: 0,
      executionChain: [],
      trigger: body.trigger || { timestamp: startedAt, test: true },
      variables: {},
      results: {},
      logs: [],
    };

    try {
      const finalContext = await executeWorkflow(
        workflow,
        initialContext,
        async (node, status, stepInput, stepOutput, stepError) => {
          // Write step execution to automation_node_runs
          try {
            await (supabase as any)
              .from("automation_node_runs")
              .insert({
                run_id: runId,
                node_id: node.id,
                node_type: node.type,
                status,
                input: stepInput,
                output: stepOutput,
                error: stepError || null,
                started_at: startedAt,
                finished_at: new Date().toISOString(),
              });
          } catch {
            // Ignore step logging failure in test environments
          }
        }
      );

      const finishedAt = new Date().toISOString();

      // Mark run as success
      await (supabase as any)
        .from("automation_runs")
        .update({
          status: "success",
          context: finalContext,
          finished_at: finishedAt,
        })
        .eq("id", runId);

      // Update automation counters
      await (supabase as any)
        .from("automations")
        .update({
          last_run_at: finishedAt,
          last_success_at: finishedAt,
          total_runs: Number(automation.total_runs || 0) + 1,
          successful_runs: Number(automation.successful_runs || 0) + 1,
        })
        .eq("id", automation.id);

      return NextResponse.json({
        success: true,
        runId,
        context: finalContext,
      });
    } catch (execError: any) {
      const errorMessage = execError instanceof Error ? execError.message : String(execError);
      const finishedAt = new Date().toISOString();

      // Mark run as failed
      await (supabase as any)
        .from("automation_runs")
        .update({
          status: "failed",
          error: errorMessage,
          finished_at: finishedAt,
        })
        .eq("id", runId);

      await (supabase as any)
        .from("automations")
        .update({
          last_run_at: finishedAt,
          last_failure_at: finishedAt,
          total_runs: Number(automation.total_runs || 0) + 1,
          failed_runs: Number(automation.failed_runs || 0) + 1,
        })
        .eq("id", automation.id);

      return NextResponse.json(
        {
          success: false,
          runId,
          error: errorMessage,
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Exception in POST /api/automations/[id]/run:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
