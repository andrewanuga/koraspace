import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
      const user = session?.user;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    // Primary query on enterprise automations table
    let query = (supabase as any)
      .from("automations")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "archived")
      .order("updated_at", { ascending: false });

    if (status && ["draft", "active", "paused"].includes(status)) {
      query = query.eq("status", status);
    }

    if (search?.trim()) {
      const safeSearch = search.trim().replace(/[%_]/g, "");
      query = query.or(`name.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`);
    }

    const { data, error } = await query;

    if (error) {
      // Fallback query if automations table is not yet populated
      const fallback = await (supabase as any)
        .from("marketing_automations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      return NextResponse.json({
        automations: (fallback.data ?? []).map((row: any) => ({
          ...row,
          nodes: row.nodes || row.steps || [],
          edges: row.edges || [],
          total_runs: row.contacts_count || 0,
          successful_runs: row.conversions || 0,
          failed_runs: 0,
        })),
      });
    }

    return NextResponse.json({
      automations: data ?? [],
    });
  } catch (err: any) {
    console.error("Exception in GET /api/automations:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
      const user = session?.user;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Untitled Automation";
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const status = ["draft", "active", "paused"].includes(body.status) ? body.status : "draft";
    const nodes = Array.isArray(body.nodes) ? body.nodes : [];
    const edges = Array.isArray(body.edges) ? body.edges : [];
    const triggerType = typeof body.trigger_type === "string" ? body.trigger_type : nodes.find((n: any) => n.type === "trigger")?.data?.provider || "manual";
    const triggerConfig = body.trigger_config && typeof body.trigger_config === "object" ? body.trigger_config : {};
    const settings = body.settings || {
      timezone: "UTC",
      maxRunsPerHour: 100,
      failurePolicy: "continue",
    };

    const { data, error } = await (supabase as any)
      .from("automations")
      .insert({
        user_id: user.id,
        name,
        description,
        status,
        trigger_type: triggerType,
        trigger_config: triggerConfig,
        nodes,
        edges,
        settings,
      })
      .select("*")
      .single();

    if (error) {
      // Fallback insert to marketing_automations if automations migration not yet applied in local DB
      const fallback = await (supabase as any)
        .from("marketing_automations")
        .insert({
          user_id: user.id,
          name,
          description: description || "",
          status: status === "paused" ? "paused" : status === "active" ? "active" : "draft",
          steps: nodes,
        })
        .select("*")
        .single();

      if (fallback.error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        automation: {
          ...fallback.data,
          nodes,
          edges,
        },
      }, { status: 201 });
    }

    return NextResponse.json({ automation: data }, { status: 201 });
  } catch (err: any) {
    console.error("Exception in POST /api/automations:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
