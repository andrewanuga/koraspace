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
} from "lucide-react";

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

const BRAND_BLUE = "#2F80FF";
const BRAND_PINK = "#FF0A8A";

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
        stroke={positive ? BRAND_BLUE : "#64748B"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="105"
        cy={positive ? "6" : "32"}
        r="2.5"
        fill={positive ? BRAND_BLUE : "#64748B"}
      />
    </svg>
  );
}

function MiniBar({
  value,
  label,
  color = BRAND_BLUE,
}: {
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-zinc-400">{label}</span>
        <span className="font-semibold text-zinc-200">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#0d1218]">
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
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10"
          style={{ color: BRAND_BLUE }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-[14px] font-semibold text-zinc-100">{title}</h2>
      </div>

      <button className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300">
        {action}
        <ArrowUpRight className="h-3 w-3" />
      </button>
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
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-1 pb-14 text-white">
      {/* =========================================================
          HEADER
      ========================================================= */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-400">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            AI-Powered Intelligence
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
            Discover What&apos;s Next
          </h1>

          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-zinc-400">
            Track rising topics, benchmark competitor velocity, isolate content opportunities, and capitalize on audience signals in real time.
          </p>
        </div>

        <button
          onClick={handleAnalyzeTrends}
          disabled={isAnalyzing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-[12px] font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60"
        >
          {isAnalyzing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isAnalyzing ? "Analyzing Trends..." : "AI Trend Analysis"}
        </button>
      </div>

      {/* =========================================================
          SEARCH / INTELLIGENCE STRIP
      ========================================================= */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-xl border border-white/[0.08] bg-[#14171d] p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex h-10 flex-1 items-center gap-2.5 rounded-lg border border-white/[0.08] bg-[#0e1014] px-3">
              <Search className="h-4 w-4 text-zinc-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trends, competitors, keywords, topics..."
                className="w-full bg-transparent text-[12px] text-zinc-200 outline-none placeholder:text-zinc-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="flex h-10 items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0e1014] px-3 text-[11px] font-semibold text-zinc-300 hover:border-zinc-700">
                <Radio className="h-3.5 w-3.5 text-blue-400" />
                Last 7 days
              </button>
              <button className="flex h-10 items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0e1014] px-3 text-[11px] text-zinc-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#14171d] p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">
              Intelligence Coverage
            </p>
            <p className="mt-1 text-[18px] font-bold text-zinc-100">
              {connectedPlatforms.length || 0} Platforms Active
            </p>
            <div className="mt-2 flex gap-1.5">
              {connectedPlatforms.slice(0, 5).map((account) => (
                <div
                  key={account.id}
                  title={platformName(account.platform)}
                  className="flex h-6 w-6 items-center justify-center rounded border border-white/[0.08] bg-zinc-800 text-blue-400"
                >
                  <PlatformIcon platform={account.platform} />
                </div>
              ))}
              {!connectedPlatforms.length && (
                <span className="text-[11px] text-zinc-500">
                  Connect accounts to enrich discovery.
                </span>
              )}
            </div>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <Globe2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* =========================================================
          NAVIGATION TABS
      ========================================================= */}
      <div className="overflow-x-auto border-b border-white/[0.08]">
        <div className="flex min-w-max items-center gap-7">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-3 pt-1 text-[12px] font-semibold transition ${
                  active ? "text-blue-400" : "text-zinc-400 hover:text-zinc-200"
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
        <section className="rounded-xl border border-white/[0.08] bg-[#14171d] p-5 shadow-sm">
          <SectionHeader icon={Flame} title="Trending Topics & Themes" />

          <div className="divide-y divide-white/[0.04]">
            {filteredTopics.map((topic, index) => (
              <button
                key={topic.name}
                onClick={() => setSelectedTopic(topic.name)}
                className="group flex w-full items-center gap-3 py-3 text-left transition hover:bg-white/[0.02] rounded-lg px-2"
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    index === 0
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-zinc-800 text-zinc-300 border border-white/[0.06]"
                  }`}
                >
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-zinc-200 group-hover:text-white">
                    {topic.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    {topic.category} · {topic.mentions || 100}+ signals
                  </p>
                </div>

                <span className="text-[12px] font-bold text-emerald-400">
                  +{topic.growth}%
                </span>

                <Sparkline value={topic.growth} />

                <ChevronRight className="h-4 w-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-blue-400" />
              </button>
            ))}

            {!filteredTopics.length && (
              <div className="py-10 text-center text-[12px] text-zinc-500">
                No topics match your query.
              </div>
            )}
          </div>
        </section>

        {/* CONTENT OPPORTUNITIES */}
        <section className="rounded-xl border border-white/[0.08] bg-[#14171d] p-5 shadow-sm">
          <SectionHeader icon={Lightbulb} title="High-Potential Content Angles" />

          <div className="divide-y divide-white/[0.04]">
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
                  className="group flex items-center gap-3 py-3 transition hover:bg-white/[0.02] rounded-lg px-2"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-zinc-200 group-hover:text-white">
                      {item.title}
                    </p>
                    <div className="mt-1 flex gap-1.5">
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-500/20">
                        {item.category}
                      </span>
                      <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-blue-400 border border-blue-500/20">
                        {item.secondary}
                      </span>
                    </div>
                  </div>

                  <span className="text-[12px] font-bold text-emerald-400">
                    {item.growth}
                  </span>

                  <ChevronRight className="h-4 w-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-blue-400" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* =========================================================
          SECOND GRID: COMPETITORS & SOCIAL LISTENING
      ========================================================= */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* COMPETITOR INTELLIGENCE */}
        <section className="rounded-xl border border-white/[0.08] bg-[#14171d] p-5 shadow-sm">
          <SectionHeader icon={Target} title="Competitor Velocity & Benchmarks" />

          <div className="grid grid-cols-[1.4fr_0.7fr_0.8fr_0.7fr] border-b border-white/[0.06] px-2 pb-2 text-[10px] uppercase font-semibold tracking-wider text-zinc-500">
            <span>Competitor</span>
            <span>New Posts</span>
            <span>Engagement</span>
            <span>Growth</span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {discovery.competitors.map((competitor: DiscoveryCompetitor) => (
              <div
                key={competitor.name}
                className="grid grid-cols-[1.4fr_0.7fr_0.8fr_0.7fr] items-center px-2 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] bg-zinc-800 text-[11px] font-bold text-zinc-300">
                    {competitor.logo}
                  </div>
                  <span className="text-[12px] font-semibold text-zinc-200">
                    {competitor.name}
                  </span>
                </div>

                <span className="text-[12px] text-zinc-400">
                  {competitor.content}
                </span>

                <span className="text-[12px] text-zinc-400">
                  {competitor.engagement}
                </span>

                <span className="text-[12px] font-bold text-emerald-400">
                  {competitor.growth}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SOCIAL LISTENING */}
        <section className="rounded-xl border border-white/[0.08] bg-[#14171d] p-5 shadow-sm">
          <SectionHeader icon={MessageCircle} title="Social Listening & Sentiment" />

          <div className="mb-4 flex rounded-lg border border-white/[0.08] bg-[#0e1014] p-0.5">
            {(["mentions", "conversations", "sentiment"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setListeningTab(tab)}
                className={`flex-1 rounded-md py-1.5 text-[11px] font-semibold capitalize transition ${
                  listeningTab === tab
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-5 items-center">
            <div>
              <p className="text-[26px] font-bold tracking-tight text-zinc-100">
                {fmt(Math.max(totalEngagement, 2840))}
              </p>
              <p className="text-[11px] text-zinc-500">Tracked interactions</p>

              <div className="mt-2.5 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-400">+23%</span>
                <span className="text-[11px] text-zinc-500">vs. previous period</span>
              </div>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10">
              <div className="text-[14px] font-bold text-blue-400">
                {discovery.listeningScore}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <MiniBar
              label="Positive Sentiment"
              value={discovery.sentiment.positive}
              color="#10B981"
            />
            <MiniBar
              label="Neutral Sentiment"
              value={discovery.sentiment.neutral}
              color="#3B82F6"
            />
            <MiniBar
              label="Negative Sentiment"
              value={discovery.sentiment.negative}
              color="#F43F5E"
            />
          </div>
        </section>
      </div>

      {/* =========================================================
          RECENT POST SIGNALS & AI RECOMMENDATIONS
      ========================================================= */}
      <section className="rounded-xl border border-white/[0.08] bg-[#14171d] p-5 shadow-sm">
        <SectionHeader icon={BarChart3} title="Recent Publishing Signals" action="View analytics" />

        {latestPosts.length > 0 ? (
          <div className="grid gap-2">
            {latestPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition hover:border-white/[0.06] hover:bg-white/[0.02]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  <PlatformIcon platform={post.platform} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-zinc-200">
                    {post.content || "Untitled post"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">
                    {platformName(post.platform)}
                  </p>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-[10px] text-zinc-500">Impressions</p>
                  <p className="text-[12px] font-bold text-zinc-200">
                    {fmt(Number(post.impressions || 0))}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-zinc-500">Engagements</p>
                  <p className="text-[12px] font-bold text-emerald-400">
                    {fmt(Number(post.engagement || 0))}
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-zinc-600" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/[0.08] py-8 text-center">
            <BarChart3 className="mx-auto h-6 w-6 text-zinc-600" />
            <p className="mt-2 text-[13px] font-medium text-zinc-300">
              Not enough content published yet
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              Publish posts to automatically extract first-party engagement signals.
            </p>
          </div>
        )}
      </section>

      {/* =========================================================
          AI RECOMMENDATIONS
      ========================================================= */}
      <section className="rounded-xl border border-white/[0.08] bg-[#14171d] p-5 shadow-sm">
        <SectionHeader icon={Sparkles} title="AI Action Recommendations" />

        <div className="grid gap-3.5 lg:grid-cols-3">
          {discovery.recommendations.map((recommendation, index) => (
            <div
              key={recommendation.title}
              className="rounded-lg border border-white/[0.06] bg-[#0f1115] p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                      index === 1
                        ? "border-pink-500/30 bg-pink-500/10 text-pink-400"
                        : "border-blue-500/30 bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {index === 0 ? (
                      <Bot className="h-4 w-4" />
                    ) : index === 1 ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                  </div>

                  <button className="text-zinc-500 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="mt-3.5 text-[13px] font-semibold text-zinc-200">
                  {recommendation.title}
                </h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
                  {recommendation.description}
                </p>
              </div>

              <Link
                href="/dashboard/create"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-800/80 px-3 py-2 text-[11px] font-semibold text-blue-400 transition hover:bg-zinc-800 hover:text-blue-300"
              >
                {recommendation.action}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          FOOTER INTELLIGENCE STATS
      ========================================================= */}
      <div className="grid gap-3.5 md:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-[#14171d] p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-400" />
            <span className="text-[11px] font-medium text-zinc-400">Content Analyzed</span>
          </div>
          <p className="mt-1 text-[22px] font-bold text-zinc-100">{fmt(posts.length)}</p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#14171d] p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-blue-400" />
            <span className="text-[11px] font-medium text-zinc-400">Topics Detected</span>
          </div>
          <p className="mt-1 text-[22px] font-bold text-zinc-100">{discovery.topics.length}</p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#14171d] p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-400" />
            <span className="text-[11px] font-medium text-zinc-400">Campaign Signals</span>
          </div>
          <p className="mt-1 text-[22px] font-bold text-zinc-100">{fmt(campaigns.length)}</p>
        </div>
      </div>

      {/* =========================================================
          SELECTED TOPIC DRAWER-LIKE PANEL
      ========================================================= */}
      {selectedTopic && (
        <div className="fixed inset-x-0 bottom-5 z-50 mx-auto w-[calc(100%-32px)] max-w-[540px]">
          <div className="rounded-2xl border border-white/[0.1] bg-[#14171d] p-4 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
                <TrendingUp className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white">{selectedTopic}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400">
                  This topic is exhibiting high engagement velocity. Use it as an anchor for social posts, ad creatives, or strategy pillars.
                </p>
              </div>

              <button
                onClick={() => setSelectedTopic(null)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-white/[0.06]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3.5 flex gap-2">
              <Link
                href="/dashboard/create"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-blue-500"
              >
                Create Content from Topic
                <ArrowUpRight className="h-3 w-3" />
              </Link>
              <button
                onClick={() => setSelectedTopic(null)}
                className="rounded-lg border border-white/[0.08] bg-zinc-800 px-4 py-2 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700"
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
