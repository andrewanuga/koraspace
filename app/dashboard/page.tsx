import { redirect } from "next/navigation";
import Link from "next/link";

import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Users,
  Flame,
  ArrowUpRight,
  Zap,
  Plug,
  RefreshCw,
  MessageCircle,
  Send,
  Play,
  Globe,
  AtSign,
  Radio,
  Tv,
  Search,
  Bell,
  ChevronDown,
  Video,
  Clock,
  CalendarClock,
  Lightbulb,
  Sparkles,
  MoreHorizontal,
  BarChart3,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import {
  fmtNum,
  pctChange,
  sumField,
  platformLabel,
  daysAgoISO,
} from "@/lib/dashboard/helpers";

import { SyncButton } from "@/components/dashboard/SyncButton";
import { RecentAnalyticsCard } from "@/components/dashboard/RecentAnalyticsCard";

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const PLATFORM_ICONS: Record<
  string,
  React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>
> = {
  youtube: Play,
  instagram: AtSign,
  facebook: Globe,
  x: AtSign,
  threads: MessageCircle,
  telegram: Send,
  tiktok: Tv,
  whatsapp: MessageCircle,
  linkedin: Globe,
  snapchat: Radio,
  reddit: Globe,
};

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "#FF0000",
  instagram: "#E1306C",
  facebook: "#1877F2",
  x: "#FFFFFF",
  threads: "#FFFFFF",
  telegram: "#2AABEE",
  tiktok: "#69C9D0",
  whatsapp: "#25D366",
  linkedin: "#0A66C2",
};

/* -------------------------------------------------------------------------- */
/*                               PLATFORM ICON                                */
/* -------------------------------------------------------------------------- */

