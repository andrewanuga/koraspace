import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getDiscoveryData,
  type SocialPost,
  type Campaign,
  type SocialAccount,
} from "@/lib/marketer/discovery";
import { DiscoveryClient } from "./DiscoveryClient";

export default async function DiscoverPage() {
  const session = await auth();
    const user = session?.user;
  const supabase = await createClient();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, persona, full_name")
    .eq("id", user.id)
    .single();

  // Allow access if marketer persona or team/advanced tier (graceful fallback)
  if (
    profile &&
    profile.persona !== "marketer" &&
    profile.plan !== "advanced" &&
    profile.plan !== "team"
  ) {
    redirect("/dashboard");
  }

  // Fetch recent publishing, campaigns, and account data
  const [{ data: posts }, { data: campaigns }, { data: accounts }] =
    await Promise.all([
      supabase
        .from("social_posts")
        .select(
          `
            id,
            user_id,
            platform,
            content,
            impressions,
            engagement,
            likes,
            comments,
            shares,
            created_at
          `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100),

      supabase
        .from("social_campaigns")
        .select(
          `
            id,
            user_id,
            name,
            platform,
            status,
            spend,
            conversions,
            roas
          `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),

      supabase
        .from("social_accounts")
        .select("id, platform, username, status")
        .eq("user_id", user.id),
    ]);

  const initialDiscovery = await getDiscoveryData(
    user.id,
    (posts || []) as SocialPost[],
    (campaigns || []) as Campaign[]
  );

  return (
    <DiscoveryClient
      user={{
        id: user.id,
        name: profile?.full_name || "Marketer",
      }}
      posts={(posts || []) as SocialPost[]}
      campaigns={(campaigns || []) as Campaign[]}
      accounts={(accounts || []) as SocialAccount[]}
      initialDiscovery={initialDiscovery}
    />
  );
}
