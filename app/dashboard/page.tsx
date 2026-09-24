import { redirect } from "next/navigation";
import Link from "next/link";
import type { ComponentType, CSSProperties } from "react";

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
  Bell,
  ChevronDown,
  Video,
  Clock,
  CalendarClock,
  Lightbulb,
  Sparkles,
  MoreHorizontal,
  BarChart3,
  Target,
  Bot,
  MousePointerClick,
  FileText,
  CheckCircle2,
  CircleAlert,
  WandSparkles,
  ArrowRight,
  Megaphone,
  PenLine,
} from "lucide-react";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";

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
/*                                   BRAND                                    */
/* -------------------------------------------------------------------------- */

const KORA_BLUE = "#2563FF";
const KORA_PINK = "#FF0A8A";
const KORA_GREEN = "#22E68A";

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const PLATFORM_ICONS: Record<
  string,
  ComponentType<{
    className?: string;
    style?: CSSProperties;
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
  x: "#111111",
  threads: "#111111",
  telegram: "#2AABEE",
  tiktok: "#111111",
  whatsapp: "#25D366",
  linkedin: "#0A66C2",
  snapchat: "#F5C400",
  reddit: "#FF4500",
};

const PLATFORM_IMAGE_MAP: Record<string, string> = {
  youtube: "/integrations/yt.png",
  instagram: "/integrations/insta.png",
  facebook: "/integrations/facebook.png",
  x: "/integrations/twitter.png",
  twitter: "/integrations/twitter.png",
  threads: "/integrations/threads.png",
  telegram: "/integrations/telegram.png",
  tiktok: "/integrations/ticktok.png",
  whatsapp: "/integrations/whatsapp.png",
  linkedin: "/integrations/linkedin.png",
  snapchat: "/integrations/Snapchat.png",
  reddit: "/integrations/reddit.png",
  pinterest: "/integrations/pin.png",
  discord: "/integrations/discord.png",
  messenger: "/integrations/messanger.png",
};

/* -------------------------------------------------------------------------- */
/*                              PLATFORM ICON                                 */
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
  const p = platform.toLowerCase();
  const imgSrc = PLATFORM_IMAGE_MAP[p];

  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={platform}
        className={`rounded-full object-cover shrink-0 ${className ?? "h-full w-full"}`}
      />
    );
  }

  const Icon = PLATFORM_ICONS[p] ?? Plug;

  return (
    <Icon
      className={className}
      style={color ? { color } : undefined}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                SPARKLINE                                   */
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
      className="h-8 w-16 shrink-0"
      fill="none"
      aria-hidden="true"
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
/*                         CROSS CHANNEL PERFORMANCE                          */
/* -------------------------------------------------------------------------- */

function PerformanceChart({
  series,
  brandColor = "#FF0A8A",
  brandAreaFill = "rgba(255, 10, 138, 0.08)",
}: {
  series: {
    label: string;
    views: number;
    engagement: number;
    reach: number;
    followers: number;
  }[];
  brandColor?: string;
  brandAreaFill?: string;
}) {
  const values = series.map((item) => item.reach || item.views || 0);

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);

  const width = 720;
  const height = 230;
  const left = 12;
  const right = 12;
  const top = 16;
  const bottom = 32;

  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const points = series.map((item, index) => {
    const value = item.reach || item.views || 0;

    const x =
      series.length === 1
        ? width / 2
        : left + (index / (series.length - 1)) * chartWidth;

    const normalized =
      max === min ? 0.5 : (value - min) / (max - min);

    const y = top + chartHeight - normalized * chartHeight;

    return {
      x,
      y,
      value,
      label: item.label,
    };
  });

  const linePath = points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }

      const previous = points[index - 1];

      const controlX =
        previous.x + (point.x - previous.x) / 2;

      return `C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
    })
    .join(" ");

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${
          height - bottom
        } L ${points[0].x} ${height - bottom} Z`
      : "";

  return (
    <div className="mt-5">
      <div className="relative h-[245px] w-full">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {[100, 75, 50, 25, 0].map((value) => (
            <div
              key={value}
              className="flex items-center gap-3"
            >
              <span className="w-7 text-[9px] tabular-nums text-[var(--fg-4)]">
                {value}
              </span>

              <div className="h-px flex-1 bg-[var(--stroke)]" />
            </div>
          ))}
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="absolute inset-x-9 bottom-0 top-0 h-full w-[calc(100%-36px)] overflow-visible"
        >
          <path
            d={areaPath}
            fill={brandAreaFill}
          />

          <path
            d={linePath}
            fill="none"
            stroke={brandColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3.5"
              fill="var(--panel-fill)"
              stroke={brandColor}
              strokeWidth="2"
            />
          ))}
        </svg>

        <div className="absolute bottom-0 left-9 right-0 flex justify-between">
          {series.map((item, index) => (
            <span
              key={`${item.label}-${index}`}
              className="text-[9px] text-[var(--fg-4)]"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             TREND DIRECTION                                */
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
      color: KORA_BLUE,
      title: "Content opportunity",
      text: topAccount
        ? `Post more video — ${platformLabel(
            topAccount.platform
          )} is your strongest channel right now.`
        : "Connect an account to unlock platform-specific recommendations.",
    },
    {
      icon: Heart,
      color: KORA_GREEN,
      title: "Engagement insight",
      text:
        engRatio > 0.05
          ? "Engagement is strong. Try a carousel format to push performance further."
          : "Engagement is light this week. Try a stronger conversational hook.",
    },
    {
      icon: Clock,
      color: KORA_BLUE,
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
/*                           SMALL UI COMPONENTS                              */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  title,
  subtitle,
  href,
  action,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--fg)]">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-[11.5px] text-[var(--fg-4)]">
            {subtitle}
          </p>
        )}
      </div>

      {href && action && (
        <Link
          href={href}
          className="shrink-0 text-[11.5px] font-semibold text-[var(--brand-primary)] transition-opacity hover:opacity-70"
        >
          {action}
        </Link>
      )}
    </div>
  );
}

