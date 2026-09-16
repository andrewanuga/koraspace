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

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, persona")
      .eq("id", user.id)
      .single();

    if (
      !profile ||
      !["advanced", "team"].includes(profile.plan) ||
      profile.persona !== "marketer"
    ) {
      return NextResponse.json(
        { error: "Campaign access denied" },
        { status: 403 }
      );
    }

    const { data: campaigns, error } = await supabase
      .from("dm_campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/marketer/campaigns error:", error);
      return NextResponse.json(
        { error: "Failed to fetch campaigns" },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaigns: campaigns || [] });
  } catch (err: any) {
    console.error("Exception in GET /api/marketer/campaigns:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
      const user = session?.user;

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, persona")
      .eq("id", user.id)
      .single();

    if (
      !profile ||
      !["advanced", "team"].includes(profile.plan) ||
      profile.persona !== "marketer"
    ) {
      return NextResponse.json(
        { error: "Campaign access denied" },
        { status: 403 }
      );
    }

    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const platform =
      typeof body.platform === "string"
        ? body.platform.trim().toLowerCase()
        : "instagram";

    if (!name) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    const { data: campaign, error } = await supabase
      .from("dm_campaigns")
      .insert({
        user_id: user.id,
        name,
        platform,
        status: body.status || "draft",
        audience_filter: body.audience_filter ?? {},
        message_sequence: body.message_sequence ?? [],
      })
      .select(`
        id,
        user_id,
        name,
        platform,
        status,
        audience_filter,
        message_sequence,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error("Create campaign error:", error);

      return NextResponse.json(
        {
          error:
            "Unable to create campaign. Check your campaign database schema.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      campaign,
    });
  } catch (err: any) {
    console.error("Exception in POST /api/marketer/campaigns:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
