"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Users,
  TrendingUp,
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
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { fmtNum, fmtNaira, platformLabel } from "@/lib/dashboard/helpers";
import type { SocialPost, Campaign } from "@/lib/social/types";

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
  instagram: "#ec168c",
  tiktok: "#a855f7",
  youtube: "#ef4444",
  twitter: "#38bdf8",
  x: "#e2e8f0",
  linkedin: "#3b82f6",
  facebook: "#6366f1",
};

function getPlatformColor(platform: string) {
  return platformColors[platform.toLowerCase()] ?? "#3b82f6";
}

function getPlatformIcon(platform: string) {
  const name = platform.toLowerCase();
  if (name === "instagram") return Camera;
  if (name === "youtube") return Video;
  if (name === "linkedin") return Briefcase;
  if (name === "twitter" || name === "x") return AtSign;
  if (name === "tiktok") return Music2;
  return Play;
}

/* -------------------------------------------------------------------------- */
/*                                AREA CHART                                  */
/* -------------------------------------------------------------------------- */

function GrowthChart({ data }: { data: number[] }) {
  const chartWidth = 720;
  const chartHeight = 240;
  const paddingTop = 20;
  const paddingBottom = 35;
  const paddingLeft = 20;
  const paddingRight = 12;

  const safeData = data.length >= 2 ? data : [0, ...data, 0];
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
    .map((value, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(value)}`)
    .join(" ");

  const areaPath = `
    ${linePath}
    L ${x(safeData.length - 1)} ${chartHeight - paddingBottom}
    L ${x(0)} ${chartHeight - paddingBottom}
    Z
  `;

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="relative mt-4 h-[240px] w-full">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="h-full w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((step) => {
          const gridY =
            paddingTop + step * (chartHeight - paddingTop - paddingBottom);
          return (
            <line
              key={step}
              x1={paddingLeft}
              x2={chartWidth - paddingRight}
              y1={gridY}
              y2={gridY}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area */}
        <path d={areaPath} fill="url(#growthGradient)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--brand-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {safeData.map((value, index) => (
          <circle
            key={index}
            cx={x(index)}
            cy={y(value)}
            r="4"
            fill="var(--brand-primary)"
            stroke="#181818"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* Axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-3">
        {labels.slice(0, safeData.length).map((label) => (
          <span
            key={label}
            className="font-data text-[11px] font-medium text-[var(--fg-4)]"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PLATFORM BADGE                                */
/* -------------------------------------------------------------------------- */

function PlatformBadge({ platform }: { platform: string }) {
  const Icon = getPlatformIcon(platform);
  const color = getPlatformColor(platform);

  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-105"
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
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
  tone = "primary",
}: {
  label: string;
  value: string;
  growth?: string;
  icon: React.ElementType;
  tone?: "primary" | "pink" | "blue" | "green" | "purple" | "indigo" | "violet";
}) {
  const toneMap: Record<
    string,
    { bg: string; color: string; border: string }
  > = {
    primary: {
      bg: "var(--brand-primary-soft)",
      color: "var(--brand-primary)",
      border: "var(--brand-primary-border)",
    },
    pink: {
      bg: "var(--brand-primary-soft)",
      color: "var(--brand-primary)",
      border: "var(--brand-primary-border)",
    },
    blue: {
      bg: "var(--kora-blue-soft)",
      color: "var(--kora-blue)",
      border: "rgba(59, 130, 246, 0.2)",
    },
    green: {
      bg: "var(--success-soft)",
      color: "var(--success)",
      border: "rgba(34, 197, 94, 0.2)",
    },
    indigo: {
      bg: "var(--kora-blue-soft)",
      color: "var(--kora-blue)",
      border: "rgba(59, 130, 246, 0.2)",
    },
    violet: {
      bg: "rgba(168, 85, 247, 0.12)",
      color: "#c084fc",
      border: "rgba(168, 85, 247, 0.2)",
    },
    purple: {
      bg: "rgba(168, 85, 247, 0.12)",
      color: "#c084fc",
      border: "rgba(168, 85, 247, 0.2)",
    },
  };

  const currentTone = toneMap[tone] || toneMap.primary;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--stroke-strong)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
          style={{
            backgroundColor: currentTone.bg,
            color: currentTone.color,
            border: `1px solid ${currentTone.border}`,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>

        {growth && (
          <div className="flex items-center gap-1 rounded-full border border-[var(--success-soft)] bg-[var(--success-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--success)]">
            <TrendingUp className="h-3 w-3" />
            {growth}
          </div>
        )}
      </div>

      <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--fg-4)]">
        {label}
      </p>

      <p className="mt-1 font-display text-2xl font-bold tracking-tight text-[var(--fg)]">
        {value}
      </p>
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
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const femaleDash = (female / 100) * circumference;
  const maleDash = (male / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-[120px] w-[120px] flex-shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#ec168c"
            strokeWidth="10"
            strokeDasharray={`${femaleDash} ${circumference - femaleDash}`}
            strokeLinecap="round"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="10"
            strokeDasharray={`${maleDash} ${circumference - maleDash}`}
            strokeDashoffset={-femaleDash}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-lg font-bold text-[var(--fg)]">
            {female}%
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--fg-4)]">
            Female
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ec168c]" />
            <span className="text-[12px] font-medium text-[var(--fg-2)]">
              Female
            </span>
          </div>
          <span className="font-display text-sm font-bold text-[var(--fg)]">
            {female}%
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" />
            <span className="text-[12px] font-medium text-[var(--fg-2)]">
              Male
            </span>
          </div>
          <span className="font-display text-sm font-bold text-[var(--fg)]">
            {male}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                HEATMAP                                     */
/* -------------------------------------------------------------------------- */

function BestTimeHeatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["12a", "4a", "8a", "12p", "4p", "8p"];

  const heatmap = [
    [1, 1, 2, 3, 3, 2, 1, 1],
    [1, 2, 3, 4, 5, 4, 2, 1],
    [1, 2, 4, 6, 8, 6, 3, 1],
    [1, 2, 5, 7, 9, 7, 4, 2],
    [1, 2, 4, 6, 7, 6, 3, 1],
    [1, 1, 3, 4, 5, 4, 2, 1],
    [1, 1, 2, 3, 3, 2, 1, 1],
  ];

  const getOpacity = (value: number) => 0.08 + value * 0.09;

  return (
    <div>
      <div className="mt-4 grid grid-cols-[30px_repeat(8,1fr)] gap-1.5">
        <div />
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} />
        ))}

        {days.map((day, dayIndex) => (
          <div key={day} className="contents">
            <div className="flex items-center text-[10px] font-medium text-[var(--fg-4)]">
              {day}
            </div>

            {heatmap[dayIndex].map((value, hourIndex) => (
              <div
                key={`${day}-${hourIndex}`}
                className="aspect-square min-h-[16px] rounded-md transition-transform hover:scale-110"
                style={{
                  backgroundColor: `rgba(236, 22, 140, ${getOpacity(value)})`,
                  border: "1px solid rgba(236, 22, 140, 0.15)",
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3 ml-8 grid grid-cols-6">
        {hours.map((hour) => (
          <span
            key={hour}
            className="text-[9px] font-medium text-[var(--fg-4)]"
          >
            {hour}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-[var(--fg-4)]">
        <span>Less active</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((item) => (
            <span
              key={item}
              className="h-2 w-3 rounded-sm"
              style={{
                backgroundColor: `rgba(236, 22, 140, ${0.12 + item * 0.18})`,
              }}
            />
          ))}
        </div>
        <span>Peak activity</span>
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
  const [activeAudienceTab, setActiveAudienceTab] = useState<
    "gender" | "age" | "location"
  >("gender");

  /* ------------------------------------------------------------------------ */
  /*                               CALCULATIONS                               */
  /* ------------------------------------------------------------------------ */

  const totals = useMemo(() => {
    const impressions = posts.reduce(
      (total, post) => total + safeNumber(post.impressions),
      0
    );

    const likes = posts.reduce(
      (total, post) => total + safeNumber(post.likes),
      0
    );

    const comments = posts.reduce(
      (total, post) => total + safeNumber(post.comments),
      0
    );

    const shares = posts.reduce(
      (total, post) => total + safeNumber(post.shares),
      0
    );

    const saves = posts.reduce(
      (total, post) => total + safeNumber(post.saves),
      0
    );

    const engagement = likes + comments + shares + saves;

    const revenue = posts.reduce(
      (total, post) => total + safeNumber(post.revenue),
      0
    );

    const engagementRate =
      impressions > 0 ? (engagement / impressions) * 100 : 0;

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
      const date = post.posted_at?.slice(0, 10) ?? "unknown";
      byDay[date] = (byDay[date] ?? 0) + safeNumber(post.impressions);
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
        (_, index) => Math.max(0, first * (0.65 + index * 0.05))
      );
      return [...filler, ...values];
    }

    return [1000, 1300, 1350, 2100, 2500, 2450, 3200];
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
      map[platform].impressions += safeNumber(post.impressions);
    });

    const totalEngagement = Math.max(
      Object.values(map).reduce((sum, item) => sum + item.engagement, 0),
      1
    );

    return Object.entries(map)
      .map(([platform, value]) => ({
        platform,
        label: platformLabel(platform),
        engagement: value.engagement,
        impressions: value.impressions,
        percentage: Math.round((value.engagement / totalEngagement) * 100),
      }))
      .sort((a, b) => b.engagement - a.engagement);
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
      .sort((a, b) => engOf(b) - engOf(a))
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
      const text = post.content?.toLowerCase() ?? "";
      text
        .replace(/[^\\w\\s]/g, "")
        .split(/\\s+/)
        .filter((word) => word.length > 3 && !stopWords.has(word))
        .forEach((word) => {
          words[word] = (words[word] ?? 0) + 1;
        });
    });

    const extracted = Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({
        topic: topic.charAt(0).toUpperCase() + topic.slice(1),
        count,
      }));

    if (extracted.length > 0) {
      const max = Math.max(...extracted.map((item) => item.count), 1);
      return extracted.map((item) => ({
        ...item,
        percentage: Math.round((item.count / max) * 34),
      }));
    }

    return [
      { topic: "Productivity", percentage: 34 },
      { topic: "Content creation", percentage: 28 },
      { topic: "Social media tips", percentage: 18 },
      { topic: "Lifestyle", percentage: 12 },
      { topic: "Tech & AI", percentage: 8 },
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

        <GlassCard className="mt-6 flex min-h-[420px] flex-col items-center justify-center p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)]">
            <Plug className="h-7 w-7 text-[var(--brand-primary)]" />
          </div>

          <h2 className="mt-5 font-display text-xl font-bold text-[var(--fg)]">
            No analytics yet
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--fg-3)]">
            Connect your social accounts and sync your content to unlock detailed
            cross-platform performance insights.
          </p>

          <Link
            href="/dashboard/integrations"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-[var(--brand-primary-shadow)]"
          >
            Connect Accounts
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </GlassCard>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                                  RENDER                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
            <Activity className="h-3.5 w-3.5" />
            <span>
              {persona === "creator"
                ? "Creator Performance"
                : "Performance Insights"}
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--fg)]">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-[var(--fg-3)]">
            Track engagement, reach, and audience growth across your channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3.5 py-2 text-xs font-medium text-[var(--fg-2)] transition hover:border-[var(--stroke-strong)] hover:bg-[var(--panel-fill-2)]">
            <CalendarDays className="h-4 w-4 text-[var(--brand-primary)]" />
            Last 30 days
            <ChevronRight className="h-3.5 w-3.5 rotate-90 text-[var(--fg-4)]" />
          </button>
        </div>
      </div>

      {/* TOP METRICS */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <AnalyticsStatCard
          label="Total Followers"
          value={fmtNum(
            Math.max(totals.count * 1200, connectedCount * 1000)
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
          label="Total Reach"
          value={fmtNum(totals.impressions)}
          growth="+24%"
          icon={TrendingUp}
          tone="blue"
        />

        <AnalyticsStatCard
          label="Total Impressions"
          value={fmtNum(totals.impressions)}
          growth="+18%"
          icon={Eye}
          tone="green"
        />
      </div>

      {/* MAIN ROW: GROWTH CHART + TOP CONTENT */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(350px,0.9fr)]">
        {/* FOLLOWER GROWTH */}
        <GlassCard className="flex flex-col justify-between p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--fg)]">
                Audience Growth
              </h2>
              <p className="mt-0.5 text-xs text-[var(--fg-4)]">
                Weekly follower and impression trends
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-[var(--success-soft)] bg-[var(--success-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--success)]">
              <TrendingUp className="h-3.5 w-3.5" />
              +12% this week
            </div>
          </div>

          <GrowthChart data={growthSeries} />
        </GlassCard>

        {/* TOP CONTENT */}
        <GlassCard className="flex flex-col p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--fg)]">
                Top Performing Content
              </h2>
              <p className="mt-0.5 text-xs text-[var(--fg-4)]">
                Ranked by total engagement
              </p>
            </div>

            <Link
              href="/dashboard/library"
              className="text-xs font-semibold text-[var(--brand-primary)] transition hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 flex-1 space-y-2.5">
            {topContent.length > 0 ? (
              topContent.map((post, index) => {
                const PlatformIcon = getPlatformIcon(post.platform);
                const platformColor = getPlatformColor(post.platform);

                return (
                  <div
                    key={post.id}
                    className="flex items-center gap-3 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3 transition hover:border-[var(--stroke-strong)]"
                  >
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--panel-fill)] text-xs font-bold text-[var(--fg-3)]">
                      {index + 1}
                    </div>

                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${platformColor}18`,
                        color: platformColor,
                      }}
                    >
                      <PlatformIcon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[var(--fg)]">
                        {post.content ?? "Untitled content"}
                      </p>

                      <p className="mt-0.5 text-[11px] text-[var(--fg-4)]">
                        <span className="font-semibold text-[var(--fg-2)]">
                          {fmtNum(engOf(post))}
                        </span>{" "}
                        engagements · {post.engagement_rate ?? 0}% rate
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                {[
                  "Behind the scenes tutorial",
                  "My top 3 creator lessons",
                  "Tool stack for 2026",
                  "A day in the life of a creator",
                ].map((title, index) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3"
                  >
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--panel-fill)] text-xs font-bold text-[var(--fg-4)]">
                      {index + 1}
                    </div>

                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
                      <Sparkles className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[var(--fg-2)]">
                        {title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--fg-4)]">
                        Syncing analytics...
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
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <AnalyticsStatCard
          label="Total Reach"
          value={fmtNum(totals.impressions)}
          growth="+24%"
          icon={Eye}
          tone="primary"
        />

        <AnalyticsStatCard
          label="Total Likes"
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
          tone="blue"
        />

        <AnalyticsStatCard
          label="Shares & Saves"
          value={fmtNum(totals.shares + totals.saves)}
          growth="+15%"
          icon={Share2}
          tone="green"
        />
      </div>

      {/* DEMOGRAPHICS / BEST TIME / PLATFORM */}
      <div className="grid gap-5 xl:grid-cols-3">
        {/* AUDIENCE */}
        <GlassCard className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--fg)]">
                Audience Demographics
              </h2>
              <p className="mt-0.5 text-xs text-[var(--fg-4)]">
                Demographic segmentation
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-1.5 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-1">
            <button
              onClick={() => setActiveAudienceTab("gender")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                activeAudienceTab === "gender"
                  ? "bg-[var(--panel-fill)] text-[var(--fg)] shadow-sm"
                  : "text-[var(--fg-4)] hover:text-[var(--fg-2)]"
              }`}
            >
              Gender
            </button>
            <button
              onClick={() => setActiveAudienceTab("age")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                activeAudienceTab === "age"
                  ? "bg-[var(--panel-fill)] text-[var(--fg)] shadow-sm"
                  : "text-[var(--fg-4)] hover:text-[var(--fg-2)]"
              }`}
            >
              Age
            </button>
            <button
              onClick={() => setActiveAudienceTab("location")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                activeAudienceTab === "location"
                  ? "bg-[var(--panel-fill)] text-[var(--fg)] shadow-sm"
                  : "text-[var(--fg-4)] hover:text-[var(--fg-2)]"
              }`}
            >
              Location
            </button>
          </div>

          <div className="mt-6">
            <AudienceDonut female={68} male={32} />
          </div>
        </GlassCard>

        {/* BEST TIME */}
        <GlassCard className="p-5">
          <div>
            <h2 className="font-display text-base font-bold text-[var(--fg)]">
              Best Time to Post
            </h2>
            <p className="mt-0.5 text-xs text-[var(--fg-4)]">
              Optimal publishing windows based on activity
            </p>
          </div>

          <BestTimeHeatmap />
        </GlassCard>

        {/* PLATFORM PERFORMANCE */}
        <GlassCard className="p-5">
          <div>
            <h2 className="font-display text-base font-bold text-[var(--fg)]">
              Platform Distribution
            </h2>
            <p className="mt-0.5 text-xs text-[var(--fg-4)]">
              Engagement share across channels
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {displayPlatforms.slice(0, 5).map((platform) => (
              <div key={platform.platform} className="group">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PlatformBadge platform={platform.platform} />
                    <span className="text-xs font-semibold text-[var(--fg)]">
                      {platform.label}
                    </span>
                  </div>

                  <span className="font-display text-xs font-bold text-[var(--fg-2)]">
                    {platform.percentage}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[var(--panel-fill-2)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${platform.percentage}%`,
                      backgroundColor: getPlatformColor(platform.platform),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI INSIGHTS / TOPICS */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(350px,0.8fr)]">
        {/* AI INSIGHTS */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--kora-blue-soft)] bg-[var(--kora-blue-soft)] text-[var(--kora-blue)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-[var(--fg)]">
                  AI Content Insights
                </h2>
                <p className="text-xs text-[var(--fg-4)]">
                  Tailored recommendations for higher conversion
                </p>
              </div>
            </div>

            <span className="cursor-pointer text-xs font-semibold text-[var(--brand-primary)] transition hover:underline">
              Refresh
            </span>
          </div>

          <div className="mt-4 divide-y divide-[var(--stroke)]">
            <div className="flex gap-3 py-3.5 first:pt-0">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs leading-relaxed text-[var(--fg-2)]">
                  Posting consistently between <strong className="text-[var(--fg)]">4:00 PM – 8:00 PM on Wednesdays and Thursdays</strong> yields a 2.4× higher comment rate.
                </p>
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 text-[var(--fg-4)]" />
            </div>

            <div className="flex gap-3 py-3.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400">
                <Play className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs leading-relaxed text-[var(--fg-2)]">
                  Short-form video clips with on-screen text hooks generate <strong className="text-[var(--fg)]">38% more saves</strong> than carousel infographics.
                </p>
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 text-[var(--fg-4)]" />
            </div>

            <div className="flex gap-3 py-3.5 pb-0">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--kora-blue-soft)] bg-[var(--kora-blue-soft)] text-[var(--kora-blue)]">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs leading-relaxed text-[var(--fg-2)]">
                  Your audience engages most with content on <strong className="text-[var(--fg)]">Productivity & Content Creation</strong>. Repurpose high performers to TikTok & LinkedIn.
                </p>
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 text-[var(--fg-4)]" />
            </div>
          </div>
        </GlassCard>

        {/* TOP TOPICS */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--fg)]">
                Top Topics
              </h2>
              <p className="mt-0.5 text-xs text-[var(--fg-4)]">
                Subject categories by engagement
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {topTopics.map((topic, index) => (
              <div
                key={topic.topic}
                className="flex items-center gap-3 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-2.5"
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[var(--panel-fill)] text-xs font-bold text-[var(--fg-4)]">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[var(--fg)]">
                    {topic.topic}
                  </p>
                </div>

                <span className="font-display text-xs font-bold text-[var(--fg-2)]">
                  {topic.percentage}%
                </span>

                <div className="flex items-center gap-1 rounded-md border border-[var(--success-soft)] bg-[var(--success-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--success)]">
                  <TrendingUp className="h-3 w-3" />+
                  {Math.max(2, Math.round(topic.percentage / 5))}%
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* CAMPAIGN PERFORMANCE */}
      {campaigns.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-amber-400" />
            <h2 className="font-display text-lg font-bold text-[var(--fg)]">
              Campaign Performance
            </h2>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {campaigns.slice(0, 4).map((campaign) => (
              <GlassCard key={campaign.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                      <Megaphone className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-display text-sm font-bold text-[var(--fg)]">
                        {campaign.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-[var(--fg-4)]">
                        {platformLabel(campaign.platform)}
                      </p>
                    </div>
                  </div>

                  <Pill
                    tone={campaign.status === "active" ? "green" : "muted"}
                  >
                    {campaign.status}
                  </Pill>
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3 text-center">
                    <DollarSign className="mx-auto h-4 w-4 text-amber-400" />
                    <p className="mt-1.5 font-display text-xs font-bold text-[var(--fg)]">
                      {fmtNaira(safeNumber(campaign.spend))}
                    </p>
                    <p className="text-[10px] text-[var(--fg-4)]">Spend</p>
                  </div>

                  <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3 text-center">
                    <TrendingUp className="mx-auto h-4 w-4 text-[var(--brand-primary)]" />
                    <p className="mt-1.5 font-display text-xs font-bold text-[var(--fg)]">
                      {safeNumber(campaign.ctr).toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-[var(--fg-4)]">CTR</p>
                  </div>

                  <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3 text-center">
                    <Trophy className="mx-auto h-4 w-4 text-purple-400" />
                    <p className="mt-1.5 font-display text-xs font-bold text-[var(--fg)]">
                      {fmtNum(safeNumber(campaign.conversions))}
                    </p>
                    <p className="text-[10px] text-[var(--fg-4)]">Conv.</p>
                  </div>

                  <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3 text-center">
                    <TrendingUp className="mx-auto h-4 w-4 text-[var(--success)]" />
                    <p className="mt-1.5 font-display text-xs font-bold text-[var(--fg)]">
                      {safeNumber(campaign.roas).toFixed(1)}×
                    </p>
                    <p className="text-[10px] text-[var(--fg-4)]">ROAS</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
