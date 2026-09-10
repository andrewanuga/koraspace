import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const AUTOMATION_TYPES = [
  "lead_nurturing",
  "re_engagement",
  "social_posting",
  "welcome",
  "ecommerce",
  "event_follow_up",
  "product_launch",
  "feedback",
  "custom",
];

const STATUSES = ["active", "paused", "draft"];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    let query = (supabase as any)
      .from("marketing_automations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (status && STATUSES.includes(status)) {
      query = query.eq("status", status);
    }

    if (type && AUTOMATION_TYPES.includes(type)) {
      query = query.eq("type", type);
    }

    if (search?.trim()) {
      const safeSearch = search.trim().replace(/[%_]/g, "");
      query = query.or(
        `name.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("GET /api/automations", error);
      return NextResponse.json(
        { error: "Failed to load automations" },
        { status: 500 }
      );
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
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const type = AUTOMATION_TYPES.includes(body.type) ? body.type : "custom";
    const status = STATUSES.includes(body.status) ? body.status : "draft";
    const triggerType =
      typeof body.trigger_type === "string" ? body.trigger_type : "manual";
    const triggerConfig =
      body.trigger_config && typeof body.trigger_config === "object"
        ? body.trigger_config
        : {};
    const steps = Array.isArray(body.steps) ? body.steps : [];

    if (!name) {
      return NextResponse.json(
        { error: "Automation name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase as any)
      .from("marketing_automations")
      .insert({
        user_id: user.id,
        name,
        description,
        type,
        status,
        trigger_type: triggerType,
        trigger_config: triggerConfig,
        steps,
      })
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/automations", error);
      return NextResponse.json(
        { error: "Failed to create automation" },
        { status: 500 }
      );
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
