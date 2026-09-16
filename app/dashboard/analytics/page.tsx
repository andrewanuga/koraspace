import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { daysAgoISO } from "@/lib/dashboard/helpers";
import { AnalyticsClient } from "./AnalyticsClient";
import type { SocialPost, Campaign } from "@/lib/social/types";

export default async function AnalyticsPage() {
  const session = await auth();
    const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const d30 = daysAgoISO(30);

  const [
    { data: profile },
    { data: posts },
    { data: campaigns },
    { data: accounts },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("persona")
      .eq("id", user.id)
      .single(),

    supabase
      .from("social_posts")
      .select("*")
      .gte("posted_at", d30)
      .order("posted_at", { ascending: true }),

    supabase
      .from("social_campaigns")
      .select("*")
      .order("spend", { ascending: false }),

    supabase
      .from("social_accounts")
      .select("platform, status"),
  ]);

  return (
    <AnalyticsClient
      persona={profile?.persona ?? "creator"}
      posts={(posts ?? []) as SocialPost[]}
      campaigns={(campaigns ?? []) as Campaign[]}
      connectedCount={
        (accounts ?? []).filter(
          (account) => account.status === "connected"
        ).length
      }
    />
  );
}