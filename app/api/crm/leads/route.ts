import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
      const user = session?.user;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: campaigns, error: campaignError } = await supabase
      .from("dm_campaigns")
      .select("id, name, platform, status")
      .eq("user_id", user.id);

    if (campaignError) {
      console.error("[CRM_LEADS_GET] Campaign fetch error:", campaignError);
      return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({ leads: [], campaigns: [] });
    }

    const campaignIds = campaigns.map((c: any) => c.id);

    const { data: leads, error: leadsError } = await supabase
      .from("dm_campaign_leads")
      .select("*")
      .in("campaign_id", campaignIds)
      .order("created_at", { ascending: false });

    if (leadsError) {
      console.error("[CRM_LEADS_GET] Leads fetch error:", leadsError);
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }

    const enrichedLeads = (leads || []).map((lead: any) => {
      const camp = campaigns.find((c: any) => c.id === lead.campaign_id);
      return {
        ...lead,
        campaign_name: camp?.name || "Unknown Campaign",
        platform: camp?.platform || "instagram",
      };
    });

    return NextResponse.json({ leads: enrichedLeads, campaigns });
  } catch (err: any) {
    console.error("[CRM_LEADS_GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
      const user = session?.user;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { campaign_id, recipient_handle, status = "pending", lead_score = 50, notes = "" } = body;

    if (!campaign_id || !recipient_handle) {
      return NextResponse.json(
        { error: "campaign_id and recipient_handle are required" },
        { status: 400 }
      );
    }

    // Verify campaign belongs to user
    const { data: campaign, error: campCheckErr } = await supabase
      .from("dm_campaigns")
      .select("id, name, platform")
      .eq("id", campaign_id)
      .eq("user_id", user.id)
      .single();

    if (campCheckErr || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found or access denied" },
        { status: 404 }
      );
    }

    const cleanHandle = recipient_handle.trim().startsWith("@")
      ? recipient_handle.trim()
      : `@${recipient_handle.trim()}`;

    const scoreNum = Math.min(100, Math.max(0, Number(lead_score) || 50));

    const { data: inserted, error: insertErr } = await supabase
      .from("dm_campaign_leads")
      .insert({
        campaign_id,
        recipient_handle: cleanHandle,
        status: status || "pending",
        lead_score: scoreNum,
        notes: (notes || "").trim(),
        last_contacted_at: status === "sent" || status === "replied" || status === "closed" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (insertErr || !inserted) {
      console.error("[CRM_LEADS_POST] Insert error:", insertErr);
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }

    const enriched = {
      ...inserted,
      campaign_name: campaign.name,
      platform: campaign.platform,
    };

    return NextResponse.json({ lead: enriched }, { status: 201 });
  } catch (err: any) {
    console.error("[CRM_LEADS_POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
      const user = session?.user;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const leadId = body.id || body.leadId;

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    // Verify lead belongs to user via campaign
    const { data: targetLead, error: leadFetchErr } = await supabase
      .from("dm_campaign_leads")
      .select("id, campaign_id")
      .eq("id", leadId)
      .single();

    if (leadFetchErr || !targetLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const { data: campaign, error: campCheckErr } = await supabase
      .from("dm_campaigns")
      .select("id, name, platform")
      .eq("id", targetLead.campaign_id)
      .eq("user_id", user.id)
      .single();

    if (campCheckErr || !campaign) {
      return NextResponse.json({ error: "Unauthorized for this campaign lead" }, { status: 403 });
    }

    const updates: Record<string, any> = {};

    if (body.status !== undefined) {
      updates.status = body.status;
      if (body.status === "sent" || body.status === "replied" || body.status === "closed") {
        updates.last_contacted_at = new Date().toISOString();
      }
    }

    if (body.lead_score !== undefined) {
      updates.lead_score = Math.min(100, Math.max(0, Number(body.lead_score) || 0));
    }

    if (body.notes !== undefined) {
      updates.notes = String(body.notes);
    }

    if (body.recipient_handle !== undefined) {
      const h = String(body.recipient_handle).trim();
      updates.recipient_handle = h.startsWith("@") ? h : `@${h}`;
    }

    if (body.last_contacted_at !== undefined) {
      updates.last_contacted_at = body.last_contacted_at;
    }

    const { data: updated, error: updateErr } = await supabase
      .from("dm_campaign_leads")
      .update(updates)
      .eq("id", leadId)
      .select()
      .single();

    if (updateErr || !updated) {
      console.error("[CRM_LEADS_PATCH] Update error:", updateErr);
      return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
    }

    const enriched = {
      ...updated,
      campaign_name: campaign.name,
      platform: campaign.platform,
    };

    return NextResponse.json({ lead: enriched });
  } catch (err: any) {
    console.error("[CRM_LEADS_PATCH] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
      const user = session?.user;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    let leadId = url.searchParams.get("id");

    if (!leadId) {
      try {
        const body = await req.json();
        leadId = body?.id || body?.leadId;
      } catch {
        // query param is fine
      }
    }

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    // Verify lead belongs to user
    const { data: targetLead, error: leadFetchErr } = await supabase
      .from("dm_campaign_leads")
      .select("id, campaign_id")
      .eq("id", leadId)
      .single();

    if (leadFetchErr || !targetLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const { data: campaign, error: campCheckErr } = await supabase
      .from("dm_campaigns")
      .select("id")
      .eq("id", targetLead.campaign_id)
      .eq("user_id", user.id)
      .single();

    if (campCheckErr || !campaign) {
      return NextResponse.json({ error: "Unauthorized for this campaign lead" }, { status: 403 });
    }

    const { error: delErr } = await supabase
      .from("dm_campaign_leads")
      .delete()
      .eq("id", leadId);

    if (delErr) {
      console.error("[CRM_LEADS_DELETE] Delete error:", delErr);
      return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: leadId });
  } catch (err: any) {
    console.error("[CRM_LEADS_DELETE] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