function StatusPill({
  children,
  tone = "blue",
  brandColor,
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "orange" | "brand";
  brandColor?: string;
}) {
  const isPink = brandColor === KORA_PINK;
  const styles = {
    brand: {
      background: isPink ? "rgba(255,10,138,.09)" : "rgba(37,99,255,.09)",
      color: brandColor ?? (isPink ? KORA_PINK : KORA_BLUE),
      border: isPink ? "rgba(255,10,138,.16)" : "rgba(37,99,255,.16)",
    },
    blue: {
      background: "rgba(37,99,255,.09)",
      color: KORA_BLUE,
      border: "rgba(37,99,255,.16)",
    },
    green: {
      background: "rgba(34,230,138,.10)",
      color: "#0E9F63",
      border: "rgba(34,230,138,.20)",
    },
    orange: {
      background: "rgba(245,158,11,.10)",
      color: "#B77908",
      border: "rgba(245,158,11,.18)",
    },
  };

  const style = styles[tone] ?? styles.blue;

  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-[9.5px] font-semibold"
      style={{
        background: style.background,
        color: style.color,
        borderColor: style.border,
      }}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  /* ---------------------------------------------------------------------- */
  /*                               PROFILE                                  */
  /* ---------------------------------------------------------------------- */

  const onboardProfile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      onboarded: true,
      full_name: true,
      avatar_url: true,
      persona: true,
    },
  });

  if (onboardProfile && !onboardProfile.onboarded) {
    redirect("/onboarding");
  }

  /* ---------------------------------------------------------------------- */
  /*                                DATES                                   */
  /* ---------------------------------------------------------------------- */

  const d7 = daysAgoISO(7);
  const d14 = daysAgoISO(14);
  const nowISO = new Date().toISOString();

  /* ---------------------------------------------------------------------- */
  /*                                 DATA                                   */
  /* ---------------------------------------------------------------------- */

  const [
    accounts,
    curr,
    prev,
    topPosts,
    leads,
    upcoming,
    dailyRaw,
  ] = await Promise.all([
    prisma.connectedAccount.findMany({
      where: { user_id: user.id },
      select: {
        id: true,
        platform: true,
        handle: true,
        display_name: true,
        avatar_url: true,
        followers: true,
        status: true,
        last_synced_at: true,
      },
    }),

    prisma.postHistory.findMany({
      where: {
        user_id: user.id,
        posted_at: {
          gte: new Date(d7),
        },
      },
      select: {
        platform: true,
        impressions: true,
        likes: true,
        comments: true,
        shares: true,
        followers_gained: true,
        revenue: true,
        account_id: true,
        video_views: true,
      },
    }),

    prisma.postHistory.findMany({
      where: {
        user_id: user.id,
        posted_at: {
          gte: new Date(d14),
          lt: new Date(d7),
        },
      },
      select: {
        impressions: true,
        likes: true,
        comments: true,
        shares: true,
        followers_gained: true,
        revenue: true,
      },
    }),

    prisma.postHistory.findMany({
      where: { user_id: user.id },
      orderBy: {
        impressions: "desc",
      },
      take: 5,
      select: {
        content: true,
        platform: true,
        impressions: true,
        likes: true,
        comments: true,
        revenue: true,
        video_views: true,
        posted_at: true,
      },
    }),

    prisma.inboxMessage.findMany({
      where: {
        user_id: user.id,
        category: "lead",
      },
      orderBy: {
        received_at: "desc",
      },
      take: 4,
      select: {
        author_name: true,
        message: true,
        platform: true,
        received_at: true,
      },
    }),

    prisma.postHistory.findMany({
      where: {
        user_id: user.id,
        posted_at: {
          gte: new Date(nowISO),
        },
      },
      orderBy: {
        posted_at: "asc",
      },
      take: 4,
      select: {
        content: true,
        platform: true,
        posted_at: true,
      },
    }),

    prisma.postHistory.findMany({
      where: {
        user_id: user.id,
        posted_at: {
          gte: new Date(d7),
        },
      },
      select: {
        posted_at: true,
        impressions: true,
        video_views: true,
        likes: true,
        comments: true,
        shares: true,
        followers_gained: true,
      },
    }),
  ]);

  /* ---------------------------------------------------------------------- */
  /*                               METRICS                                  */
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
    followers: sumField(prev, "followers_gained"),
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
    )
  );

  const topReachPrev = Math.max(
    0,
    ...(prev ?? []).map(
      (post: any) => post.impressions ?? 0
    )
  );

  /* ---------------------------------------------------------------------- */
  /*                              METRICS                                   */
  /* ---------------------------------------------------------------------- */

  const metrics = [
    {
      label: "Followers",
      value: fmtNum(totalFollowers),
      icon: Users,
      color: KORA_BLUE,
      ...pctChange(
        totalFollowers,
        prevTotals.followers
      ),
    },

    {
      label: "Engagement",
      value: `${(engRatio * 100).toFixed(1)}%`,
      icon: Heart,
      color: KORA_GREEN,
      ...pctChange(
        totals.engagements,
        prevTotals.engagements
      ),
    },

    {
      label: "Reach",
      value: fmtNum(totals.impressions),
      icon: Eye,
      color: KORA_BLUE,
      ...pctChange(
        totals.impressions,
        prevTotals.impressions
      ),
    },

    {
      label: "Top Content",
      value: fmtNum(topReachCurrent),
      icon: Flame,
      color: KORA_GREEN,
      ...pctChange(
        topReachCurrent,
        topReachPrev
      ),
    },
  ];

  /* ---------------------------------------------------------------------- */
  /*                           PLATFORM STATS                               */
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
  /*                           DAILY CHART                                  */
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
    const key = row.posted_at
      ? (row.posted_at as Date)
          .toISOString()
          .slice(0, 10)
      : null;

    if (!key || !dayBuckets[key]) {
      continue;
    }

    const views = row.video_views ?? 0;

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
            weekday: "short",
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
          ] ?? KORA_BLUE,
      };
    });

  /* ---------------------------------------------------------------------- */
  /*                              PERSONA THEME                             */
  /* ---------------------------------------------------------------------- */

  const isMarketer = onboardProfile?.persona === "marketer";
  const brandPrimary = isMarketer ? KORA_BLUE : KORA_PINK;
  const brandSoft = isMarketer ? "rgba(37, 99, 255, 0.09)" : "rgba(255, 10, 138, 0.09)";
  const brandBorder = isMarketer ? "rgba(37, 99, 255, 0.22)" : "rgba(255, 10, 138, 0.22)";
  const brandShadow = isMarketer ? "0 8px 24px rgba(37, 99, 255, 0.16)" : "0 8px 24px rgba(255, 10, 138, 0.16)";
  const brandAreaFill = isMarketer ? "rgba(37, 99, 255, 0.08)" : "rgba(255, 10, 138, 0.08)";
  const workspaceBadge = isMarketer ? "Marketer workspace" : "Creator workspace";

  const dynamicKoraStyle = {
    "--brand-primary": brandPrimary,
    "--brand-primary-soft": brandSoft,
    "--brand-primary-border": brandBorder,
    "--brand-primary-shadow": brandShadow,
    "--kora-blue": KORA_BLUE,
    "--kora-pink": KORA_PINK,
    "--kora-green": KORA_GREEN,
  } as CSSProperties;

  /* ---------------------------------------------------------------------- */
  /*                              GREETING                                  */
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
  /*                                RENDER                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <main
      className="mx-auto w-full max-w-[1440px] pb-12"
      style={dynamicKoraStyle}
    >
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <section className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: KORA_GREEN,
                boxShadow:
                  "0 0 0 3px rgba(34,230,138,.10)",
              }}
            />

            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--fg-4)]">
              {workspaceBadge}
            </span>
          </div>

          <h1 className="font-display text-[27px] font-semibold tracking-[-0.035em] text-[var(--fg)] sm:text-[32px]">
            {greeting}, {firstName}
          </h1>

          <p className="mt-1.5 text-[13px] text-[var(--fg-3)]">
            Here&apos;s what&apos;s happening across your social world.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SyncButton />

          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: brandPrimary,
              boxShadow: `0 7px 18px ${
                isMarketer
                  ? "rgba(37,99,255,.18)"
                  : "rgba(255,10,138,.18)"
              }`,
            }}
          >
            <PenLine className="h-3.5 w-3.5" />
            Create Post
          </Link>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CONNECTED CHANNELS                                                 */}
      {/* ================================================================== */}

      <section className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {connectedAccounts.length > 0
          ? connectedAccounts
              .slice(0, 5)
              .map((account) => {
                const color =
                  PLATFORM_COLORS[
                    account.platform
                  ] ?? brandPrimary;

                return (
                  <Link
                    key={account.id}
                    href="/dashboard/integrations"
                    className="group flex min-w-0 items-center gap-3 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-[var(--brand-primary-border)] hover:shadow-sm"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden border border-[var(--stroke)] bg-[var(--panel-fill-2)]"
                    >
                      <PlatformIcon
                        platform={account.platform}
                        className="h-full w-full object-cover rounded-full"
                        color={color}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[10.5px] font-semibold text-[var(--fg)]">
                        {platformLabel(
                          account.platform
                        )}
                      </p>

                      <div className="mt-0.5 flex items-center gap-1">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background:
                              KORA_GREEN,
                          }}
                        />

                        <span className="text-[9px] text-[var(--fg-4)]">
                          Connected
                        </span>
                      </div>
                    </div>

                    <ArrowUpRight className="ml-auto h-3 w-3 text-[var(--fg-4)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                );
              })
          : [
              "Instagram",
              "X",
              "TikTok",
              "YouTube",
              "LinkedIn",
            ].map((platform) => (
              <Link
                key={platform}
                href="/dashboard/integrations"
                className="group flex items-center gap-3 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-2.5 transition-all hover:border-[var(--brand-primary-border)]"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden border border-[var(--stroke)] bg-[var(--panel-fill-2)]"
                >
                  <PlatformIcon
                    platform={platform.toLowerCase()}
                    className="h-full w-full object-cover rounded-full"
                  />
                </div>

                <div>
                  <p className="text-[10.5px] font-semibold text-[var(--fg)]">
                    {platform}
                  </p>

                  <p className="mt-0.5 text-[9px] text-[var(--fg-4)]">
                    Not connected
                  </p>
                </div>

                <ArrowUpRight className="ml-auto h-3 w-3 text-[var(--fg-4)] opacity-0 group-hover:opacity-100" />
              </Link>
            ))}
      </section>

      {/* ================================================================== */}
      {/* QUICK ACTIONS                                                      */}
      {/* ================================================================== */}

      <section className="mb-5 rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5">
        <SectionHeader
          title="Quick actions"
          subtitle="Jump straight into the tools you use most"
        />

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/create"
            className="group flex items-center gap-3 rounded-xl border border-transparent p-3.5 transition-all hover:-translate-y-0.5"
            style={{
              background:
                "var(--brand-primary-soft)",
              borderColor:
                "var(--brand-primary-border)",
            }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{
                background: brandPrimary,
              }}
            >
              <PenLine className="h-4 w-4 text-white" />
            </div>

            <div>
              <p className="text-[11px] font-semibold text-[var(--fg)]">
                Create post
              </p>

              <p className="mt-0.5 text-[9px] text-[var(--fg-4)]">
                Create with AI
              </p>
            </div>

            <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-[var(--brand-primary)]" />
          </Link>

          <Link
            href="/dashboard/trends"
            className="group flex items-center gap-3 rounded-xl border border-[var(--stroke)] p-3.5 transition-all hover:bg-[var(--hover)]"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{
                background:
                  "rgba(34,230,138,.10)",
              }}
            >
              <Lightbulb
                className="h-4 w-4"
                style={{
                  color: "#0E9F63",
                }}
              />
            </div>

            <div>
              <p className="text-[11px] font-semibold text-[var(--fg)]">
                Find ideas
              </p>

              <p className="mt-0.5 text-[9px] text-[var(--fg-4)]">
                Discover trends
              </p>
            </div>

            <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-[var(--fg-4)]" />
          </Link>

          <Link
            href="/dashboard/repurpose"
            className="group flex items-center gap-3 rounded-xl border border-[var(--stroke)] p-3.5 transition-all hover:bg-[var(--hover)]"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{
                background: brandSoft,
              }}
            >
              <RefreshCw
                className="h-4 w-4"
                style={{
                  color: brandPrimary,
                }}
              />
            </div>

            <div>
              <p className="text-[11px] font-semibold text-[var(--fg)]">
                Repurpose
              </p>

              <p className="mt-0.5 text-[9px] text-[var(--fg-4)]">
                Turn one idea into many
              </p>
            </div>

            <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-[var(--fg-4)]" />
          </Link>

          <Link
            href="/dashboard/calendar"
            className="group flex items-center gap-3 rounded-xl border border-[var(--stroke)] p-3.5 transition-all hover:bg-[var(--hover)]"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{
                background:
                  "rgba(34,230,138,.10)",
              }}
            >
              <CalendarClock
                className="h-4 w-4"
                style={{
                  color: "#0E9F63",
                }}
              />
            </div>

            <div>
              <p className="text-[11px] font-semibold text-[var(--fg)]">
                Content calendar
              </p>

              <p className="mt-0.5 text-[9px] text-[var(--fg-4)]">
                Plan your publishing
              </p>
            </div>

            <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-[var(--fg-4)]" />
          </Link>
        </div>
      </section>

      {/* ================================================================== */}
      {/* MAIN PERFORMANCE AREA                                              */}
      {/* ================================================================== */}

      <section className="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(290px,0.42fr)]">
        <article className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[15px] font-semibold text-[var(--fg)]">
                Cross-channel performance
              </p>

              <p className="mt-1 text-[11px] text-[var(--fg-4)]">
                How your social presence is performing across platforms
              </p>
            </div>

            <span className="rounded-full border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2.5 py-1 text-[9px] text-[var(--fg-4)]">
              Last 7 days
            </span>
          </div>

          <PerformanceChart
            series={dailySeries}
            brandColor={brandPrimary}
            brandAreaFill={brandAreaFill}
          />

          <div className="mt-2 grid grid-cols-2 border-t border-[var(--stroke)] pt-4 sm:grid-cols-4">
            <div className="px-1">
              <p className="text-[9.5px] text-[var(--fg-4)]">
                Reach
              </p>

              <p className="mt-1 text-[13px] font-semibold text-[var(--fg)]">
                {fmtNum(totals.impressions)}
              </p>
            </div>

            <div className="border-l border-[var(--stroke)] px-3">
              <p className="text-[9.5px] text-[var(--fg-4)]">
                Engagement
              </p>

              <p className="mt-1 text-[13px] font-semibold text-[var(--fg)]">
                {fmtNum(totals.engagements)}
              </p>
            </div>

            <div className="mt-3 border-l border-[var(--stroke)] px-3 sm:mt-0">
              <p className="text-[9.5px] text-[var(--fg-4)]">
                Followers
              </p>

              <p
                className="mt-1 text-[13px] font-semibold"
                style={{
                  color: KORA_GREEN,
                }}
              >
                +{fmtNum(totalFollowers)}
              </p>
            </div>

            <div className="mt-3 border-l border-[var(--stroke)] px-3 sm:mt-0">
              <p className="text-[9.5px] text-[var(--fg-4)]">
                Engagement Rate
              </p>

              <p className="mt-1 text-[13px] font-semibold text-[var(--fg)]">
                {(engRatio * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </article>

        {/* AI INSIGHT */}

        <article
          className="rounded-2xl border p-5"
          style={{
            borderColor: brandBorder,
            background:
              "var(--panel-fill)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: brandSoft,
              }}
            >
              <Sparkles
                className="h-4 w-4"
                style={{
                  color: brandPrimary,
                }}
              />
            </div>

            <div>
              <p className="text-[12px] font-semibold text-[var(--fg)]">
                Kora AI
              </p>

              <p className="text-[9px] text-[var(--fg-4)]">
                Your next move
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-4)]">
              Recommendation
            </p>

            <p className="mt-2 text-[13px] font-medium leading-6 text-[var(--fg)]">
              {topAccount
                ? `${platformLabel(
                    topAccount.platform
                  )} is currently your strongest channel.`
                : "Connect your social accounts to unlock personalized recommendations."}
            </p>

            <p className="mt-2 text-[11px] leading-5 text-[var(--fg-3)]">
              {topAccount
                ? "Your recent performance suggests that doubling down on your strongest format could increase reach."
                : "KoraSpace will analyze your content, audience and platform performance once accounts are connected."}
            </p>
          </div>

          <Link
            href="/dashboard/analytics"
            className="mt-6 inline-flex items-center gap-1.5 text-[10.5px] font-semibold"
            style={{
              color: brandPrimary,
            }}
          >
            View insight
            <ArrowRight className="h-3 w-3" />
          </Link>
        </article>
      </section>

      {/* ================================================================== */}
      {/* UPCOMING + NEEDS ATTENTION                                         */}
      {/* ================================================================== */}

      <section className="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)]">
        <article className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5">
          <SectionHeader
            title="Upcoming content"
            subtitle="Your publishing queue"
            href="/dashboard/calendar"
            action="View calendar"
          />

          {!upcoming ||
          upcoming.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--stroke)] text-center">
              <CalendarClock className="mb-3 h-5 w-5 text-[var(--fg-4)]" />

              <p className="text-[12px] font-medium text-[var(--fg-3)]">
                Nothing scheduled yet
              </p>

              <p className="mt-1 text-[10.5px] text-[var(--fg-4)]">
                Plan your next piece of content.
              </p>

              <Link
                href="/dashboard/create"
                className="mt-4 rounded-lg px-3.5 py-2 text-[10.5px] font-semibold text-white"
                style={{
                  background: brandPrimary,
                }}
              >
                Create a post
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--stroke)]">
              {upcoming.map(
                (post, index) => {
                  const platformColor =
                    PLATFORM_COLORS[
                      post.platform
                    ] ?? brandPrimary;

                  return (
                    <div
                      key={index}
                      className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden border border-[var(--stroke)] bg-[var(--panel-fill-2)]"
                      >
                        <PlatformIcon
                          platform={post.platform}
                          className="h-full w-full object-cover rounded-full"
                          color={platformColor}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11.5px] font-medium text-[var(--fg)]">
                          {post.content ??
                            "Untitled post"}
                        </p>

                        <p className="mt-1 text-[9.5px] text-[var(--fg-4)]">
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
                          ·{" "}
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

                      <StatusPill tone="green">
                        Scheduled
                      </StatusPill>

                      <button
                        type="button"
                        className="hidden h-8 w-8 items-center justify-center rounded-lg text-[var(--fg-4)] hover:bg-[var(--hover)] hover:text-[var(--fg)] sm:flex"
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

        <article className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5">
          <SectionHeader
            title="Needs attention"
            subtitle="Things worth acting on"
          />

          <div className="divide-y divide-[var(--stroke)]">
            <Link
              href="/dashboard/inbox"
              className="flex items-center gap-3 py-3 first:pt-0 group"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: brandSoft,
                }}
              >
                <MessageCircle
                  className="h-3.5 w-3.5"
                  style={{
                    color: brandPrimary,
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-medium text-[var(--fg)]">
                  {leads?.length ?? 0} unread messages
                </p>
              </div>

              <ArrowRight className="h-3 w-3 text-[var(--fg-4)] transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/dashboard/inbox"
              className="flex items-center gap-3 py-3 group"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background:
                    "rgba(34,230,138,.10)",
                }}
              >
                <Heart
                  className="h-3.5 w-3.5"
                  style={{
                    color: "#0E9F63",
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-medium text-[var(--fg)]">
                  Conversations awaiting reply
                </p>
              </div>

              <ArrowRight className="h-3 w-3 text-[var(--fg-4)]" />
            </Link>

            <Link
              href="/dashboard/calendar"
              className="flex items-center gap-3 py-3 last:pb-0 group"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background:
                    "rgba(245,158,11,.10)",
                }}
              >
                <CircleAlert
                  className="h-3.5 w-3.5"
                  style={{
                    color: "#D18A00",
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-medium text-[var(--fg)]">
                  Content needs approval
                </p>
              </div>

              <ArrowRight className="h-3 w-3 text-[var(--fg-4)]" />
            </Link>
          </div>
        </article>
      </section>

      {/* ================================================================== */}
      {/* TRENDING                                                           */}
      {/* ================================================================== */}

      <section className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5">
        <SectionHeader
          title="Trending now"
          subtitle="Discover opportunities for your next content"
          href="/dashboard/trends"
          action="Explore ideas"
        />

        <div className="grid gap-2.5 md:grid-cols-3">
          <Link
            href="/dashboard/trends"
            className="group rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--brand-primary-border)]"
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{
                  background: brandSoft,
                }}
              >
                <Flame
                  className="h-3.5 w-3.5"
                  style={{
                    color: brandPrimary,
                  }}
                />
              </span>

              <span className="text-[10px] font-semibold text-[var(--fg)]">
                AI & Automation
              </span>
            </div>

            <p className="mt-3 text-[11px] leading-5 text-[var(--fg-3)]">
              Conversations around AI workflows and automation are gaining attention.
            </p>

            <div className="mt-3 flex items-center justify-between">
              <StatusPill tone="brand" brandColor={brandPrimary}>
                Rising
              </StatusPill>

              <ArrowUpRight className="h-3.5 w-3.5 text-[var(--fg-4)] transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            href="/dashboard/trends"
            className="group rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--brand-primary-border)]"
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{
                  background:
                    "rgba(34,230,138,.10)",
                }}
              >
                <Video
                  className="h-3.5 w-3.5"
                  style={{
                    color: "#0E9F63",
                  }}
                />
              </span>

              <span className="text-[10px] font-semibold text-[var(--fg)]">
                Short-form video
              </span>
            </div>

            <p className="mt-3 text-[11px] leading-5 text-[var(--fg-3)]">
              Video continues to create strong opportunities for audience discovery.
            </p>

            <div className="mt-3 flex items-center justify-between">
              <StatusPill tone="green">
                High opportunity
              </StatusPill>

              <ArrowUpRight className="h-3.5 w-3.5 text-[var(--fg-4)] transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            href="/dashboard/trends"
            className="group rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--brand-primary-border)]"
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{
                  background: brandSoft,
                }}
              >
                <Bot
                  className="h-3.5 w-3.5"
                  style={{
                    color: brandPrimary,
                  }}
                />
              </span>

              <span className="text-[10px] font-semibold text-[var(--fg)]">
                AI agents
              </span>
            </div>

            <p className="mt-3 text-[11px] leading-5 text-[var(--fg-3)]">
              Educational content about practical AI agents is a strong content opportunity.
            </p>

            <div className="mt-3 flex items-center justify-between">
              <StatusPill tone="brand" brandColor={brandPrimary}>
                Opportunity
              </StatusPill>

              <ArrowUpRight className="h-3.5 w-3.5 text-[var(--fg-4)] transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}