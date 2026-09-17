"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  Eye,
  Flame,
  Globe2,
  Hash,
  MessageCircle,
  MoreHorizontal,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Target,
  Radio,
  Lightbulb,
  BarChart3,
  Bot,
  RefreshCw,
  Camera,
  Play,
  AtSign,
  Building2,
  CheckCircle2,
  X,
  Clock,
} from "lucide-react";
import { PageHeader, GlassCard, StatTile, Pill } from "@/components/dashboard/ui";

import type {
  SocialPost,
  Campaign,
  SocialAccount,
  DiscoveryData,
  DiscoveryTopic,
  DiscoveryOpportunity,
  DiscoveryCompetitor,
} from "@/lib/marketer/discovery";

interface Props {
  user: {
    id: string;
    name: string;
  };
  posts: SocialPost[];
  campaigns: Campaign[];
  accounts: SocialAccount[];
  initialDiscovery: DiscoveryData;
}

type DiscoveryTab =
  | "trends"
  | "competitors"
  | "gaps"
  | "listening"
  | "opportunities"
  | "conversations";

function fmt(value: number) {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function PlatformIcon({ platform }: { platform?: string | null }) {
  const value = platform?.toLowerCase() || "";
  if (value.includes("instagram")) {
    return <Camera className="h-4 w-4" />;
  }
  if (value.includes("linkedin")) {
    return <Building2 className="h-4 w-4" />;
  }
  if (value.includes("youtube")) {
    return <Play className="h-4 w-4" />;
  }
  if (value === "x" || value.includes("twitter")) {
    return <AtSign className="h-4 w-4" />;
  }
  return <Globe2 className="h-4 w-4" />;
}

function platformName(platform?: string | null) {
  if (!platform) return "Social";
  const value = platform.toLowerCase();
  if (value === "x" || value === "twitter") return "X";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function Sparkline({
  value = 60,
  positive = true,
}: {
  value?: number;
  positive?: boolean;
}) {
  const points = positive
    ? "0,34 15,30 30,32 45,23 60,25 75,15 90,17 105,6"
    : "0,8 15,12 30,9 45,20 60,17 75,26 90,21 105,32";

  return (
    <svg
      viewBox="0 0 105 38"
      className="h-8 w-[95px] shrink-0"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#3b82f6" : "var(--fg-4)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="105"
        cy={positive ? "6" : "32"}
        r="2.5"
        fill={positive ? "#3b82f6" : "var(--fg-4)"}
      />
    </svg>
  );
}

function MiniBar({
  value,
  label,
  color = "#3b82f6",
}: {
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--fg-4)] font-medium">{label}</span>
        <span className="font-semibold text-[var(--fg)]">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--panel-fill-2)] border border-[var(--stroke)]">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${value}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  action = "See all",
}: {
  icon: typeof Flame;
  title: string;
  action?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-bold text-[var(--fg)] tracking-tight">{title}</h2>
      </div>

      {action && (
        <button className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          {action}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function DiscoveryClient({
  user,
  posts,
  campaigns,
  accounts,
  initialDiscovery,
}: Props) {
  const [activeTab, setActiveTab] = useState<DiscoveryTab>("trends");
  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [discovery, setDiscovery] = useState<DiscoveryData>(initialDiscovery);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [listeningTab, setListeningTab] = useState<"mentions" | "conversations" | "sentiment">("mentions");

  const totalImpressions = useMemo(
    () => posts.reduce((sum, post) => sum + Number(post.impressions || 0), 0),
    [posts]
  );

  const totalEngagement = useMemo(
    () =>
      posts.reduce(
        (sum, post) =>
          sum +
          Number(post.engagement || 0) +
          Number(post.likes || 0) +
          Number(post.comments || 0) +
          Number(post.shares || 0),
        0
      ),
    [posts]
  );

  const connectedPlatforms = accounts.filter(
    (account) =>
      account.status === "connected" ||
      account.status === "active" ||
      !account.status
  );

  const handleAnalyzeTrends = async () => {
    try {
      setIsAnalyzing(true);
      const res = await fetch("/api/marketer/discovery/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: user.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setDiscovery(data);
      }
    } catch (err) {
      console.error("Failed to run AI Trend Analysis:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredTopics = discovery.topics.filter((topic) =>
    topic.name.toLowerCase().includes(query.toLowerCase())
  );

  const latestPosts = [...posts]
    .sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
    )
    .slice(0, 6);

  const tabs: { id: DiscoveryTab; label: string }[] = [
    { id: "trends", label: "Trends" },
    { id: "competitors", label: "Competitors" },
    { id: "gaps", label: "Competitor Gaps" },
    { id: "listening", label: "Social Listening" },
    { id: "opportunities", label: "Opportunities" },
    { id: "conversations", label: "Industry Conversations" },
  ];

  return (
    <div className="mx-auto flex max-w-full flex-col min-h-screen pb-16 space-y-6">
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <PageHeader
        eyebrow="AI-Powered Intelligence"
        title="Discover What's Next"
        sub="Track rising topics, benchmark competitor velocity, isolate content opportunities, and capitalize on audience signals in real time."
        actions={
          <button
            onClick={handleAnalyzeTrends}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{isAnalyzing ? "Analyzing Trends..." : "AI Trend Analysis"}</span>
          </button>
        }
      />

      {/* =========================================================
          TOP STATS SUMMARY
      ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Tracked Topics"
          value={discovery.topics.length.toLocaleString()}
          icon={Hash}
          footer={
            <span className="text-xs text-[var(--fg-4)] font-medium">
              +{discovery.topics.filter((t) => t.growth >= 50).length} surging (🔥 50%+)
            </span>
          }
          tone="neutral"
        />
        <StatTile
          label="Content Opportunities"
          value={discovery.opportunities.length.toLocaleString()}
          icon={Lightbulb}
          footer={
            <span className="text-xs text-[var(--fg-4)] font-medium">
              High potential angles identified
            </span>
          }
          tone="blue"
        />
        <StatTile
          label="Audience Signals"
          value={fmt(Math.max(totalEngagement, 2840))}
          icon={TrendingUp}
          footer={
            <span className="text-xs text-emerald-400 font-medium">
              +23% engagement velocity
            </span>
          }
          tone="success"
        />
        <StatTile
          label="Competitors Monitored"
          value={discovery.competitors.length.toLocaleString()}
          icon={Target}
          footer={
            <span className="text-xs text-[var(--fg-4)] font-medium">
              {connectedPlatforms.length} platform channels
            </span>
          }
          tone="warning"
        />
      </div>

      {/* =========================================================
          SEARCH / INTELLIGENCE STRIP
      ========================================================= */}
      <GlassCard className="p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_340px] items-center">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-4)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trends, competitors, keywords, topics..."
                className="h-10 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] pl-10 pr-4 text-xs text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-blue-500 focus:outline-none transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-4)] hover:text-[var(--fg)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-10 items-center gap-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs font-semibold text-[var(--fg-2)]">
                <Radio className="h-3.5 w-3.5 text-blue-400" />
                <span>Last 7 days</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t lg:border-t-0 lg:border-l border-[var(--stroke)] pt-3 lg:pt-0 lg:pl-4">
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-[var(--fg-4)]">
                Intelligence Coverage
              </p>
              <p className="mt-0.5 text-sm font-bold text-[var(--fg)]">
                {connectedPlatforms.length || 0} Platforms Active
              </p>
              <div className="mt-1.5 flex gap-1.5 flex-wrap">
                {connectedPlatforms.slice(0, 5).map((account) => (
                  <div
                    key={account.id}
                    title={platformName(account.platform)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-blue-400"
                  >
                    <PlatformIcon platform={account.platform} />
                  </div>
                ))}
                {!connectedPlatforms.length && (
                  <span className="text-[11px] text-[var(--fg-4)]">
                    Connect accounts to enrich discovery.
                  </span>
                )}
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <Globe2 className="h-5 w-5" />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* =========================================================
          NAVIGATION TABS
      ========================================================= */}
      <div className="overflow-x-auto border-b border-[var(--stroke)]">
        <div className="flex min-w-max items-center gap-6 pb-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-3 pt-1 text-xs font-semibold transition-all ${
                  active ? "text-blue-400" : "text-[var(--fg-4)] hover:text-[var(--fg)]"
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          TOP GRID: TRENDING TOPICS & CONTENT OPPORTUNITIES
      ========================================================= */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* TRENDING TOPICS */}
        <GlassCard className="p-5">
          <SectionHeader icon={Flame} title="Trending Topics & Themes" />

          <div className="divide-y divide-[var(--stroke)]/60">
            {filteredTopics.map((topic, index) => (
              <button
                key={topic.name}
                onClick={() => setSelectedTopic(topic.name)}
                className="group flex w-full items-center gap-3 py-3 text-left transition hover:bg-[var(--panel-fill-2)] rounded-xl px-2.5"
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    index === 0
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-[var(--panel-fill-2)] text-[var(--fg-3)] border border-[var(--stroke)]"
                  }`}
                >
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[var(--fg)] group-hover:text-blue-400 transition-colors">
                    {topic.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--fg-4)]">
                    {topic.category} • {topic.mentions || 100}+ signals
                  </p>
                </div>

                <span className="text-xs font-bold text-emerald-400">
                  +{topic.growth}%
                </span>

                <Sparkline value={topic.growth} />

                <ChevronRight className="h-4 w-4 text-[var(--fg-4)] transition group-hover:translate-x-0.5 group-hover:text-blue-400" />
              </button>
            ))}

            {!filteredTopics.length && (
              <div className="py-10 text-center text-xs text-[var(--fg-4)]">
                No topics match your query.
              </div>
            )}
          </div>
        </GlassCard>

        {/* CONTENT OPPORTUNITIES */}
        <GlassCard className="p-5">
          <SectionHeader icon={Lightbulb} title="High-Potential Content Angles" />

          <div className="divide-y divide-[var(--stroke)]/60">
            {discovery.opportunities.map((item: DiscoveryOpportunity) => {
              const Icon =
                item.iconName === "bot"
                  ? Bot
                  : item.iconName === "eye"
                  ? Eye
                  : item.iconName === "users"
                  ? Users
                  : item.iconName === "zap"
                  ? Zap
                  : TrendingUp;

              return (
                <Link
                  href="/dashboard/create"
                  key={item.title}
                  className="group flex items-center gap-3 py-3 transition hover:bg-[var(--panel-fill-2)] rounded-xl px-2.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[var(--fg)] group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </p>
                    <div className="mt-1 flex gap-1.5">
                      <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-500/20">
                        {item.category}
                      </span>
                      <span className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-400 border border-blue-500/20">
                        {item.secondary}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-400">
                    {item.growth}
                  </span>

                  <ChevronRight className="h-4 w-4 text-[var(--fg-4)] transition group-hover:translate-x-0.5 group-hover:text-blue-400" />
                </Link>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* =========================================================
          SECOND GRID: COMPETITORS & SOCIAL LISTENING
      ========================================================= */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* COMPETITOR INTELLIGENCE */}
        <GlassCard className="p-5">
          <SectionHeader icon={Target} title="Competitor Velocity & Benchmarks" />

          <div className="grid grid-cols-[1.4fr_0.7fr_0.8fr_0.7fr] border-b border-[var(--stroke)] px-2 pb-2 text-[10px] uppercase font-bold tracking-wider text-[var(--fg-4)]">
            <span>Competitor</span>
            <span>New Posts</span>
            <span>Engagement</span>
            <span>Growth</span>
          </div>

          <div className="divide-y divide-[var(--stroke)]/60">
            {discovery.competitors.map((competitor: DiscoveryCompetitor) => (
              <div
                key={competitor.name}
                className="grid grid-cols-[1.4fr_0.7fr_0.8fr_0.7fr] items-center px-2 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[11px] font-bold text-[var(--fg-2)]">
                    {competitor.logo}
                  </div>
                  <span className="text-xs font-semibold text-[var(--fg)]">
                    {competitor.name}
                  </span>
                </div>

                <span className="text-xs text-[var(--fg-3)]">
                  {competitor.content}
                </span>

                <span className="text-xs text-[var(--fg-3)]">
                  {competitor.engagement}
                </span>

                <span className="text-xs font-bold text-emerald-400">
                  {competitor.growth}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* SOCIAL LISTENING */}
        <GlassCard className="p-5">
          <SectionHeader icon={MessageCircle} title="Social Listening & Sentiment" />

          <div className="mb-4 flex rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-1">
            {(["mentions", "conversations", "sentiment"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setListeningTab(tab)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition-all ${
                  listeningTab === tab
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-[var(--fg-4)] hover:text-[var(--fg)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-5 items-center">
            <div>
              <p className="text-2xl font-bold tracking-tight text-[var(--fg)]">
                {fmt(Math.max(totalEngagement, 2840))}
              </p>
              <p className="text-xs text-[var(--fg-4)]">Tracked interactions</p>

              <div className="mt-2.5 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">+23%</span>
                <span className="text-xs text-[var(--fg-4)]">vs. previous period</span>
              </div>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10">
              <div className="text-base font-bold text-blue-400">
                {discovery.listeningScore}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <MiniBar
              label="Positive Sentiment"
              value={discovery.sentiment.positive}
              color="#10b981"
            />
            <MiniBar
              label="Neutral Sentiment"
              value={discovery.sentiment.neutral}
              color="#3b82f6"
            />
            <MiniBar
              label="Negative Sentiment"
              value={discovery.sentiment.negative}
              color="#f43f5e"
            />
          </div>
        </GlassCard>
      </div>

      {/* =========================================================
          RECENT POST SIGNALS & AI RECOMMENDATIONS
      ========================================================= */}
      <GlassCard className="p-5">
        <SectionHeader icon={BarChart3} title="Recent Publishing Signals" action="View analytics" />

        {latestPosts.length > 0 ? (
          <div className="grid gap-2">
            {latestPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-[var(--stroke)] hover:bg-[var(--panel-fill-2)]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  <PlatformIcon platform={post.platform} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[var(--fg)]">
                    {post.content || "Untitled post"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--fg-4)]">
                    {platformName(post.platform)}
                  </p>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-[10px] text-[var(--fg-4)]">Impressions</p>
                  <p className="text-xs font-bold text-[var(--fg)]">
                    {fmt(Number(post.impressions || 0))}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-[var(--fg-4)]">Engagements</p>
                  <p className="text-xs font-bold text-emerald-400">
                    {fmt(Number(post.engagement || 0))}
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-[var(--fg-4)]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-[var(--stroke)] py-8 text-center bg-[var(--panel-fill-2)]/30">
            <BarChart3 className="mx-auto h-6 w-6 text-[var(--fg-4)]" />
            <p className="mt-2 text-xs font-semibold text-[var(--fg-2)]">
              Not enough content published yet
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--fg-4)]">
              Publish posts to automatically extract first-party engagement signals.
            </p>
          </div>
        )}
      </GlassCard>

      {/* =========================================================
          AI RECOMMENDATIONS
      ========================================================= */}
      <GlassCard className="p-5">
        <SectionHeader icon={Sparkles} title="AI Action Recommendations" action="" />

        <div className="grid gap-4 lg:grid-cols-3">
          {discovery.recommendations.map((recommendation, index) => (
            <div
              key={recommendation.title}
              className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
                    {index === 0 ? (
                      <Bot className="h-4 w-4" />
                    ) : index === 1 ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                  </div>

                  <button className="text-[var(--fg-4)] hover:text-[var(--fg)]">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="mt-3.5 text-xs font-bold text-[var(--fg)]">
                  {recommendation.title}
                </h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--fg-3)]">
                  {recommendation.description}
                </p>
              </div>

              <Link
                href="/dashboard/create"
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-3 py-2 text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                {recommendation.action}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* =========================================================
          SELECTED TOPIC DRAWER-LIKE PANEL
      ========================================================= */}
      {selectedTopic && (
        <div className="fixed inset-x-0 bottom-5 z-50 mx-auto w-[calc(100%-32px)] max-w-[540px]">
          <div className="rounded-3xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
                <TrendingUp className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[var(--fg)]">{selectedTopic}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--fg-3)]">
                  This topic is exhibiting high engagement velocity. Use it as an anchor for social posts, ad creatives, or strategy pillars.
                </p>
              </div>

              <button
                onClick={() => setSelectedTopic(null)}
                className="rounded-xl p-1 text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--panel-fill-2)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex gap-2.5">
              <Link
                href="/dashboard/create"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-4 py-2.5 text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all"
              >
                Create Content from Topic
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => setSelectedTopic(null)}
                className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-2.5 text-xs font-medium text-[var(--fg-3)] hover:text-[var(--fg)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
