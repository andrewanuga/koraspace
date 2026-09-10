import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const { data: automation, error: automationError } = await (supabase as any)
      .from("marketing_automations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (automationError || !automation) {
      return NextResponse.json(
        { error: "Automation not found" },
        { status: 404 }
      );
    }

    if (automation.status !== "active") {
      return NextResponse.json(
        {
          error: "Only active automations can be executed.",
        },
        { status: 400 }
      );
    }

    const { data: run, error: runError } = await (supabase as any)
      .from("marketing_automation_runs")
      .insert({
        automation_id: automation.id,
        user_id: user.id,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (runError || !run) {
      console.error("Error creating automation run:", runError);
      return NextResponse.json(
        { error: "Could not start automation run" },
        { status: 500 }
      );
    }

    const completedAt = new Date().toISOString();

    await (supabase as any)
      .from("marketing_automation_runs")
      .update({
        status: "completed",
        completed_at: completedAt,
      })
      .eq("id", run.id)
      .eq("user_id", user.id);

    await (supabase as any)
      .from("marketing_automations")
      .update({
        last_run_at: completedAt,
      })
      .eq("id", automation.id)
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      run_id: run.id,
    });
  } catch (err: any) {
    console.error("Exception in POST /api/automations/[id]/run:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
