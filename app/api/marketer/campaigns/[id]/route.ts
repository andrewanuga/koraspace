import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

async function getAuthorizedCampaign(id: string) {
  const session = await auth();
    const user = session?.user;

  if (!user) {
    return {
      supabase,
      user: null,
      campaign: null,
    };
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
    return {
      supabase,
      user,
      campaign: null,
    };
  }

  const { data: campaign } = await supabase
    .from("dm_campaigns")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return {
    supabase,
    user,
    campaign,
  };
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const { supabase, user, campaign } = await getAuthorizedCampaign(id);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
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

    const allowedStatuses = ["draft", "active", "paused", "completed"];

    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid campaign status" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();

      if (!name) {
        return NextResponse.json(
          { error: "Campaign name cannot be empty" },
          { status: 400 }
        );
      }

      updates.name = name;
    }

    if (typeof body.platform === "string") {
      updates.platform = body.platform.trim().toLowerCase();
    }

    if (typeof body.status === "string") {
      updates.status = body.status;
    }

    if (body.audience_filter !== undefined) {
      updates.audience_filter = body.audience_filter;
    }

    if (body.message_sequence !== undefined) {
      updates.message_sequence = body.message_sequence;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No changes supplied" },
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("dm_campaigns")
      .update(updates)
      .eq("id", campaign.id)
      .eq("user_id", user.id)
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
      console.error("Campaign update error:", error);

      return NextResponse.json(
        { error: "Unable to update campaign" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      campaign: data,
    });
  } catch (err: any) {
    console.error("Exception in PATCH /api/marketer/campaigns/[id]:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const { supabase, user, campaign } = await getAuthorizedCampaign(id);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Delete leads first in case the database does not have ON DELETE CASCADE configured
    const { error: leadsError } = await supabase
      .from("dm_campaign_leads")
      .delete()
      .eq("campaign_id", campaign.id);

    if (leadsError) {
      console.error("Campaign leads delete error:", leadsError);
      return NextResponse.json(
        { error: "Unable to remove campaign leads" },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .from("dm_campaigns")
      .delete()
      .eq("id", campaign.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Campaign delete error:", error);
      return NextResponse.json(
        { error: "Unable to delete campaign" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
    console.error("Exception in DELETE /api/marketer/campaigns/[id]:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