function PlatformIcon({
  platform,
  className,
  color,
}: {
  platform: string;
  className?: string;
  color?: string;
}) {
  const Icon = PLATFORM_ICONS[platform] ?? Plug;

  return (
    <Icon
      className={className}
      style={color ? { color } : undefined}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                 SPARKLINE                                  */
/* -------------------------------------------------------------------------- */

function Sparkline({
  trend,
  color,
}: {
  trend: "up" | "down" | "flat";
  color: string;
}) {
  const paths = {
    up: "M2 26 C 9 25, 14 21, 20 18 S 31 15, 36 8 S 40 5, 42 3",
    down: "M2 4 C 9 6, 14 10, 20 13 S 31 17, 36 23 S 40 25, 42 27",
    flat: "M2 16 C 9 14, 14 18, 20 15 S 31 17, 36 14 S 40 16, 42 15",
  };

  return (
    <svg
      viewBox="0 0 44 30"
      className="h-8 w-16 flex-shrink-0"
      fill="none"
    >
      <path
        d={paths[trend]}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                             AUDIENCE TREND GRAPH                           */
/* -------------------------------------------------------------------------- */

function AreaTrend({
  trend,
}: {
  trend: "up" | "down" | "flat";
}) {
  const paths = {
    up: {
      line: "M0 70 L20 66 L40 60 L60 50 L80 34 L100 24 L120 10",
      area: "M0 70 L20 66 L40 60 L60 50 L80 34 L100 24 L120 10 L120 90 L0 90 Z",
    },

    down: {
      line: "M0 10 L20 20 L40 30 L60 44 L80 56 L100 68 L120 80",
      area: "M0 10 L20 20 L40 30 L60 44 L80 56 L100 68 L120 80 L120 90 L0 90 Z",
    },

    flat: {
      line: "M0 45 L20 42 L40 48 L60 40 L80 46 L100 38 L120 42",
      area: "M0 45 L20 42 L40 48 L60 40 L80 46 L100 38 L120 42 L120 90 L0 90 Z",
    },
  };

  const current = paths[trend];

  return (
    <svg
      viewBox="0 0 120 90"
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      <path
        d={current.area}
        fill="rgba(59,130,246,0.08)"
      />

      <path
        d={current.line}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                              TREND DIRECTION                               */
/* -------------------------------------------------------------------------- */

function trendDirection(pct: {
  change: string;
  positive?: boolean;
}) {
  if (pct.change === "—") return "flat" as const;

  return pct.positive
    ? ("up" as const)
    : ("down" as const);
}

/* -------------------------------------------------------------------------- */
/*                           AI RECOMMENDATIONS                               */
/* -------------------------------------------------------------------------- */

function buildRecommendations(
  topAccount: { platform: string } | undefined,
  engRatio: number,
  leadsCount: number
) {
  return [
    {
      icon: Video,
      color: "#EC4899",
      title: "Content opportunity",
      text: topAccount
        ? `Post more video — ${platformLabel(
            topAccount.platform
          )} is your strongest channel right now.`
        : "Connect an account to unlock platform-specific recommendations.",
    },

    {
      icon: Heart,
      color: "#8B5CF6",
      title: "Engagement insight",
      text:
        engRatio > 0.05
          ? "Engagement is strong. Try a carousel format to push performance further."
          : "Engagement is light this week. Try a stronger conversational hook.",
    },

    {
      icon: Clock,
      color: "#3B82F6",
      title: "Timing recommendation",
      text:
        leadsCount > 0
          ? `${leadsCount} new lead${
              leadsCount > 1 ? "s" : ""
            } came in. Reply quickly to improve conversion.`
          : "Your audience is most likely to engage between 7–9pm.",
    },
  ];
}

/* -------------------------------------------------------------------------- */
/*                                PAGE                                       */
/* -------------------------------------------------------------------------- */

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /* ---------------------------------------------------------------------- */
  /*                               PROFILE                                  */
  /* ---------------------------------------------------------------------- */

  const { data: onboardProfile } = await supabase
    .from("profiles")
    .select("onboarded, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (onboardProfile && !onboardProfile.onboarded) {
    redirect("/onboarding");
  }

  /* ---------------------------------------------------------------------- */
  /*                               DATES                                    */
  /* ---------------------------------------------------------------------- */

  const d7 = daysAgoISO(7);
  const d14 = daysAgoISO(14);
  const nowISO = new Date().toISOString();

  /* ---------------------------------------------------------------------- */
  /*                                DATA                                    */
  /* ---------------------------------------------------------------------- */

  const [
    { data: accounts },
    { data: curr },
    { data: prev },
    { data: topPosts },
    { data: leads },
    { data: upcoming },
    { data: dailyRaw },
  ] = await Promise.all([
    supabase
      .from("social_accounts")
      .select(
        "id, platform, handle, display_name, avatar_url, followers, status, last_synced_at"
      )
      .eq("user_id", user.id),

    supabase
      .from("social_posts")
      .select(
        "platform, impressions, likes, comments, shares, followers_gained, revenue, account_id, video_views"
      )
      .gte("posted_at", d7),

    supabase
      .from("social_posts")
      .select(
        "impressions, likes, comments, shares, followers_gained, revenue"
      )
      .gte("posted_at", d14)
      .lt("posted_at", d7),

    supabase
      .from("social_posts")
      .select(
        "content, platform, impressions, likes, comments, revenue, video_views, posted_at"
      )
      .order("impressions", { ascending: false })
      .limit(5),

    supabase
      .from("social_inbox")
      .select(
        "author_name, body, platform, received_at"
      )
      .eq("category", "lead")
      .order("received_at", {
        ascending: false,
      })
      .limit(4),

    supabase
      .from("social_posts")
      .select("content, platform, posted_at")
      .gte("posted_at", nowISO)
      .order("posted_at", {
        ascending: true,
      })
      .limit(4),

    supabase
      .from("social_posts")
      .select(
        "posted_at, impressions, video_views, likes, comments, shares, followers_gained"
      )
      .gte("posted_at", d7),
  ]);

  /* ---------------------------------------------------------------------- */
  /*                              METRICS                                    */
  /* ---------------------------------------------------------------------- */

  type EngRow = {
    likes?: number | null;
    comments?: number | null;
    shares?: number | null;
    video_views?: number | null;
  };

  const eng = (row: EngRow) =>
    (row.likes ?? 0) +
    (row.comments ?? 0) +
    (row.shares ?? 0);

  const engSum = (rows: EngRow[] | null) =>
    (rows ?? []).reduce(
      (total, row) => total + eng(row),
      0
    );

  const totals = {
    impressions:
      sumField(curr, "impressions") +
      sumField(curr, "video_views"),

    engagements: engSum(curr),

    followers: (accounts ?? []).reduce(
      (total, account) =>
        total + (account.followers ?? 0),
      0
    ),
  };

  const prevTotals = {
    impressions: sumField(prev, "impressions"),

    engagements: engSum(prev),

    followers: sumField(
      prev,
      "followers_gained"
    ),
  };

  const connectedAccounts = (accounts ?? []).filter(
    (account) => account.status === "connected"
  );

  const connectedCount = connectedAccounts.length;

  const totalFollowers = totals.followers;

  const engRatio =
    totals.impressions > 0
      ? totals.engagements / totals.impressions
      : 0;

  const topReachCurrent = Math.max(
    0,
    ...(curr ?? []).map(
      (post) =>
        (post.impressions ?? 0) +
        (post.video_views ?? 0)
    ),
    0
  );

  const topReachPrev = Math.max(
    0,
    ...(prev ?? []).map(
      (post: any) => post.impressions ?? 0
    ),
    0
  );

  /* ---------------------------------------------------------------------- */
  /*                           METRIC CARDS                                  */
  /* ---------------------------------------------------------------------- */

  const metrics = [
    {
      label: "Followers",
      value: fmtNum(totalFollowers),
      icon: Users,
      color: "#EC4899",
      ...pctChange(
        totalFollowers,
        prevTotals.followers
      ),
    },

    {
      label: "Engagement",
      value: `${(engRatio * 100).toFixed(1)}%`,
      icon: Heart,
      color: "#8B5CF6",
      ...pctChange(
        totals.engagements,
        prevTotals.engagements
      ),
    },

    {
      label: "Reach",
      value: fmtNum(totals.impressions),
      icon: Eye,
      color: "#3B82F6",
      ...pctChange(
        totals.impressions,
        prevTotals.impressions
      ),
    },

    {
      label: "Top Content",
      value: fmtNum(topReachCurrent),
      icon: Flame,
      color: "#F59E0B",
      ...pctChange(
        topReachCurrent,
        topReachPrev
      ),
    },
  ];

  /* ---------------------------------------------------------------------- */
  /*                          PLATFORM STATS                                 */
  /* ---------------------------------------------------------------------- */

  const platformStats = connectedAccounts
    .map((account) => {
      const accountPosts = (curr ?? []).filter(
        (post) => post.account_id === account.id
      );

      const accountImpr =
        sumField(accountPosts, "impressions") +
        sumField(accountPosts, "video_views");

      const accountEng = engSum(accountPosts);

      return {
        acc: account,
        accountImpr,
        accountEng,
      };
    })
    .sort(
      (a, b) =>
        b.accountImpr - a.accountImpr
    );

  const topAccount = platformStats[0]?.acc;

  const recommendations = buildRecommendations(
    topAccount,
    engRatio,
    leads?.length ?? 0
  );

  const topPost = topPosts?.[0];

  /* ---------------------------------------------------------------------- */
  /*                           DAILY CHART                                   */
  /* ---------------------------------------------------------------------- */

  const dayBuckets: Record<
    string,
    {
      views: number;
      engagement: number;
      reach: number;
      followers: number;
    }
  > = {};

  const dayOrder: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();

    date.setDate(
      date.getDate() - i
    );

    const key = date
      .toISOString()
      .slice(0, 10);

    dayOrder.push(key);

    dayBuckets[key] = {
      views: 0,
      engagement: 0,
      reach: 0,
      followers: 0,
    };
  }

  for (const row of dailyRaw ?? []) {
    const key = (
      row.posted_at as string
    )?.slice(0, 10);

    if (!key || !dayBuckets[key]) {
      continue;
    }

    const views =
      row.video_views ?? 0;

    const reach =
      (row.impressions ?? 0) +
      views;

    const engagement =
      (row.likes ?? 0) +
      (row.comments ?? 0) +
      (row.shares ?? 0);

    dayBuckets[key].views +=
      views || reach;

    dayBuckets[key].reach += reach;

    dayBuckets[key].engagement +=
      engagement;

    dayBuckets[key].followers +=
      row.followers_gained ?? 0;
  }

  const dailySeries = dayOrder.map(
    (key) => {
      const date = new Date(key);

      return {
        label: date.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        ),

        ...dayBuckets[key],
      };
    }
  );

  const platformRows = platformStats
    .slice(0, 4)
    .map(({ acc, accountImpr }) => {
      const pct = pctChange(
        accountImpr,
        Math.round(accountImpr * 0.85)
      );

      return {
        platform: acc.platform,

        value: accountImpr,

        pct: pct.change,

        positive:
          pct.positive ?? true,

        color:
          PLATFORM_COLORS[
            acc.platform
          ] ?? "#EC4899",
      };
    });

  /* ---------------------------------------------------------------------- */
  /*                               GREETING                                  */
  /* ---------------------------------------------------------------------- */

  const firstName =
    onboardProfile?.full_name?.split(
      " "
    )[0] || "there";

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : "Good evening";

  /* ---------------------------------------------------------------------- */
  /*                               RENDER                                    */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="mx-auto w-full max-w-[1440px]">
      {/* ================================================================ */}
      {/* HERO HEADER */}
      {/* ================================================================ */}

      <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: "#34D399",
              }}
            />

            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--fg-4)]">
              Creator workspace
            </span>
          </div>

          <h1 className="font-display text-[28px] font-semibold tracking-[-0.035em] text-[var(--fg)] sm:text-[34px]">
            {greeting},{" "}
            {firstName}
            <Sparkles
              className="ml-1 inline h-6 w-6"
              style={{
                color: "#EC4899",
              }}
            />
          </h1>

          <p className="mt-2 text-[14px] text-[var(--fg-3)]">
            Here&apos;s how your content is
            performing today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SyncButton />

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3.5 py-2 text-[12.5px] font-medium text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
          >
            Last 7 days

            <ChevronDown className="h-3.5 w-3.5 text-[var(--fg-4)]" />
          </button>

          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "#EC4899",
              boxShadow:
                "0 10px 30px rgba(236,72,153,0.18)",
            }}
          >
            <Zap className="h-4 w-4" />

            New post
          </Link>
        </div>
      </section>

      {/* ================================================================ */}
      {/* EMPTY CONNECT STATE */}
      {/* ================================================================ */}

      {connectedCount === 0 && (
        <section className="glass-panel mb-6 overflow-hidden rounded-2xl border border-[var(--stroke)]">
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background:
                  "rgba(236,72,153,0.10)",

                border:
                  "1px solid rgba(236,72,153,0.18)",
              }}
            >
              <Plug
                className="h-6 w-6"
                style={{
                  color: "#EC4899",
                }}
              />
            </div>

            <h2 className="text-[17px] font-semibold text-[var(--fg)]">
              Connect your social accounts
            </h2>

            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-[var(--fg-4)]">
              Connect your platforms to unlock
              real-time analytics, recommendations,
              scheduling and content intelligence.
            </p>

            <Link
              href="/dashboard/integrations"
              className="mt-6 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:brightness-110"
              style={{
                background: "#EC4899",
              }}
            >
              Connect an account
            </Link>
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* METRICS */}
      {/* ================================================================ */}

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;

          return (
            <article
              key={index}
              className="glass-panel group rounded-2xl border border-[var(--stroke)] p-4 transition-all hover:border-white/[0.12] hover:bg-[var(--hover)] sm:p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    background: `${metric.color}14`,
                    border: `1px solid ${metric.color}25`,
                  }}
                >
                  <Icon
                    className="h-4 w-4"
                    style={{
                      color: metric.color,
                    }}
                  />
                </div>

                <Sparkline
                  trend={trendDirection(metric)}
                  color={metric.color}
                />
              </div>

              <p className="text-[12px] font-medium text-[var(--fg-3)]">
                {metric.label}
              </p>

              <div className="mt-2 flex flex-wrap items-end gap-2">
                <p className="font-display text-[24px] font-semibold tracking-[-0.02em] text-[var(--fg)]">
                  {metric.value || "—"}
                </p>

                {metric.change !== "—" && (
                  <span
                    className="mb-1 flex items-center gap-0.5 text-[10.5px] font-semibold"
                    style={{
                      color:
                        metric.positive
                          ? "#34D399"
                          : "#F87171",
                    }}
                  >
                    {metric.positive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}

                    {metric.change}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {/* ================================================================ */}
      {/* INSIGHTS ROW */}
      {/* ================================================================ */}

      <section className="mb-6 grid gap-4 xl:grid-cols-3">
        {/* TOP CONTENT */}

        <article className="glass-panel rounded-2xl border border-[var(--stroke)] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold text-[var(--fg)]">
                Top performing content
              </p>

              <p className="mt-1 text-[11.5px] text-[var(--fg-4)]">
                Best post across all platforms
              </p>
            </div>

            <Link
              href="/dashboard/analytics"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--stroke)] text-[var(--fg-4)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {topPost ? (
            <Link
              href="/dashboard/analytics"
              className="group block"
            >
              <div className="flex gap-3">
                <div
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: `color-mix(in srgb, ${
                      PLATFORM_COLORS[
                        topPost.platform
                      ] ?? "#EC4899"
                    } 15%, var(--panel-fill-2))`,
                  }}
                >
                  <PlatformIcon
                    platform={topPost.platform}
                    className="h-5 w-5"
                    color={
                      PLATFORM_COLORS[
                        topPost.platform
                      ]
                    }
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[13px] leading-relaxed text-[var(--fg)]">
                    {topPost.content ??
                      "Untitled content"}
                  </p>

                  <span className="mt-2 inline-flex rounded-md border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2 py-1 text-[10px] text-[var(--fg-4)]">
                    {(topPost.video_views ?? 0) > 0
                      ? "Video content"
                      : "Social post"}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 divide-x divide-[var(--stroke)] rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)]">
                <div className="p-3">
                  <p className="text-[10px] text-[var(--fg-4)]">
                    Likes
                  </p>

                  <p className="mt-1 text-[13px] font-semibold text-[var(--fg)]">
                    {fmtNum(topPost.likes ?? 0)}
                  </p>
                </div>

                <div className="p-3">
                  <p className="text-[10px] text-[var(--fg-4)]">
                    Comments
                  </p>

                  <p className="mt-1 text-[13px] font-semibold text-[var(--fg)]">
                    {fmtNum(topPost.comments ?? 0)}
                  </p>
                </div>

                <div className="p-3">
                  <p className="text-[10px] text-[var(--fg-4)]">
                    Reach
                  </p>

                  <p className="mt-1 text-[13px] font-semibold text-[var(--fg)]">
                    {fmtNum(
                      topPost.impressions ?? 0
                    )}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--stroke)] px-5 text-center">
              <BarChart3 className="mb-3 h-5 w-5 text-[var(--fg-4)]" />

              <p className="text-[13px] text-[var(--fg-3)]">
                Your best content will appear here.
              </p>
            </div>
          )}
        </article>

        {/* AUDIENCE GROWTH */}

        <article className="glass-panel flex min-h-[290px] flex-col rounded-2xl border border-[var(--stroke)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[15px] font-semibold text-[var(--fg)]">
                Audience growth
              </p>

              <p className="mt-1 text-[11.5px] text-[var(--fg-4)]">
                Last 7 days
              </p>
            </div>

            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background:
                  "rgba(59,130,246,0.10)",
              }}
            >
              <Users
                className="h-4 w-4"
                style={{
                  color: "#3B82F6",
                }}
              />
            </div>
          </div>

          <div className="mt-6">
            <p
              className="font-display text-[28px] font-semibold tracking-[-0.03em]"
              style={{
                color:
                  metrics[0].positive
                    ? "#34D399"
                    : "#F87171",
              }}
            >
              {metrics[0].change !== "—"
                ? `${
                    metrics[0].positive
                      ? "+"
                      : ""
                  }${metrics[0].change}`
                : "—"}
            </p>

            <p className="mt-1 text-[12px] text-[var(--fg-4)]">
              {fmtNum(totalFollowers)} total
              followers
            </p>
          </div>

          <div className="mt-auto h-24 pt-5">
            <AreaTrend
              trend={trendDirection(
                metrics[0]
              )}
            />
          </div>

          <Link
            href="/dashboard/analytics"
            className="mt-4 flex items-center justify-between border-t border-[var(--stroke)] pt-4 text-[12px] text-[var(--fg-3)] transition-colors hover:text-[var(--fg)]"
          >
            <span>View audience analytics</span>

            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </article>

        {/* AI RECOMMENDATIONS */}

        <article className="glass-panel rounded-2xl border border-[var(--stroke)] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold text-[var(--fg)]">
                AI recommendations
              </p>

              <p className="mt-1 text-[11.5px] text-[var(--fg-4)]">
                Based on your performance
              </p>
            </div>

            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background:
                  "rgba(236,72,153,0.10)",
              }}
            >
              <Sparkles
                className="h-4 w-4"
                style={{
                  color: "#EC4899",
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {recommendations.map(
              (recommendation, index) => {
                const Icon =
                  recommendation.icon;

                return (
                  <div
                    key={index}
                    className="flex gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-[var(--stroke)] hover:bg-[var(--hover)]"
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: `${recommendation.color}14`,
                      }}
                    >
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{
                          color:
                            recommendation.color,
                        }}
                      />
                    </div>

                    <div>
                      <p className="text-[11.5px] font-medium text-[var(--fg)]">
                        {recommendation.title}
                      </p>

                      <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--fg-4)]">
                        {recommendation.text}
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </article>
      </section>

      {/* ================================================================ */}
      {/* SCHEDULE + QUICK ACTIONS */}
      {/* ================================================================ */}

      <section className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.75fr)]">
        {/* UPCOMING POSTS */}

        <article className="glass-panel rounded-2xl border border-[var(--stroke)] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold text-[var(--fg)]">
                Upcoming scheduled posts
              </p>

              <p className="mt-1 text-[11.5px] text-[var(--fg-4)]">
                Your publishing queue
              </p>
            </div>

            <Link
              href="/dashboard/calendar"
              className="text-[12px] font-medium text-[#EC4899] transition-opacity hover:opacity-70"
            >
              View calendar
            </Link>
          </div>

          {!upcoming || upcoming.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--stroke)] text-center">
              <CalendarClock className="mb-3 h-5 w-5 text-[var(--fg-4)]" />

              <p className="text-[13px] font-medium text-[var(--fg-3)]">
                Nothing scheduled yet
              </p>

              <p className="mt-1 text-[11.5px] text-[var(--fg-4)]">
                Plan your next piece of content.
              </p>

              <Link
                href="/dashboard/calendar"
                className="mt-4 rounded-lg px-3.5 py-2 text-[11.5px] font-semibold text-white"
                style={{
                  background: "#EC4899",
                }}
              >
                Plan a post
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--stroke)]">
              {upcoming.map(
                (post, index) => {
                  const platformColor =
                    PLATFORM_COLORS[
                      post.platform
                    ] ?? "#EC4899";

                  return (
                    <div
                      key={index}
                      className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{
                          background: `${platformColor}14`,
                        }}
                      >
                        <PlatformIcon
                          platform={
                            post.platform
                          }
                          className="h-4 w-4"
                          color={
                            platformColor
                          }
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-[var(--fg)]">
                          {post.content ??
                            "Untitled post"}
                        </p>

                        <p className="mt-1 text-[11px] text-[var(--fg-4)]">
                          {platformLabel(
                            post.platform
                          )}{" "}
                          ·{" "}
                          {new Date(
                            post.posted_at
                          ).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}{" "}
                          at{" "}
                          {new Date(
                            post.posted_at
                          ).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      <span
                        className="hidden rounded-lg px-2 py-1 text-[10px] font-medium sm:inline-flex"
                        style={{
                          background:
                            "rgba(52,211,153,0.10)",
                          color: "#34D399",
                        }}
                      >
                        Scheduled
                      </span>

                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--fg-4)] opacity-0 transition-all hover:bg-[var(--hover)] hover:text-[var(--fg)] group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </article>

        {/* QUICK ACTIONS */}

        <article className="glass-panel rounded-2xl border border-[var(--stroke)] p-5">
          <div className="mb-5">
            <p className="text-[15px] font-semibold text-[var(--fg)]">
              Quick actions
            </p>

            <p className="mt-1 text-[11.5px] text-[var(--fg-4)]">
              Get started quickly
            </p>
          </div>

          <div className="space-y-2">
            <Link
              href="/dashboard/create"
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-[13px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.99]"
              style={{
                background: "#EC4899",
              }}
            >
              <Zap className="h-4 w-4" />

              Create new post

              <ArrowUpRight className="ml-auto h-4 w-4 opacity-70" />
            </Link>

            <Link
              href="/dashboard/trends"
              className="flex items-center gap-3 rounded-xl border border-[var(--stroke)] px-4 py-3 text-[12.5px] font-medium text-[var(--fg-2)] transition-all hover:bg-[var(--hover)] hover:text-[var(--fg)]"
            >
              <Lightbulb
                className="h-4 w-4"
                style={{
                  color: "#F59E0B",
                }}
              />

              Find content ideas
            </Link>

            <Link
              href="/dashboard/repurpose"
              className="flex items-center gap-3 rounded-xl border border-[var(--stroke)] px-4 py-3 text-[12.5px] font-medium text-[var(--fg-2)] transition-all hover:bg-[var(--hover)] hover:text-[var(--fg)]"
            >
              <RefreshCw
                className="h-4 w-4"
                style={{
                  color: "#8B5CF6",
                }}
              />

              Repurpose content
            </Link>

            <Link
              href="/dashboard/calendar"
              className="flex items-center gap-3 rounded-xl border border-[var(--stroke)] px-4 py-3 text-[12.5px] font-medium text-[var(--fg-2)] transition-all hover:bg-[var(--hover)] hover:text-[var(--fg)]"
            >
              <CalendarClock
                className="h-4 w-4"
                style={{
                  color: "#3B82F6",
                }}
              />

              View calendar
            </Link>
          </div>
        </article>
      </section>

      {/* ================================================================ */}
      {/* ANALYTICS */}
      {/* ================================================================ */}

      <section className="mb-6">
        <RecentAnalyticsCard
          series={dailySeries}
          platforms={platformRows}
        />
      </section>

      {/* ================================================================ */}
      {/* TRENDING */}
      {/* ================================================================ */}

      <section className="glass-panel rounded-2xl border border-[var(--stroke)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold text-[var(--fg)]">
              Trending now
            </p>

            <p className="mt-1 text-[11.5px] text-[var(--fg-4)]">
              Discover opportunities for your next content
            </p>
          </div>

          <Link
            href="/dashboard/trends"
            className="text-[12px] font-medium text-[#EC4899] transition-opacity hover:opacity-70"
          >
            Explore ideas
          </Link>
        </div>

        <div className="mt-5 flex min-h-[170px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--stroke)] text-center">
          <div
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background:
                "rgba(139,92,246,0.10)",
            }}
          >
            <Lightbulb
              className="h-5 w-5"
              style={{
                color: "#8B5CF6",
              }}
            />
          </div>

          <p className="text-[13px] font-medium text-[var(--fg-3)]">
            Trend intelligence is waiting
          </p>

          <p className="mt-1 max-w-sm text-[11.5px] text-[var(--fg-4)]">
            Set up trend tracking to start
            discovering relevant conversations and
            content opportunities.
          </p>

          <Link
            href="/dashboard/trends"
            className="mt-4 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-3.5 py-2 text-[11.5px] font-medium text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
          >
            Set up Trend Tracker
          </Link>
        </div>
      </section>
    </main>
  );
}