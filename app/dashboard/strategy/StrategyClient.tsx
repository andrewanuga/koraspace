"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Target,
  TrendingUp,
  Users,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Plus,
  Pencil,
  X,
  BarChart3,
  Lightbulb,
  FlaskConical,
  ArrowUpRight,
  WandSparkles,
  Clock3,
  RefreshCw,
  Layers,
  Camera,
  Play,
  AtSign,
  Building2,
  Check,
  Zap,
} from "lucide-react";

import { GlassCard, PageHeader, StatTile, Pill } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";
import type {
  Strategy,
  StrategyContext,
  StrategyPlanItem,
  ContentPillar,
  PostingFrequency,
  PlatformStrategy as PlatformStrategyType,
  GrowthExperiment,
} from "@/lib/marketer/strategy";

type Tab = "growth" | "content" | "platform" | "audience" | "experiments";

export function StrategyClient({
  initialContext,
}: {
  initialContext: StrategyContext;
}) {
  const [context, setContext] = useState<StrategyContext>(initialContext);
  const [activeTab, setActiveTab] = useState<Tab>("growth");
  const [generating, setGenerating] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<30 | 60 | 90>(30);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const strategy = context.strategy;

  const toggleItemCompleted = (itemId: string, defaultCompleted: boolean) => {
    setCompletedMap((prev) => ({
      ...prev,
      [itemId]: prev[itemId] !== undefined ? !prev[itemId] : !defaultCompleted,
    }));
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);

      const response = await fetch("/api/marketer/strategy/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: context.workspaceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate strategy.");
      }

      setContext((current) => ({
        ...current,
        strategy: data.strategy,
        metrics: data.metrics || current.metrics,
        platforms: data.platforms || current.platforms,
      }));

      setActiveTab("growth");
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to generate strategy."
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1440px] space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        eyebrow="Growth Blueprint · Strategy Center"
        title="Growth Strategy"
        sub="Set strategic goals, structure content pillars, prioritize high-return channels, and let Koraspace generate a 30 / 60 / 90 day growth roadmap."
        actions={
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {generating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <WandSparkles className="h-4 w-4" />
            )}
            {generating ? "Generating Plan..." : "Generate with AI"}
          </button>
        }
      />

      {/* SUMMARY STAT TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          icon={Target}
          label="Business Goal"
          value={strategy?.businessGoal || "Increase revenue"}
          tone="pink"
          footer={<span className="text-[11px] text-[var(--fg-4)]">Primary objective</span>}
        />

        <StatTile
          icon={TrendingUp}
          label="Target Growth"
          value={`${strategy?.targetGrowth || 40}%`}
          tone="blue"
          footer={<span className="text-[11px] text-emerald-400 font-medium">Target conversion lift</span>}
        />

        <StatTile
          icon={Users}
          label="Main KPI"
          value={strategy?.mainKpi || "New leads"}
          tone="indigo"
          footer={<span className="text-[11px] text-[var(--fg-4)]">{formatNumber(context.metrics.conversions)} portfolio conversions</span>}
        />

        <StatTile
          icon={CalendarDays}
          label="Timeframe"
          value={`${strategy?.timeframe || "90"} Days`}
          tone="warning"
          footer={<span className="text-[11px] text-[var(--fg-4)]">30 / 60 / 90 Roadmap</span>}
        />
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-[var(--stroke)] pb-3 overflow-x-auto">
        {[
          { key: "growth", label: "Growth Plan (30/60/90)" },
          { key: "content", label: "Content Strategy & Pillars" },
          { key: "platform", label: "Platform Priorities" },
          { key: "audience", label: "Target Audience" },
          { key: "experiments", label: "Growth Experiments" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as Tab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
              activeTab === tab.key
                ? "bg-blue-600/15 border border-blue-500/30 text-blue-400"
                : "text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "growth" && (
        <GrowthPlan
          strategy={strategy}
          selectedPhase={selectedPhase}
          setSelectedPhase={setSelectedPhase}
          completedMap={completedMap}
          onToggleItem={toggleItemCompleted}
        />
      )}

      {activeTab === "content" && (
        <ContentStrategy strategy={strategy} />
      )}

      {activeTab === "platform" && (
        <PlatformStrategyView strategy={strategy} />
      )}

      {activeTab === "audience" && (
        <AudienceStrategy strategy={strategy} />
      )}

      {activeTab === "experiments" && (
        <Experiments strategy={strategy} />
      )}

      {/* AI GROWTH AGENT FOOTER PANEL */}
      <GlassCard className="mt-6 overflow-hidden" padding="none">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-[var(--fg)]">
                AI Growth Strategy Agent
              </h2>
              <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-[var(--fg-4)]">
                Generates a personalized strategy using your business goals, campaign ROI, audience engagement patterns, and connected platform metrics.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {generating ? "Generating..." : "Regenerate Strategy"}
          </button>
        </div>

        <div className="grid border-t border-[var(--stroke)] sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--stroke)]">
          <AgentAction
            icon={BarChart3}
            label="Analyze campaign ROAS"
            onClick={handleGenerate}
          />
          <AgentAction
            icon={Lightbulb}
            label="Discover channel opportunities"
            onClick={handleGenerate}
          />
          <AgentAction
            icon={CalendarDays}
            label="Update 30/60/90 roadmap"
            onClick={handleGenerate}
          />
          <AgentAction
            icon={WandSparkles}
            label="Suggest growth experiments"
            onClick={handleGenerate}
          />
        </div>
      </GlassCard>
    </main>
  );
}

