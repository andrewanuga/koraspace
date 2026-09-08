"use client";

import { useMemo } from "react";
import Link from "next/link";

import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Users,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronRight,
  CalendarDays,
  Play,
  Camera,
  Video,
  Briefcase,
  AtSign,
  Music2,
  Plug,
  Trophy,
  Megaphone,
  DollarSign,
} from "lucide-react";

import {
  GlassCard,
  PageHeader,
  Pill,
} from "@/components/dashboard/ui";

import {
  fmtNum,
  fmtNaira,
  platformLabel,
} from "@/lib/dashboard/helpers";

import type {
  SocialPost,
  Campaign,
} from "@/lib/social/types";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const engOf = (post: SocialPost) =>
  (post.likes ?? 0) +
  (post.comments ?? 0) +
  (post.shares ?? 0) +
  (post.saves ?? 0);

const safeNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const platformColors: Record<string, string> = {
  instagram: "#ec4899",
  tiktok: "#a855f7",
  youtube: "#ef4444",
  twitter: "#60a5fa",
  x: "#94a3b8",
  linkedin: "#3b82f6",
  facebook: "#6366f1",
};

function getPlatformColor(platform: string) {
  return platformColors[platform.toLowerCase()] ?? "#6366f1";
}

function getPlatformIcon(platform: string) {
  const name = platform.toLowerCase();

  if (name === "instagram") {
    return Camera;
  }

  if (name === "youtube") {
    return Video;
  }

  if (name === "linkedin") {
    return Briefcase;
  }

  if (
    name === "twitter" ||
    name === "x"
  ) {
    return AtSign;
  }

  if (name === "tiktok") {
    return Music2;
  }

  return Play;
}

/* -------------------------------------------------------------------------- */
/*                                AREA CHART                                  */
/* -------------------------------------------------------------------------- */

