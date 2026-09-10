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
    <div className="mx-auto w-full max-w-[1400px] px-1 pb-14 text-white">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <header className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-5 items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-pink-400">
              <Sparkles className="h-3 w-3 text-pink-400" />
              <span>Growth Blueprint</span>
            </div>
            <span className="text-[11px] text-zinc-500">·</span>
            <span className="text-[11px] font-medium text-zinc-400">
              Strategy Center
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
            Growth Strategy
          </h1>

          <p className="mt-1 max-w-2xl text-[13px] leading-5 text-zinc-400">
            Set strategic goals, structure content pillars, prioritize high-return channels, and let Koraspace generate a 30 / 60 / 90 day growth roadmap.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-[12px] font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <WandSparkles className="h-4 w-4" />
          )}
          {generating ? "Generating Plan..." : "Generate with AI"}
        </button>
      </header>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}
      <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <SummaryCard
          icon={Target}
          label="Business Goal"
          value={strategy?.businessGoal || "Increase revenue"}
          detail="Primary objective"
          accent="pink"
        />

        <SummaryCard
          icon={TrendingUp}
          label="Target Growth"
          value={`${strategy?.targetGrowth || 40}%`}
          detail="Target conversion lift"
          accent="blue"
        />

        <SummaryCard
          icon={Users}
          label="Main KPI"
          value={strategy?.mainKpi || "New leads"}
          detail={`${formatNumber(context.metrics.conversions)} portfolio conversions`}
          accent="blue"
        />

        <SummaryCard
          icon={CalendarDays}
          label="Timeframe"
          value={`${strategy?.timeframe || "90"} Days`}
          detail="30 / 60 / 90 Roadmap"
          accent="purple"
        />
      </div>

      {/* =====================================================
          NAVIGATION TABS
      ===================================================== */}
      <div className="mb-5 overflow-x-auto border-b border-white/[0.08]">
        <div className="flex min-w-max gap-6">
          <StrategyTab
            label="Growth Plan (30/60/90)"
            active={activeTab === "growth"}
            onClick={() => setActiveTab("growth")}
          />
          <StrategyTab
            label="Content Strategy & Pillars"
            active={activeTab === "content"}
            onClick={() => setActiveTab("content")}
          />
          <StrategyTab
            label="Platform Priorities"
            active={activeTab === "platform"}
            onClick={() => setActiveTab("platform")}
          />
          <StrategyTab
            label="Target Audience"
            active={activeTab === "audience"}
            onClick={() => setActiveTab("audience")}
          />
          <StrategyTab
            label="Growth Experiments"
            active={activeTab === "experiments"}
            onClick={() => setActiveTab("experiments")}
          />
        </div>
      </div>

      {/* =====================================================
          TAB CONTENT
      ===================================================== */}
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

      {/* =====================================================
          AI GROWTH AGENT FOOTER PANEL
      ===================================================== */}
      <section className="mt-6 rounded-xl border border-white/[0.08] bg-[#14171d] shadow-sm overflow-hidden">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-pink-500/30 bg-pink-500/10 text-pink-400">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-zinc-100">
                AI Growth Strategy Agent
              </h2>
              <p className="mt-0.5 max-w-2xl text-[12px] leading-relaxed text-zinc-400">
                Generates a personalized strategy using your business goals, campaign ROI, audience engagement patterns, and connected platform metrics.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-[12px] font-semibold text-white transition hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {generating ? "Generating..." : "Regenerate Strategy"}
          </button>
        </div>

        <div className="grid border-t border-white/[0.06] sm:grid-cols-4">
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
      </section>
    </div>
  );
}

/* ===============================================================
   SUMMARY CARD
=============================================================== */

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  detail: string;
  accent: "blue" | "pink" | "purple";
}) {
  const accentStyles = {
    pink: "border-pink-500/20 bg-pink-500/10 text-pink-400",
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#14171d] p-4 transition hover:border-zinc-700">
      <div className="mb-3 flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${accentStyles[accent]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[11px] font-medium text-zinc-400">{label}</span>
      </div>

      <p className="truncate text-[18px] font-bold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-[10px] text-zinc-500">{detail}</p>
    </div>
  );
}

/* ===============================================================
   TABS
=============================================================== */

function StrategyTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative pb-3 text-[12px] font-semibold transition ${
        active
          ? "text-blue-400"
          : "text-zinc-400 hover:text-zinc-200"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-blue-500" />
      )}
    </button>
  );
}

