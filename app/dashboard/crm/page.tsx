import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CrmClient } from "./CrmClient";

export const metadata = {
  title: "Lead Pipeline | CRM | KoraSpace",
  description: "Track and manage leads progressing through automated outreach campaigns.",
};

export default async function CrmPage() {
  const session = await auth();
    const user = session?.user;
  const supabase = await createClient();

  if (!user) redirect("/login");

  // Fetch the user's plan and persona
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, persona")
    .eq("id", user.id)
    .single();

  if (
    (profile?.plan !== "advanced" && profile?.plan !== "team") ||
    profile?.persona !== "marketer"
  ) {
    redirect("/dashboard");
  }

  // Fetch all campaigns for this user
  const { data: campaigns } = await supabase
    .from("dm_campaigns")
    .select("id, name, platform, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const userCampaigns = campaigns || [];
  const campaignIds = userCampaigns.map((c: any) => c.id);

  let enrichedLeads: any[] = [];

  if (campaignIds.length > 0) {
    const { data: leads } = await supabase
      .from("dm_campaign_leads")
      .select("*")
      .in("campaign_id", campaignIds)
      .order("created_at", { ascending: false });

    enrichedLeads = (leads || []).map((l: any) => {
      const camp = userCampaigns.find((c: any) => c.id === l.campaign_id);
      return {
        ...l,
        campaign_name: camp?.name || "Unknown Campaign",
        platform: camp?.platform || "instagram",
      };
    });
  }

  return (
    <CrmClient
      initialLeads={enrichedLeads}
      initialCampaigns={userCampaigns}
    />
  );
}