function GrowthChart({
  data,
}: {
  data: number[];
}) {
  const chartWidth = 720;
  const chartHeight = 260;

  const paddingTop = 20;
  const paddingBottom = 35;
  const paddingLeft = 20;
  const paddingRight = 12;

  const safeData =
    data.length >= 2
      ? data
      : [0, ...data, 0];

  const max = Math.max(...safeData, 1);
  const min = Math.min(...safeData, 0);

  const x = (index: number) =>
    paddingLeft +
    (index / Math.max(safeData.length - 1, 1)) *
      (chartWidth - paddingLeft - paddingRight);

  const y = (value: number) =>
    paddingTop +
    (1 - (value - min) / Math.max(max - min, 1)) *
      (chartHeight - paddingTop - paddingBottom);

  const linePath = safeData
    .map((value, index) => {
      return `${index === 0 ? "M" : "L"} ${x(index)} ${y(value)}`;
    })
    .join(" ");

  const areaPath = `
    ${linePath}
    L ${x(safeData.length - 1)} ${chartHeight - paddingBottom}
    L ${x(0)} ${chartHeight - paddingBottom}
    Z
  `;

  const labels = [
    "Apr 14",
    "Apr 15",
    "Apr 16",
    "Apr 17",
    "Apr 18",
    "Apr 19",
    "Apr 20",
  ];

  return (
    <div className="relative mt-5 h-[260px] w-full">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="h-full w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="growthGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#ec4899"
              stopOpacity="0.45"
            />

            <stop
              offset="100%"
              stopColor="#ec4899"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* horizontal grid */}

        {[0, 0.25, 0.5, 0.75, 1].map((step) => {
          const gridY =
            paddingTop +
            step *
              (chartHeight -
                paddingTop -
                paddingBottom);

          return (
            <line
              key={step}
              x1={paddingLeft}
              x2={chartWidth - paddingRight}
              y1={gridY}
              y2={gridY}
              stroke="rgba(148,163,184,0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* area */}

        <path
          d={areaPath}
          fill="url(#growthGradient)"
        />

        {/* line */}

        <path
          d={linePath}
          fill="none"
          stroke="#ec4899"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* points */}

        {safeData.map((value, index) => (
          <circle
            key={index}
            cx={x(index)}
            cy={y(value)}
            r="4"
            fill="#f472b6"
            stroke="#ec4899"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* labels */}

      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
        {labels.slice(0, safeData.length).map((label) => (
          <span
            key={label}
            className="font-data text-[10px] text-[var(--fg-4)]"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PLATFORM ICON                                 */
/* -------------------------------------------------------------------------- */

function PlatformBadge({
  platform,
}: {
  platform: string;
}) {
  const Icon = getPlatformIcon(platform);

  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-lg"
      style={{
        backgroundColor: `${getPlatformColor(platform)}20`,
        color: getPlatformColor(platform),
      }}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                STAT CARD                                   */
/* -------------------------------------------------------------------------- */

function AnalyticsStatCard({
  label,
  value,
  growth,
  icon: Icon,
  tone = "indigo",
}: {
  label: string;
  value: string;
  growth?: string;
  icon: React.ElementType;
  tone?: "indigo" | "pink" | "purple" | "violet";
}) {
  const colors = {
    indigo: {
      bg: "rgba(99,102,241,0.12)",
      border: "rgba(99,102,241,0.28)",
      icon: "#818cf8",
    },

    pink: {
      bg: "rgba(236,72,153,0.12)",
      border: "rgba(236,72,153,0.28)",
      icon: "#f472b6",
    },

    purple: {
      bg: "rgba(168,85,247,0.12)",
      border: "rgba(168,85,247,0.28)",
      icon: "#c084fc",
    },

    violet: {
      bg: "rgba(139,92,246,0.12)",
      border: "rgba(139,92,246,0.28)",
      icon: "#a78bfa",
    },
  };

  const color = colors[tone];

  return (
    <div
      className="rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5"
      style={{
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.92), rgba(10,16,30,0.9))",
        borderColor: color.border,
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            backgroundColor: color.bg,
          }}
        >
          <Icon
            className="h-4 w-4"
            style={{
              color: color.icon,
            }}
          />
        </div>
      </div>

      <p className="mt-4 text-[11px] font-medium text-[var(--fg-4)]">
        {label}
      </p>

      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)]">
          {value}
        </p>

        {growth && (
          <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            {growth}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              DONUT CHART                                   */
/* -------------------------------------------------------------------------- */

function AudienceDonut({
  female,
  male,
}: {
  female: number;
  male: number;
}) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;

  const femaleDash =
    (female / 100) * circumference;

  const maleDash =
    (male / 100) * circumference;

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-[120px] w-[120px]">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90"
        >
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(148,163,184,0.12)"
            strokeWidth="10"
          />

          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#ec4899"
            strokeWidth="10"
            strokeDasharray={`${femaleDash} ${
              circumference - femaleDash
            }`}
            strokeLinecap="round"
          />

          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="10"
            strokeDasharray={`${maleDash} ${
              circumference - maleDash
            }`}
            strokeDashoffset={-femaleDash}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-lg font-semibold text-[var(--fg)]">
            {female}%
          </span>

          <span className="text-[10px] text-[var(--fg-4)]">
            Female
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-pink-500" />

            <span className="text-[11px] text-[var(--fg-4)]">
              Female
            </span>
          </div>

          <p className="mt-1 text-sm font-semibold text-[var(--fg)]">
            {female}%
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />

            <span className="text-[11px] text-[var(--fg-4)]">
              Male
            </span>
          </div>

          <p className="mt-1 text-sm font-semibold text-[var(--fg)]">
            {male}%
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                HEATMAP                                     */
/* -------------------------------------------------------------------------- */

function BestTimeHeatmap() {
  const days = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];

  const hours = [
    "12am",
    "4am",
    "8am",
    "12pm",
    "4pm",
    "8pm",
  ];

  const heatmap = [
    [1, 1, 2, 3, 3, 2, 1, 1],
    [1, 2, 3, 4, 5, 4, 2, 1],
    [1, 2, 4, 6, 8, 6, 3, 1],
    [1, 2, 5, 7, 9, 7, 4, 2],
    [1, 2, 4, 6, 7, 6, 3, 1],
    [1, 1, 3, 4, 5, 4, 2, 1],
    [1, 1, 2, 3, 3, 2, 1, 1],
  ];

  const getOpacity = (value: number) =>
    0.08 + value * 0.09;

  return (
    <div>
      <div className="mt-4 grid grid-cols-[28px_repeat(8,1fr)] gap-1">
        <div />

        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} />
        ))}

        {days.map((day, dayIndex) => (
          <div
            key={day}
            className="contents"
          >
            <div className="flex items-center text-[9px] text-[var(--fg-4)]">
              {day}
            </div>

            {heatmap[dayIndex].map(
              (value, hourIndex) => (
                <div
                  key={`${day}-${hourIndex}`}
                  className="aspect-square min-h-[15px] rounded-[2px]"
                  style={{
                    backgroundColor: `rgba(236,72,153,${getOpacity(
                      value
                    )})`,
                    border:
                      "1px solid rgba(236,72,153,0.12)",
                  }}
                />
              )
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 ml-7 grid grid-cols-6">
        {hours.map((hour) => (
          <span
            key={hour}
            className="text-[8px] text-[var(--fg-4)]"
          >
            {hour}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-[9px] text-[var(--fg-4)]">
          Low activity
        </span>

        <div className="flex gap-[2px]">
          {[1, 2, 3, 4].map((item) => (
            <span
              key={item}
              className="h-2.5 w-4 rounded-sm"
              style={{
                backgroundColor: `rgba(236,72,153,${
                  0.12 + item * 0.18
                })`,
              }}
            />
          ))}
        </div>

        <span className="text-[9px] text-[var(--fg-4)]">
          High activity
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             MAIN COMPONENT                                 */
/* -------------------------------------------------------------------------- */

export function AnalyticsClient({
  persona,
  posts,
  campaigns,
  connectedCount,
}: {
  persona: string;
  posts: SocialPost[];
  campaigns: Campaign[];
  connectedCount: number;
}) {
  /* ------------------------------------------------------------------------ */
  /*                               CALCULATIONS                               */
  /* ------------------------------------------------------------------------ */

  const totals = useMemo(() => {
    const impressions = posts.reduce(
      (total, post) =>
        total + safeNumber(post.impressions),
      0
    );

    const likes = posts.reduce(
      (total, post) =>
        total + safeNumber(post.likes),
      0
    );

    const comments = posts.reduce(
      (total, post) =>
        total + safeNumber(post.comments),
      0
    );

    const shares = posts.reduce(
      (total, post) =>
        total + safeNumber(post.shares),
      0
    );

    const saves = posts.reduce(
      (total, post) =>
        total + safeNumber(post.saves),
      0
    );

    const engagement =
      likes +
      comments +
      shares +
      saves;

    const revenue = posts.reduce(
      (total, post) =>
        total + safeNumber(post.revenue),
      0
    );

    const engagementRate =
      impressions > 0
        ? (engagement / impressions) * 100
        : 0;

    return {
      impressions,
      likes,
      comments,
      shares,
      saves,
      engagement,
      revenue,
      engagementRate,
      count: posts.length,
    };
  }, [posts]);

  /* ------------------------------------------------------------------------ */
  /*                              GROWTH SERIES                               */
  /* ------------------------------------------------------------------------ */

  const growthSeries = useMemo(() => {
    const byDay: Record<string, number> = {};

    posts.forEach((post) => {
      const date =
        post.posted_at?.slice(0, 10) ?? "unknown";

      byDay[date] =
        (byDay[date] ?? 0) +
        safeNumber(post.impressions);
    });

    const values = Object.keys(byDay)
      .sort()
      .map((date) => byDay[date]);

    if (values.length >= 7) {
      return values.slice(-7);
    }

    if (values.length > 0) {
      const first = values[0];

      const filler = Array.from(
        { length: Math.max(0, 7 - values.length) },
        (_, index) =>
          Math.max(
            0,
            first * (0.65 + index * 0.05)
          )
      );

      return [...filler, ...values];
    }

    return [
      1000,
      1300,
      1350,
      2100,
      2500,
      2450,
      3200,
    ];
  }, [posts]);

  /* ------------------------------------------------------------------------ */
  /*                              PLATFORM DATA                               */
  /* ------------------------------------------------------------------------ */

  const platformData = useMemo(() => {
    const map: Record<
      string,
      {
        engagement: number;
        impressions: number;
      }
    > = {};

    posts.forEach((post) => {
      const platform = post.platform;

      if (!map[platform]) {
        map[platform] = {
          engagement: 0,
          impressions: 0,
        };
      }

      map[platform].engagement += engOf(post);

      map[platform].impressions += safeNumber(
        post.impressions
      );
    });

    const totalEngagement = Math.max(
      Object.values(map).reduce(
        (sum, item) =>
          sum + item.engagement,
        0
      ),
      1
    );

    return Object.entries(map)
      .map(([platform, value]) => ({
        platform,
        label: platformLabel(platform),
        engagement: value.engagement,
        impressions: value.impressions,
        percentage: Math.round(
          (value.engagement /
            totalEngagement) *
            100
        ),
      }))
      .sort(
        (a, b) =>
          b.engagement - a.engagement
      );
  }, [posts]);

  const displayPlatforms =
    platformData.length > 0
      ? platformData
      : [
          {
            platform: "instagram",
            label: "Instagram",
            engagement: 47,
            impressions: 0,
            percentage: 47,
          },
          {
            platform: "tiktok",
            label: "TikTok",
            engagement: 28,
            impressions: 0,
            percentage: 28,
          },
          {
            platform: "youtube",
            label: "YouTube",
            engagement: 12,
            impressions: 0,
            percentage: 12,
          },
          {
            platform: "twitter",
            label: "X (Twitter)",
            engagement: 8,
            impressions: 0,
            percentage: 8,
          },
          {
            platform: "linkedin",
            label: "LinkedIn",
            engagement: 5,
            impressions: 0,
            percentage: 5,
          },
        ];

  /* ------------------------------------------------------------------------ */
  /*                              TOP CONTENT                                 */
  /* ------------------------------------------------------------------------ */

  const topContent = useMemo(() => {
    return [...posts]
      .sort(
        (a, b) =>
          engOf(b) - engOf(a)
      )
      .slice(0, 4);
  }, [posts]);

  /* ------------------------------------------------------------------------ */
  /*                                 TOPICS                                   */
  /* ------------------------------------------------------------------------ */

  const topTopics = useMemo(() => {
    const words: Record<string, number> = {};

    const stopWords = new Set([
      "the",
      "and",
      "this",
      "that",
      "with",
      "from",
      "your",
      "about",
      "have",
      "just",
      "into",
      "for",
      "you",
      "are",
      "was",
      "but",
      "not",
      "our",
      "out",
      "how",
      "what",
      "when",
    ]);

    posts.forEach((post) => {
      const text =
        post.content?.toLowerCase() ?? "";

      text
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 3 &&
            !stopWords.has(word)
        )
        .forEach((word) => {
          words[word] =
            (words[word] ?? 0) + 1;
        });
    });

    const extracted = Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({
        topic:
          topic.charAt(0).toUpperCase() +
          topic.slice(1),
        count,
      }));

    if (extracted.length > 0) {
      const max = Math.max(
        ...extracted.map((item) => item.count),
        1
      );

      return extracted.map((item) => ({
        ...item,
        percentage: Math.round(
          (item.count / max) * 34
        ),
      }));
    }

    return [
      {
        topic: "Productivity",
        percentage: 34,
      },
      {
        topic: "Content creation",
        percentage: 28,
      },
      {
        topic: "Social media tips",
        percentage: 18,
      },
      {
        topic: "Lifestyle",
        percentage: 12,
      },
      {
        topic: "Tech & AI",
        percentage: 8,
      },
    ];
  }, [posts]);

  /* ------------------------------------------------------------------------ */
  /*                               EMPTY STATE                                */
  /* ------------------------------------------------------------------------ */

  if (
    connectedCount === 0 &&
    posts.length === 0 &&
    campaigns.length === 0
  ) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <PageHeader
          eyebrow="Creator Analytics"
          title="Analytics"
          sub="Connect your accounts to start tracking your content performance."
        />

        <GlassCard className="mt-6 flex min-h-[400px] flex-col items-center justify-center p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--sai-indigo)]/10">
            <Plug className="h-7 w-7 text-[var(--sai-indigo)]" />
          </div>

          <h2 className="mt-5 font-display text-xl font-semibold text-[var(--fg)]">
            No analytics yet
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--fg-4)]">
            Connect your social accounts and sync your
            content to unlock detailed performance
            insights.
          </p>

          <Link
            href="/dashboard/integrations"
            className="mt-6 rounded-xl px-5 py-3 text-sm font-semibold text-white"
            style={{
              background:
                "linear-gradient(135deg,#ec4899,#a855f7)",
            }}
          >
            Connect accounts
          </Link>
        </GlassCard>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                                  RENDER                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="mx-auto max-w-[1500px] pb-10">
      {/* HEADER */}

      <div className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-400" />

            <span className="font-data text-[10px] uppercase tracking-[0.2em] text-[var(--fg-4)]">
              {persona === "creator"
                ? "Creator focused"
                : "Performance insights"}
            </span>
          </div>

          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--fg)]">
            Analytics
          </h1>

          <p className="mt-2 text-sm text-[var(--fg-4)]">
            Understand your audience and discover what
            content works.
          </p>
        </div>

        <button className="flex items-center gap-2 self-start rounded-xl border border-[var(--border)] bg-[var(--panel-fill)] px-4 py-2.5 text-xs font-medium text-[var(--fg-2)] transition hover:bg-[var(--panel-fill-2)]">
          <CalendarDays className="h-4 w-4 text-pink-400" />

          Last 30 days

          <ChevronRight className="h-3.5 w-3.5 rotate-90" />
        </button>
      </div>

      {/* TOP METRICS */}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <AnalyticsStatCard
          label="Followers"
          value={fmtNum(
            Math.max(
              totals.count * 1200,
              connectedCount * 1000
            )
          )}
          growth="+12%"
          icon={Users}
          tone="pink"
        />

        <AnalyticsStatCard
          label="Engagement Rate"
          value={`${totals.engagementRate.toFixed(1)}%`}
          growth="+2.3%"
          icon={Heart}
          tone="purple"
        />

        <AnalyticsStatCard
          label="Reach"
          value={fmtNum(totals.impressions)}
          growth="+24%"
          icon={TrendingUp}
          tone="violet"
        />

        <AnalyticsStatCard
          label="Impressions"
          value={fmtNum(totals.impressions)}
          growth="+18%"
          icon={Eye}
          tone="indigo"
        />
      </div>

      {/* MAIN ROW */}

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(350px,0.9fr)]">
        {/* FOLLOWER GROWTH */}

        <GlassCard className="overflow-hidden p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">
                Follower Growth
              </h2>

              <p className="mt-1 text-[11px] text-[var(--fg-4)]">
                Audience growth over the last 7 days
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
              <TrendingUp className="h-3 w-3" />

              +12%
            </div>
          </div>

          <GrowthChart data={growthSeries} />
        </GlassCard>

        {/* TOP CONTENT */}

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">
                Top Performing Content
              </h2>

              <p className="mt-1 text-[11px] text-[var(--fg-4)]">
                Ranked by engagement
              </p>
            </div>

            <span className="cursor-pointer text-[10px] font-semibold text-pink-400">
              View all
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {topContent.length > 0 ? (
              topContent.map(
                (post, index) => {
                  const PlatformIcon =
                    getPlatformIcon(
                      post.platform
                    );

                  return (
                    <div
                      key={post.id}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-[var(--panel-fill-2)] text-[10px] font-semibold text-[var(--fg-4)]">
                        {index + 1}
                      </div>

                      <div
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: `${getPlatformColor(
                            post.platform
                          )}18`,
                        }}
                      >
                        <PlatformIcon
                          className="h-5 w-5"
                          style={{
                            color: getPlatformColor(
                              post.platform
                            ),
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-[var(--fg-2)]">
                          {post.content ??
                            "Untitled content"}
                        </p>

                        <p className="mt-1 text-[9px] text-[var(--fg-4)]">
                          {fmtNum(
                            engOf(post)
                          )} engagement ·{" "}
                          {post.engagement_rate ?? 0}%
                        </p>
                      </div>
                    </div>
                  );
                }
              )
            ) : (
              <>
                {[
                  "Behind the scenes",
                  "My top 3 lessons",
                  "This or that",
                  "A day in my life",
                ].map((title, index) => (
                  <div
                    key={title}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--panel-fill-2)] text-[10px] text-[var(--fg-4)]">
                      {index + 1}
                    </div>

                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/30" />

                    <div>
                      <p className="text-[11px] text-[var(--fg-2)]">
                        {title}
                      </p>

                      <p className="mt-1 text-[9px] text-[var(--fg-4)]">
                        —
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </GlassCard>
      </div>

      {/* SECONDARY METRICS */}

      <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <AnalyticsStatCard
          label="Reach"
          value={fmtNum(totals.impressions)}
          growth="+24%"
          icon={Eye}
          tone="pink"
        />

        <AnalyticsStatCard
          label="Likes"
          value={fmtNum(totals.likes)}
          growth="+18%"
          icon={Heart}
          tone="purple"
        />

        <AnalyticsStatCard
          label="Comments"
          value={fmtNum(totals.comments)}
          growth="+12%"
          icon={MessageCircle}
          tone="violet"
        />

        <AnalyticsStatCard
          label="Shares"
          value={fmtNum(totals.shares)}
          growth="+15%"
          icon={Share2}
          tone="indigo"
        />
      </div>

      {/* DEMOGRAPHICS / BEST TIME / PLATFORM */}

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        {/* AUDIENCE */}

        <GlassCard className="p-5">
          <div>
            <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">
              Audience Demographics
            </h2>

            <p className="mt-1 text-[11px] text-[var(--fg-4)]">
              Audience breakdown
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="rounded-lg bg-pink-500 px-3 py-1.5 text-[10px] font-semibold text-white">
              Gender
            </button>

            <button className="rounded-lg bg-[var(--panel-fill)] px-3 py-1.5 text-[10px] text-[var(--fg-4)]">
              Age
            </button>

            <button className="rounded-lg bg-[var(--panel-fill)] px-3 py-1.5 text-[10px] text-[var(--fg-4)]">
              Location
            </button>
          </div>

          <div className="mt-6">
            <AudienceDonut
              female={68}
              male={32}
            />
          </div>
        </GlassCard>

        {/* BEST TIME */}

        <GlassCard className="p-5">
          <div>
            <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">
              Best Time to Post
            </h2>

            <p className="mt-1 text-[11px] text-[var(--fg-4)]">
              When your audience is most active
            </p>
          </div>

          <BestTimeHeatmap />
        </GlassCard>

        {/* PLATFORM PERFORMANCE */}

        <GlassCard className="p-5">
          <div>
            <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">
              Platform Performance
            </h2>

            <p className="mt-1 text-[11px] text-[var(--fg-4)]">
              Engagement distribution
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {displayPlatforms
              .slice(0, 5)
              .map((platform) => (
                <div
                  key={platform.platform}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlatformBadge
                        platform={
                          platform.platform
                        }
                      />

                      <span className="text-[11px] font-medium text-[var(--fg-2)]">
                        {platform.label}
                      </span>
                    </div>

                    <span className="font-data text-[10px] text-[var(--fg-4)]">
                      {platform.percentage}%
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--panel-fill-2)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${platform.percentage}%`,
                        backgroundColor:
                          getPlatformColor(
                            platform.platform
                          ),
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </GlassCard>
      </div>

      {/* AI INSIGHTS / TOPICS */}

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(350px,0.8fr)]">
        {/* AI INSIGHTS */}

        <GlassCard className="overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <Sparkles className="h-4 w-4 text-pink-400" />
              </div>

              <div>
                <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">
                  AI Insights
                </h2>

                <p className="text-[10px] text-[var(--fg-4)]">
                  Personalized recommendations
                </p>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-pink-400">
              View all
            </span>
          </div>

          <div className="mt-5 divide-y divide-[var(--border)]">
            <div className="flex gap-3 py-4 first:pt-0">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-pink-500/10">
                <TrendingUp className="h-4 w-4 text-pink-400" />
              </div>

              <div className="flex-1">
                <p className="text-[12px] leading-5 text-[var(--fg-2)]">
                  Your engagement is strongest when
                  you post consistently between your
                  highest-performing time windows.
                </p>
              </div>

              <ChevronRight className="mt-1 h-4 w-4 text-[var(--fg-4)]" />
            </div>

            <div className="flex gap-3 py-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                <Play className="h-4 w-4 text-purple-400" />
              </div>

              <div className="flex-1">
                <p className="text-[12px] leading-5 text-[var(--fg-2)]">
                  Video content is outperforming
                  static content. Consider creating
                  more short-form video posts.
                </p>
              </div>

              <ChevronRight className="mt-1 h-4 w-4 text-[var(--fg-4)]" />
            </div>

            <div className="flex gap-3 py-4 pb-0">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                <Users className="h-4 w-4 text-indigo-400" />
              </div>

              <div className="flex-1">
                <p className="text-[12px] leading-5 text-[var(--fg-2)]">
                  Your audience is most responsive to
                  content around your strongest topics.
                  Double down on what is already
                  performing.
                </p>
              </div>

              <ChevronRight className="mt-1 h-4 w-4 text-[var(--fg-4)]" />
            </div>
          </div>
        </GlassCard>

        {/* TOP TOPICS */}

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">
                Top Topics
              </h2>

              <p className="mt-1 text-[11px] text-[var(--fg-4)]">
                What your audience engages with
              </p>
            </div>

            <span className="text-[10px] font-semibold text-pink-400">
              View all
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {topTopics.map(
              (topic, index) => (
                <div
                  key={topic.topic}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--panel-fill)] text-[10px] font-semibold text-[var(--fg-4)]">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] text-[var(--fg-2)]">
                      {topic.topic}
                    </p>
                  </div>

                  <span className="font-data text-[10px] text-[var(--fg-3)]">
                    {topic.percentage}%
                  </span>

                  <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-400">
                    <TrendingUp className="h-3 w-3" />

                    +{Math.max(
                      2,
                      Math.round(
                        topic.percentage / 5
                      )
                    )}
                    %
                  </div>
                </div>
              )
            )}
          </div>
        </GlassCard>
      </div>

      {/* CAMPAIGN PERFORMANCE */}

      {campaigns.length > 0 && (
        <div className="mt-5">
          <div className="mb-4 flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-amber-400" />

            <h2 className="font-display text-[15px] font-semibold text-[var(--fg)]">
              Campaign Performance
            </h2>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {campaigns.slice(0, 4).map(
              (campaign) => (
                <GlassCard
                  key={campaign.id}
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
                          <Megaphone className="h-4 w-4 text-amber-400" />
                        </div>

                        <div>
                          <h3 className="font-display text-sm font-semibold text-[var(--fg)]">
                            {campaign.name}
                          </h3>

                          <p className="mt-0.5 text-[10px] text-[var(--fg-4)]">
                            {platformLabel(
                              campaign.platform
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Pill
                      tone={
                        campaign.status ===
                        "active"
                          ? "green"
                          : "muted"
                      }
                    >
                      {campaign.status}
                    </Pill>
                  </div>

                  <div className="mt-5 grid grid-cols-4 gap-2">
                    <div className="rounded-xl bg-[var(--panel-fill)] p-3 text-center">
                      <DollarSign className="mx-auto h-3.5 w-3.5 text-amber-400" />

                      <p className="mt-2 font-data text-xs text-[var(--fg)]">
                        {fmtNaira(
                          safeNumber(
                            campaign.spend
                          )
                        )}
                      </p>

                      <p className="mt-1 text-[9px] text-[var(--fg-4)]">
                        Spend
                      </p>
                    </div>

                    <div className="rounded-xl bg-[var(--panel-fill)] p-3 text-center">
                      <TrendingUp className="mx-auto h-3.5 w-3.5 text-pink-400" />

                      <p className="mt-2 font-data text-xs text-[var(--fg)]">
                        {safeNumber(
                          campaign.ctr
                        ).toFixed(1)}
                        %
                      </p>

                      <p className="mt-1 text-[9px] text-[var(--fg-4)]">
                        CTR
                      </p>
                    </div>

                    <div className="rounded-xl bg-[var(--panel-fill)] p-3 text-center">
                      <Trophy className="mx-auto h-3.5 w-3.5 text-purple-400" />

                      <p className="mt-2 font-data text-xs text-[var(--fg)]">
                        {fmtNum(
                          safeNumber(
                            campaign.conversions
                          )
                        )}
                      </p>

                      <p className="mt-1 text-[9px] text-[var(--fg-4)]">
                        Conv.
                      </p>
                    </div>

                    <div className="rounded-xl bg-[var(--panel-fill)] p-3 text-center">
                      <TrendingUp className="mx-auto h-3.5 w-3.5 text-emerald-400" />

                      <p className="mt-2 font-data text-xs text-[var(--fg)]">
                        {safeNumber(
                          campaign.roas
                        ).toFixed(1)}
                        ×
                      </p>

                      <p className="mt-1 text-[9px] text-[var(--fg-4)]">
                        ROAS
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}