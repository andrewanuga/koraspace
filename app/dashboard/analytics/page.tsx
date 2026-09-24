import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AnalyticsClient } from "./AnalyticsClient";
import type { SocialPost, Campaign, SocialAccount } from "@/lib/social/types";

export default async function AnalyticsPage() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    redirect("/login");
  }

  let profile: any = null;
  let posts: any[] = [];
  let campaigns: any[] = [];
  let accounts: any[] = [];

  try {
    const [profileRes, postsRes, campaignsRes, accountsRes] = await Promise.allSettled([
      prisma.profile.findUnique({
        where: { id: user.id },
        select: { persona: true },
      }),
      prisma.$queryRaw<any[]>`
        SELECT * FROM "social_posts"
        WHERE "user_id"::text = ${user.id}
        ORDER BY "posted_at" ASC
      `,
      prisma.$queryRaw<any[]>`
        SELECT * FROM "social_campaigns"
        WHERE "user_id"::text = ${user.id}
        ORDER BY "spend" DESC
      `,
      prisma.$queryRaw<any[]>`
        SELECT "id", "user_id", "platform", "handle", "display_name", "avatar_url", "followers", "status"
        FROM "social_accounts"
        WHERE "user_id"::text = ${user.id}
      `,
    ]);

    if (profileRes.status === "fulfilled") profile = profileRes.value;
    if (postsRes.status === "fulfilled") posts = postsRes.value ?? [];
    if (campaignsRes.status === "fulfilled") campaigns = campaignsRes.value ?? [];
    if (accountsRes.status === "fulfilled") accounts = accountsRes.value ?? [];
  } catch (err) {
    console.error("Error loading analytics data:", err);
  }

  const socialAccounts = (accounts ?? []) as SocialAccount[];
  const connectedCount = socialAccounts.filter(
    (account) => account.status === "connected"
  ).length;

  return (
    <AnalyticsClient
      persona={profile?.persona ?? "creator"}
      posts={(posts ?? []) as SocialPost[]}
      campaigns={(campaigns ?? []) as Campaign[]}
      accounts={socialAccounts}
      connectedCount={connectedCount}
    />
  );
}