import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { daysAgoISO } from "@/lib/dashboard/helpers";
import { AnalyticsClient } from "./AnalyticsClient";
import type { SocialPost, Campaign } from "@/lib/social/types";

export default async function AnalyticsPage() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    redirect("/login");
  }

  const d30 = daysAgoISO(30);

  let profile: any = null;
  let posts: any[] = [];
  let campaigns: any[] = [];
  let accounts: any[] = [];

  try {
    const [profileRes, postsRes, campaignsRes, accountsRes] = await Promise.allSettled([
      prisma.profile.findUnique({
        where: { id: user.id },
        select: { persona: true }
      }),
      prisma.$queryRaw<any[]>`
        SELECT * FROM "social_posts"
        WHERE "user_id"::text = ${user.id} AND "posted_at" >= ${new Date(d30)}
        ORDER BY "posted_at" ASC
      `,
      prisma.$queryRaw<any[]>`
        SELECT * FROM "social_campaigns"
        WHERE "user_id"::text = ${user.id}
        ORDER BY "spend" DESC
      `,
      prisma.$queryRaw<any[]>`
        SELECT "platform", "status" FROM "social_accounts"
        WHERE "user_id"::text = ${user.id}
      `
    ]);

    if (profileRes.status === "fulfilled") profile = profileRes.value;
    if (postsRes.status === "fulfilled") posts = postsRes.value ?? [];
    if (campaignsRes.status === "fulfilled") campaigns = campaignsRes.value ?? [];
    if (accountsRes.status === "fulfilled") accounts = accountsRes.value ?? [];
  } catch (err) {
    console.error("Error loading analytics data:", err);
  }

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