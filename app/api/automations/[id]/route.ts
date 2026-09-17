import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
      const user = session?.user;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Fetch automation
    let { data: automation, error } = await (supabase as any)
      .from("automations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !automation) {
      // Try fallback table
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
      } else {
        return NextResponse.json({ error: "Automation not found" }, { status: 404 });
      }
    }

    // Fetch recent execution runs
    const { data: runs } = await (supabase as any)
      .from("automation_runs")
      .select("*, automation_node_runs(*)")
      .eq("automation_id", id)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      automation,
      runs: runs || [],
    });
  } catch (err: any) {
    console.error("Exception in GET /api/automations/[id]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
      const user = session?.user;

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

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.nodes !== undefined) updateData.nodes = body.nodes;
    if (body.edges !== undefined) updateData.edges = body.edges;
    if (body.settings !== undefined) updateData.settings = body.settings;
    if (body.trigger_type !== undefined) updateData.trigger_type = body.trigger_type;
    if (body.trigger_config !== undefined) updateData.trigger_config = body.trigger_config;

    let { data, error } = await (supabase as any)
      .from("automations")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      // Try fallback table update
      const fallback = await (supabase as any)
        .from("marketing_automations")
        .update({
          name: updateData.name,
          description: updateData.description,
          status: updateData.status,
          steps: updateData.nodes,
          updated_at: updateData.updated_at,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (fallback.error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      data = {
        ...fallback.data,
        nodes: updateData.nodes || [],
        edges: updateData.edges || [],
      };
    }

    return NextResponse.json({ automation: data });
  } catch (err: any) {
    console.error("Exception in PATCH /api/automations/[id]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
      const user = session?.user;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Soft delete to archived
    const { error } = await (supabase as any)
      .from("automations")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      await (supabase as any)
        .from("marketing_automations")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Exception in DELETE /api/automations/[id]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