/* ===============================================================
   GROWTH PLAN
=============================================================== */

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
    <section className="rounded-xl border border-white/[0.08] bg-[#14171d] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold text-zinc-100">
            30 / 60 / 90 Day Strategic Roadmap
          </h2>
          <p className="mt-0.5 text-[12px] text-zinc-400">
            Phased execution plan moving from foundation to acceleration and scale.
          </p>
        </div>

        <span className="text-[11px] font-semibold text-blue-400">
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

      <div className="border-t border-white/[0.06] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-zinc-200">
              {selectedPhase} Day Priority Deliverables
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              Click to toggle completion status.
            </p>
          </div>

          <span className="rounded-full border border-white/[0.08] bg-[#0f1115] px-2.5 py-1 text-[10px] font-semibold text-zinc-400">
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
                className={`group flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition ${
                  isCompleted
                    ? "border-emerald-500/20 bg-emerald-500/[0.03]"
                    : "border-white/[0.06] bg-[#0f1115] hover:border-zinc-700 hover:bg-[#12151b]"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                    isCompleted
                      ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                      : "border-white/[0.1] bg-zinc-800 text-zinc-500 group-hover:text-zinc-300"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[12px] font-semibold ${
                      isCompleted ? "text-zinc-400 line-through" : "text-zinc-200"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
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
      className={`text-left rounded-xl border p-4 transition-all ${
        active
          ? "border-blue-500 bg-[#12161f] shadow-md shadow-blue-500/5"
          : "border-white/[0.06] bg-[#0f1115] hover:border-zinc-700"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[11px] font-bold ${styles[color].badge}`}
        >
          {phase}d
        </div>

        <div>
          <p className="text-[12px] font-bold text-zinc-200">{phase} Days Focus</p>
          <p className="text-[10px] text-zinc-500">{label}</p>
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
                className={`h-3.5 w-3.5 shrink-0 ${
                  isDone ? "text-emerald-400" : "text-zinc-600"
                }`}
              />
              <span
                className={`truncate text-[10px] ${
                  isDone ? "text-zinc-500 line-through" : "text-zinc-300"
                }`}
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
              className="rounded-lg border border-white/[0.06] bg-[#0f1115] p-3.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-pink-500/20 bg-pink-500/10 text-pink-400">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[12px] font-semibold text-zinc-200">
                    {pillar.name}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-blue-400">
                  {pillar.percentage}%
                </span>
              </div>

              <p className="mt-2 pl-9 text-[11px] leading-relaxed text-zinc-400">
                {pillar.description}
              </p>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-blue-500"
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
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#0f1115] p-3.5"
            >
              <div className="flex items-center gap-3">
                <PlatformIcon platform={item.platform} />
                <span className="text-[12px] font-medium text-zinc-200">
                  {item.platform}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-zinc-800 sm:block">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${Math.min(item.postsPerWeek * 20, 100)}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-zinc-300">
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
            className="rounded-xl border border-white/[0.06] bg-[#0f1115] p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <PlatformIcon platform={platform.platform} />
                <div>
                  <p className="text-[13px] font-semibold text-zinc-200">
                    {platform.platform}
                  </p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">
                    {platform.postsPerWeek} posts / week target
                  </p>
                </div>
              </div>

              <PriorityBadge priority={platform.priority} />
            </div>

            <p className="mt-3.5 text-[11px] leading-relaxed text-zinc-400">
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
              className="rounded-lg border border-white/[0.06] bg-[#0f1115] p-4"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <Users className="h-4 w-4" />
              </div>
              <p className="text-[12px] font-semibold text-zinc-200">{item}</p>
              <p className="mt-1 text-[10px] text-zinc-500">Segment {index + 1}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Audience Intelligence Signal"
        subtitle="Data-driven guidance based on portfolio metrics."
      >
        <div className="rounded-xl border border-white/[0.06] bg-[#0f1115] p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <Target className="h-5 w-5" />
          </div>

          <p className="text-[14px] font-semibold text-zinc-100">
            Focus on Problem-Aware Prospects
          </p>

          <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
            Structure top-of-funnel content around immediate problem alleviation. Use educational carousels for discovery, creator endorsements for credibility, and direct-offer retargeting for conversion.
          </p>

          <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-3">
            <Sparkles className="h-3.5 w-3.5 text-pink-400" />
            <span className="text-[11px] font-medium text-zinc-300">
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
            className="rounded-xl border border-white/[0.06] bg-[#0f1115] p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <ExperimentStatus status={experiment.status} />
              </div>

              <h3 className="mt-3.5 text-[13px] font-semibold text-zinc-200">
                {experiment.title}
              </h3>

              <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
                {experiment.description}
              </p>
            </div>

            <div className="mt-4 border-t border-white/[0.06] pt-3">
              <p className="text-[9px] uppercase tracking-wider font-semibold text-zinc-500">
                Expected Impact
              </p>
              <p className="mt-0.5 text-[12px] font-bold text-emerald-400">
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
    <section className="rounded-xl border border-white/[0.08] bg-[#14171d] shadow-sm overflow-hidden">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-zinc-100">{title}</h2>
        <p className="mt-0.5 text-[12px] text-zinc-400">{subtitle}</p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

/* ===============================================================
   PLATFORM ICON
=============================================================== */

function PlatformIcon({ platform }: { platform: string }) {
  const norm = platform.toLowerCase();

  if (norm.includes("instagram")) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-pink-500/30 bg-pink-500/10 text-pink-400">
        <Camera className="h-4 w-4" />
      </div>
    );
  }

  if (norm.includes("linkedin")) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
        <Building2 className="h-4 w-4" />
      </div>
    );
  }

  if (norm.includes("youtube")) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400">
        <Play className="h-4 w-4" />
      </div>
    );
  }

  if (norm === "x" || norm.includes("twitter")) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200">
        <AtSign className="h-4 w-4" />
      </div>
    );
  }

  if (norm.includes("tiktok")) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
        <Zap className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400">
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
    low: "border-zinc-700 bg-zinc-800 text-zinc-400",
  };

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${classes[priority]}`}
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
    planned: "border-zinc-700 bg-zinc-800 text-zinc-400",
    in_progress: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    winning: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    paused: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  };

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${classes[status]}`}
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
      className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3 text-left transition hover:bg-white/[0.03] sm:border-b-0 sm:border-r last:border-r-0"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-800 text-zinc-400">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-[11px] font-medium text-zinc-300">{label}</span>
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
