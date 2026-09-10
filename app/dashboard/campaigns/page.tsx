import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampaignsClient } from "./CampaignsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Outbound Campaigns | KoraSpace",
  description: "Plan, launch, monitor and optimize your outbound marketing campaigns from one command center.",
};

export default async function CampaignsPage() {
  const supabase = (await createClient()) as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, persona, full_name")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    !["advanced", "team"].includes(profile.plan) ||
    profile.persona !== "marketer"
  ) {
    redirect("/dashboard");
  }

  const { data: campaigns, error: campaignsError } = await supabase
    .from("dm_campaigns")
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (campaignsError) {
    console.error("Campaign fetch error:", campaignsError);
  }

  const campaignList = campaigns ?? [];
  const campaignIds = campaignList.map((campaign: any) => campaign.id);

  let leads: Array<{
    id: string;
    campaign_id: string;
    status: string;
    lead_score: number | null;
    last_contacted_at: string | null;
    created_at: string;
  }> = [];

  if (campaignIds.length > 0) {
    const { data, error } = await supabase
      .from("dm_campaign_leads")
      .select(`
        id,
        campaign_id,
        status,
        lead_score,
        last_contacted_at,
        created_at
      `)
      .in("campaign_id", campaignIds);

    if (error) {
      console.error("Lead fetch error:", error);
    } else {
      leads = data ?? [];
    }
  }

  const campaignStats = campaignList.map((campaign: any) => {
    const campaignLeads = leads.filter(
      (lead) => lead.campaign_id === campaign.id
    );

    const totalLeads = campaignLeads.length;

    const sentCount = campaignLeads.filter((lead) =>
      ["sent", "replied", "contacted", "closed"].includes(
        String(lead.status).toLowerCase()
      )
    ).length;

    const repliedCount = campaignLeads.filter((lead) =>
      ["replied", "closed"].includes(String(lead.status).toLowerCase())
    ).length;

    const convertedCount = campaignLeads.filter((lead) =>
      ["converted", "closed"].includes(String(lead.status).toLowerCase())
    ).length;

    const replyRate =
      sentCount > 0 ? (repliedCount / sentCount) * 100 : 0;

    const conversionRate =
      totalLeads > 0 ? (convertedCount / totalLeads) * 100 : 0;

    return {
      id: campaign.id,
      name: campaign.name,
      platform: campaign.platform || "instagram",
      status: campaign.status || "draft",
      audience_filter: campaign.audience_filter ?? {},
      message_sequence: campaign.message_sequence ?? [],
      created_at: campaign.created_at,
      updated_at: campaign.updated_at,

      stats: {
        totalLeads,
        sentCount,
        repliedCount,
        convertedCount,
        replyRate,
        conversionRate,
      },
    };
  });

  const totalLeads = campaignStats.reduce(
    (sum: number, campaign: any) => sum + campaign.stats.totalLeads,
    0
  );

  const totalSent = campaignStats.reduce(
    (sum: number, campaign: any) => sum + campaign.stats.sentCount,
    0
  );

  const totalReplies = campaignStats.reduce(
    (sum: number, campaign: any) => sum + campaign.stats.repliedCount,
    0
  );

  const totalConversions = campaignStats.reduce(
    (sum: number, campaign: any) => sum + campaign.stats.convertedCount,
    0
  );

  const activeCampaigns = campaignStats.filter(
    (campaign: any) => campaign.status === "active"
  ).length;

  const pausedCampaigns = campaignStats.filter(
    (campaign: any) => campaign.status === "paused"
  ).length;

  const draftCampaigns = campaignStats.filter(
    (campaign: any) => campaign.status === "draft"
  ).length;

  const overview = {
    totalCampaigns: campaignStats.length,
    activeCampaigns,
    pausedCampaigns,
    draftCampaigns,
    totalLeads,
    totalSent,
    totalReplies,
    totalConversions,
    replyRate:
      totalSent > 0 ? (totalReplies / totalSent) * 100 : 0,
    conversionRate:
      totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0,
  };

  return (
    <CampaignsClient
      initialCampaigns={campaignStats}
      overview={overview}
      userName={profile?.full_name || user.email?.split("@")[0] || "Marketer"}
    />
  );
}