/* ===============================================================
   GROWTH PLAN
============================================================== */

function GrowthPlan({
  strategy,
  selectedPhase,
  setSelectedPhase,
  completedMap,
  onToggleItem,
}: {
  strategy: Strategy | null;
  selectedPhase: 30 | 60 | 90;
  setSelectedPhase: (value: 30 | 60 | 90) => void;
  completedMap: Record<string, boolean>;
  onToggleItem: (id: string, defaultCompleted: boolean) => void;
}) {
  const plan =
    selectedPhase === 30
      ? strategy?.plan30 || []
      : selectedPhase === 60
      ? strategy?.plan60 || []
      : strategy?.plan90 || [];

  return (
    <GlassCard className="overflow-hidden" padding="none">
      <div className="flex items-center justify-between border-b border-[var(--stroke)] px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--fg)]">
            30 / 60 / 90 Day Strategic Roadmap
          </h2>
          <p className="mt-0.5 text-xs text-[var(--fg-4)]">
            Phased execution plan moving from foundation to acceleration and scale.
          </p>
        </div>

        <span className="text-xs font-semibold text-blue-400">
          Phased Execution
        </span>
      </div>

      <div className="grid gap-3.5 p-5 md:grid-cols-3">
        <PhaseCard
          phase={30}
          label="Foundation"
          color="pink"
          active={selectedPhase === 30}
          onClick={() => setSelectedPhase(30)}
          items={strategy?.plan30 || []}
          completedMap={completedMap}
        />

        <PhaseCard
          phase={60}
          label="Acceleration"
          color="blue"
          active={selectedPhase === 60}
          onClick={() => setSelectedPhase(60)}
          items={strategy?.plan60 || []}
          completedMap={completedMap}
        />

        <PhaseCard
          phase={90}
          label="Expansion"
          color="green"
          active={selectedPhase === 90}
          onClick={() => setSelectedPhase(90)}
          items={strategy?.plan90 || []}
          completedMap={completedMap}
        />
      </div>

      <div className="border-t border-[var(--stroke)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--fg)]">
              {selectedPhase} Day Priority Deliverables
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--fg-4)]">
              Click to toggle completion status.
            </p>
          </div>

          <span className="rounded-full border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2.5 py-1 text-[10px] font-semibold text-[var(--fg-3)]">
            {plan.length} focus items
          </span>
        </div>

        <div className="grid gap-2.5 md:grid-cols-2">
          {plan.map((item) => {
            const isCompleted =
              completedMap[item.id] !== undefined
                ? completedMap[item.id]
                : item.completed;

            return (
              <div
                key={item.id}
                onClick={() => onToggleItem(item.id, item.completed)}
                className={cn(
                  "group flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition",
                  isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                    : "border-[var(--stroke)] bg-[var(--panel-fill-2)] hover:border-[var(--stroke-strong)] hover:bg-[var(--hover)]"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition",
                    isCompleted
                      ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                      : "border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-4)] group-hover:text-[var(--fg)]"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      isCompleted ? "text-[var(--fg-4)] line-through" : "text-[var(--fg)]"
                    )}
                  >
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--fg-3)]">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

/* ===============================================================
   PHASE CARD
=============================================================== */

function PhaseCard({
  phase,
  label,
  color,
  active,
  onClick,
  items,
  completedMap,
}: {
  phase: 30 | 60 | 90;
  label: string;
  color: "pink" | "blue" | "green";
  active: boolean;
  onClick: () => void;
  items: StrategyPlanItem[];
  completedMap: Record<string, boolean>;
}) {
  const styles = {
    pink: {
      badge: "border-pink-500/30 bg-pink-500/10 text-pink-400",
    },
    blue: {
      badge: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    },
    green: {
      badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-xl border p-4 transition-all cursor-pointer",
        active
          ? "border-blue-500 bg-blue-600/10 shadow-md shadow-blue-500/10"
          : "border-[var(--stroke)] bg-[var(--panel-fill-2)] hover:border-[var(--stroke-strong)]"
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl border text-[11px] font-bold",
            styles[color].badge
          )}
        >
          {phase}d
        </div>

        <div>
          <p className="text-xs font-bold text-[var(--fg)]">{phase} Days Focus</p>
          <p className="text-[10px] text-[var(--fg-4)]">{label}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.slice(0, 4).map((item) => {
          const isDone =
            completedMap[item.id] !== undefined
              ? completedMap[item.id]
              : item.completed;

          return (
            <div key={item.id} className="flex items-center gap-2">
              <CheckCircle2
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  isDone ? "text-emerald-400" : "text-[var(--fg-4)] opacity-50"
                )}
              />
              <span
                className={cn(
                  "truncate text-[10px]",
                  isDone ? "text-[var(--fg-4)] line-through" : "text-[var(--fg-3)]"
                )}
              >
                {item.title}
              </span>
            </div>
          );
        })}
      </div>
    </button>
  );
}

