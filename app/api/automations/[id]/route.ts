import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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

    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const allowedFields = [
      "name",
      "description",
      "type",
      "status",
      "trigger_type",
      "trigger_config",
      "steps",
      "contacts_count",
      "conversion_rate",
      "avg_time",
      "last_run_at",
      "next_run_at",
    ];

    const update: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        update[field] = body[field];
      }
    }

    if (
      update.name !== undefined &&
      (!update.name || typeof update.name !== "string")
    ) {
      return NextResponse.json(
        { error: "Invalid automation name" },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase as any)
      .from("marketing_automations")
      .update(update)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      console.error("PATCH /api/automations/[id]", error);
      return NextResponse.json(
        { error: "Automation not found or could not be updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      automation: data,
    });
  } catch (err: any) {
    console.error("Exception in PATCH /api/automations/[id]:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
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

    const { error } = await (supabase as any)
      .from("marketing_automations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("DELETE /api/automations/[id]", error);
      return NextResponse.json(
        { error: "Failed to delete automation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
    console.error("Exception in DELETE /api/automations/[id]:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