/* ===============================================================
   CONTENT STRATEGY
=============================================================== */

function ContentStrategy({
  strategy,
}: {
  strategy: Strategy | null;
}) {
  const pillars = strategy?.contentPillars || [];
  const frequency = strategy?.postingFrequency || [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel
        title="Content Pillars"
        subtitle="Strategic themes driving your organic & paid mix."
      >
        <div className="space-y-3">
          {pillars.map((pillar: ContentPillar) => (
            <div
              key={pillar.id}
              className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--fg)]">
                    {pillar.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-blue-400">
                  {pillar.percentage}%
                </span>
              </div>

              <p className="mt-2 pl-9 text-[11px] leading-relaxed text-[var(--fg-4)]">
                {pillar.description}
              </p>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--panel-fill)] border border-[var(--stroke)]">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${pillar.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Posting Frequency"
        subtitle="Recommended weekly publishing cadence across channels."
      >
        <div className="space-y-2.5">
          {frequency.map((item: PostingFrequency) => (
            <div
              key={item.platform}
              className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3.5"
            >
              <div className="flex items-center gap-3">
                <PlatformIcon platform={item.platform} />
                <span className="text-xs font-medium text-[var(--fg)]">
                  {item.platform}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-[var(--panel-fill)] border border-[var(--stroke)] sm:block">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${Math.min(item.postsPerWeek * 20, 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-[var(--fg-3)]">
                  {item.postsPerWeek} posts/week
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ===============================================================
   PLATFORM STRATEGY VIEW
=============================================================== */

function PlatformStrategyView({
  strategy,
}: {
  strategy: Strategy | null;
}) {
  const platforms = strategy?.platformStrategy || [];

  return (
    <Panel
      title="Platform Allocation Strategy"
      subtitle="Where marketing resources & creative testing should be concentrated."
    >
      <div className="grid gap-3.5 md:grid-cols-2">
        {platforms.map((platform: PlatformStrategyType) => (
          <div
            key={platform.platform}
            className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <PlatformIcon platform={platform.platform} />
                <div>
                  <p className="text-xs font-semibold text-[var(--fg)]">
                    {platform.platform}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--fg-4)]">
                    {platform.postsPerWeek} posts / week target
                  </p>
                </div>
              </div>

              <PriorityBadge priority={platform.priority} />
            </div>

            <p className="mt-3.5 text-[11px] leading-relaxed text-[var(--fg-3)]">
              {platform.reason}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ===============================================================
   AUDIENCE
=============================================================== */

function AudienceStrategy({
  strategy,
}: {
  strategy: Strategy | null;
}) {
  const audience = strategy?.audience || [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Panel
        title="Priority Audience Segments"
        subtitle="High-converting cohorts targeted by this strategic plan."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {audience.map((item: string, index: number) => (
            <div
              key={index}
              className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Users className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-[var(--fg)]">{item}</p>
              <p className="mt-1 text-[10px] text-[var(--fg-4)]">Segment {index + 1}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Audience Intelligence Signal"
        subtitle="Data-driven guidance based on portfolio metrics."
      >
        <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Target className="h-5 w-5" />
          </div>

          <p className="text-sm font-semibold text-[var(--fg)]">
            Focus on Problem-Aware Prospects
          </p>

          <p className="mt-2 text-[11px] leading-relaxed text-[var(--fg-3)]">
            Structure top-of-funnel content around immediate problem alleviation. Use educational carousels for discovery, creator endorsements for credibility, and direct-offer retargeting for conversion.
          </p>

          <div className="mt-4 flex items-center gap-2 border-t border-[var(--stroke)] pt-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[11px] font-medium text-[var(--fg-4)]">
              Generated from multi-channel conversion data
            </span>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ===============================================================
   EXPERIMENTS
=============================================================== */

function Experiments({
  strategy,
}: {
  strategy: Strategy | null;
}) {
  const experiments = strategy?.growthExperiments || [];

  return (
    <Panel
      title="Growth Experiments"
      subtitle="Controlled hypothesis testing to unlock scalable organic & paid traction."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {experiments.map((experiment: GrowthExperiment) => (
          <div
            key={experiment.id}
            className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <ExperimentStatus status={experiment.status} />
              </div>

              <h3 className="mt-3.5 text-xs font-semibold text-[var(--fg)]">
                {experiment.title}
              </h3>

              <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--fg-4)]">
                {experiment.description}
              </p>
            </div>

            <div className="mt-4 border-t border-[var(--stroke)] pt-3">
              <p className="text-[9px] uppercase tracking-wider font-semibold text-[var(--fg-4)]">
                Expected Impact
              </p>
              <p className="mt-0.5 text-xs font-bold text-emerald-400">
                {experiment.expectedImpact}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ===============================================================
   PANEL CONTAINER
=============================================================== */

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <GlassCard className="overflow-hidden" padding="none">
      <div className="border-b border-[var(--stroke)] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[var(--fg)]">{title}</h2>
        <p className="mt-0.5 text-xs text-[var(--fg-4)]">{subtitle}</p>
      </div>
      <div className="p-5">{children}</div>
    </GlassCard>
  );
}

/* ===============================================================
   PLATFORM ICON
=============================================================== */

function PlatformIcon({ platform }: { platform: string }) {
  const norm = platform.toLowerCase();

  if (norm.includes("instagram")) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-pink-500/30 bg-pink-500/10 text-pink-400">
        <Camera className="h-4 w-4" />
      </div>
    );
  }

  if (norm.includes("linkedin")) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
        <Building2 className="h-4 w-4" />
      </div>
    );
  }

  if (norm.includes("youtube")) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
        <Play className="h-4 w-4" />
      </div>
    );
  }

  if (norm === "x" || norm.includes("twitter")) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg)]">
        <AtSign className="h-4 w-4" />
      </div>
    );
  }

  if (norm.includes("tiktok")) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
        <Zap className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-4)]">
      <Layers className="h-4 w-4" />
    </div>
  );
}

/* ===============================================================
   PRIORITY BADGE
=============================================================== */

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const classes = {
    high: "border-pink-500/30 bg-pink-500/10 text-pink-400",
    medium: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    low: "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-4)]",
  };

  return (
    <span
      className={cn("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", classes[priority])}
    >
      {priority} priority
    </span>
  );
}

/* ===============================================================
   EXPERIMENT STATUS
=============================================================== */

function ExperimentStatus({
  status,
}: {
  status: "planned" | "in_progress" | "winning" | "paused";
}) {
  const labels = {
    planned: "Planned",
    in_progress: "In Progress",
    winning: "Winning",
    paused: "Paused",
  };

  const classes = {
    planned: "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-4)]",
    in_progress: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    winning: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    paused: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  };

  return (
    <span
      className={cn("rounded-full border px-2 py-0.5 text-[9px] font-bold", classes[status])}
    >
      {labels[status]}
    </span>
  );
}

/* ===============================================================
   AGENT ACTION
=============================================================== */

function AgentAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 p-4 text-left transition hover:bg-[var(--hover)] cursor-pointer"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-blue-400">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-xs font-medium text-[var(--fg-2)]">{label}</span>
    </button>
  );
}

/* ===============================================================
   HELPERS
=============================================================== */

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}
