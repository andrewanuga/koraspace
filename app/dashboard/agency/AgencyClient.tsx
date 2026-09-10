"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
  Gauge,
  Inbox,
  Layers3,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

import { fmtNaira } from "@/lib/dashboard/helpers";
import { useWorkspace } from "@/components/dashboard/WorkspaceProvider";
import {
  GlassCard,
  PageHeader,
  StatTile,
  Pill,
} from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

import type {
  MarketerOverview,
  OverviewRange,
  ClientHealth,
  ActivityItem,
  UpcomingItem,
  MarketingOpportunity,
  CampaignPerformance,
} from "@/lib/marketer/types";

interface AgencyClientProps {
  initialOverview: MarketerOverview;
}

type AgentStatus = "active" | "paused";

type ApprovalItem = {
  id: string;
  type: "campaign" | "message" | "optimization" | "content";
  title: string;
  description: string;
  client: string;
  priority: "high" | "medium" | "low";
  action: string;
};

const APPROVALS: ApprovalItem[] = [
  {
    id: "approval-1",
    type: "optimization",
    title: "Increase Spring Product Launch budget",
    description:
      "The campaign is outperforming its ROAS target. The agent recommends increasing daily spend by 18%.",
    client: "Spring Product Launch",
    priority: "high",
    action: "Increase budget",
  },
  {
    id: "approval-2",
    type: "message",
    title: "Approve lead follow-up sequence",
    description:
      "3 high-intent leads are waiting for personalized follow-up messages.",
    client: "Outbound Campaign",
    priority: "high",
    action: "Review messages",
  },
  {
    id: "approval-3",
    type: "campaign",
    title: "Launch retargeting campaign",
    description:
      "A high-value audience segment has accumulated enough traffic to activate a retargeting campaign.",
    client: "Retargeting",
    priority: "medium",
    action: "Review campaign",
  },
];

const AGENT_ACTIVITY = [
  {
    id: "1",
    icon: TrendingUp,
    title: "Detected ROAS improvement",
    description:
      "Spring Product Launch is now 31% above its target efficiency.",
    time: "8 min ago",
    tone: "green",
  },
  {
    id: "2",
    icon: Users,
    title: "Found 14 high-intent leads",
    description:
      "New prospects were identified from recent engagement activity.",
    time: "24 min ago",
    tone: "blue",
  },
  {
    id: "3",
    icon: BrainCircuit,
    title: "Generated optimization",
    description:
      "Suggested reallocating spend from low-performing ad sets.",
    time: "42 min ago",
    tone: "blue",
  },
  {
    id: "4",
    icon: CalendarDays,
    title: "Scheduled campaign review",
    description: "Next portfolio review is scheduled for tomorrow.",
    time: "1 hr ago",
    tone: "neutral",
  },
];

export function AgencyClient({ initialOverview }: AgencyClientProps) {
  const { setActiveWorkspace } = useWorkspace();

  const [overview, setOverview] =
    useState<MarketerOverview>(initialOverview);

  const [range, setRange] = useState<OverviewRange>(
    initialOverview.range
  );

  const [isPending, startTransition] = useTransition();

  const [agentStatus, setAgentStatus] =
    useState<AgentStatus>("active");

  const [search, setSearch] = useState("");

  const [approvalItems, setApprovalItems] =
    useState<ApprovalItem[]>(APPROVALS);

  const [selectedApproval, setSelectedApproval] =
    useState<ApprovalItem | null>(null);

  const [activeSection, setActiveSection] =
    useState<"overview" | "approvals" | "activity">("overview");

  const healthyCount =
    (overview.clientHealth || []).filter(
      (c) => c.status === "healthy"
    ).length;

  const attentionCount =
    (overview.clientHealth || []).filter(
      (c) => c.status === "attention"
    ).length;

  const criticalCount =
    (overview.clientHealth || []).filter(
      (c) => c.status === "critical"
    ).length;

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return overview.clientHealth || [];

    return (overview.clientHealth || []).filter((client) => {
      return (
        client.name.toLowerCase().includes(query) ||
        client.role.toLowerCase().includes(query)
      );
    });
  }, [overview.clientHealth, search]);

  const handleRangeChange = (newRange: OverviewRange) => {
    if (newRange === range) return;

    setRange(newRange);

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/marketer/overview?range=${newRange}`
        );

        if (!response.ok) return;

        const data = await response.json();
        setOverview(data);
      } catch (error) {
        console.error("Failed to load marketer overview:", error);
      }
    });
  };

  const approveItem = (id: string) => {
    setApprovalItems((items) =>
      items.filter((item) => item.id !== id)
    );

    setSelectedApproval(null);
  };

  return (
    <main className="mx-auto w-full max-w-[1480px] space-y-6 pb-16">
      {/* =========================================================
          HEADER
      ========================================================= */}
      <PageHeader
        eyebrow="Marketer OS · AI Agent"
        title="Marketing Agent"
        sub="Your autonomous marketing operator monitors campaigns, finds opportunities, prepares actions, and waits for your approval when it matters."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex h-9 items-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-1">
              {(["7d", "30d", "90d"] as OverviewRange[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleRangeChange(r)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-[11px] font-semibold transition",
                    range === r
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-[var(--fg-4)] hover:text-[var(--fg)]"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            <Link
              href="/dashboard/analytics"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3.5 text-xs font-semibold text-[var(--fg-3)] transition hover:text-[var(--fg)] hover:bg-[var(--panel-fill)]"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Analytics
            </Link>

            <button
              type="button"
              onClick={() =>
                setAgentStatus((current) =>
                  current === "active" ? "paused" : "active"
                )
              }
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition-all",
                agentStatus === "active"
                  ? "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                  : "border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-3)] hover:text-[var(--fg)]"
              )}
            >
              {agentStatus === "active" ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  Pause Agent
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Resume Agent
                </>
              )}
            </button>
          </div>
        }
      />

      {/* =========================================================
          AGENT STATUS BAR
      ========================================================= */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <GlassCard padding="none" className="overflow-hidden">
          <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all",
                  agentStatus === "active"
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                    : "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-4)]"
                )}
              >
                <Bot className="h-7 w-7" />

                {agentStatus === "active" && (
                  <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-[var(--panel-fill)] bg-emerald-400 shadow-sm" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-base font-bold text-[var(--fg)] tracking-tight">
                    Kora Marketing Agent
                  </h2>

                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                      agentStatus === "active"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-4)]"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        agentStatus === "active"
                          ? "bg-emerald-400"
                          : "bg-[var(--fg-4)]"
                      )}
                    />
                    {agentStatus === "active" ? "Running" : "Paused"}
                  </span>
                </div>

                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[var(--fg-3)]">
                  Monitoring your portfolio, campaigns, audience signals,
                  spend efficiency and upcoming actions.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--fg-4)]">
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-blue-400" />
                    Monitoring {overview.clientHealth?.length || 0} workspaces
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5 text-[var(--fg-4)]" />
                    Last scan 4 min ago
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-blue-400" />
                    Autonomous mode
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:min-w-[360px]">
              <AgentMiniMetric
                label="Watching"
                value={String(overview.clientHealth?.length || 0)}
              />
              <AgentMiniMetric
                label="Opportunities"
                value={String(overview.opportunities?.length || 0)}
              />
              <AgentMiniMetric
                label="Approvals"
                value={String(approvalItems.length)}
                accent
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard padding="none">
          <div className="border-b border-[var(--stroke)] px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-4)]">
                  Agent health
                </p>
                <p className="mt-0.5 text-xs font-semibold text-[var(--fg)]">
                  Portfolio coverage
                </p>
              </div>

              <Gauge className="h-4 w-4 text-blue-400" />
            </div>
          </div>

          <div className="p-4">
            <div className="mb-3 flex items-end justify-between">
              <span className="text-2xl font-bold tracking-tight text-[var(--fg)]">
                {overview.clientHealth?.length
                  ? Math.round(
                      (healthyCount /
                        overview.clientHealth.length) *
                        100
                    )
                  : 0}
                %
              </span>

              <span className="text-xs text-[var(--fg-4)]">
                healthy workspaces
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[var(--panel-fill-2)] border border-[var(--stroke)]">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{
                  width: `${
                    overview.clientHealth?.length
                      ? (healthyCount /
                          overview.clientHealth.length) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs font-medium">
              <span className="text-emerald-400">
                {healthyCount} healthy
              </span>
              <span className="text-amber-400">
                {attentionCount} attention
              </span>
              <span className="text-rose-400">
                {criticalCount} critical
              </span>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* =========================================================
          NAVIGATION TABS
      ========================================================= */}
      <div className="flex items-center gap-1 border-b border-[var(--stroke)]">
        <AgentNavButton
          active={activeSection === "overview"}
          onClick={() => setActiveSection("overview")}
          icon={BrainCircuit}
          label="Command Center"
        />

        <AgentNavButton
          active={activeSection === "approvals"}
          onClick={() => setActiveSection("approvals")}
          icon={CheckCircle2}
          label="Needs Approval"
          count={approvalItems.length}
        />

        <AgentNavButton
          active={activeSection === "activity"}
          onClick={() => setActiveSection("activity")}
          icon={Activity}
          label="Agent Activity"
        />
      </div>

      {/* =========================================================
          APPROVALS
      ========================================================= */}
      {activeSection === "approvals" && (
        <section className="space-y-4">
          <SectionHeading
            icon={CheckCircle2}
            title="Needs your approval"
            description="The agent has prepared these actions but will not execute them until you approve."
            count={approvalItems.length}
          />

          {approvalItems.length === 0 ? (
            <EmptyPanel
              icon={CheckCircle2}
              title="Nothing waiting for approval"
              description="The agent is clear. New recommendations will appear here when they need your decision."
            />
          ) : (
            <div className="space-y-3">
              {approvalItems.map((item) => (
                <ApprovalCard
                  key={item.id}
                  item={item}
                  onReview={() => setSelectedApproval(item)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* =========================================================
          ACTIVITY
      ========================================================= */}
      {activeSection === "activity" && (
        <section className="space-y-4">
          <SectionHeading
            icon={Activity}
            title="Agent activity"
            description="A live audit trail of decisions, discoveries and actions made by the agent."
          />

          <GlassCard padding="none" className="overflow-hidden">
            <div className="divide-y divide-[var(--stroke)]/60">
              {AGENT_ACTIVITY.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex gap-3.5 p-4 transition hover:bg-[var(--panel-fill-2)]"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                        activity.tone === "green"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : activity.tone === "blue"
                          ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                          : "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-4)]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold text-[var(--fg)]">
                          {activity.title}
                        </p>

                        <span className="shrink-0 text-[10px] text-[var(--fg-4)]">
                          {activity.time}
                        </span>
                      </div>

                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--fg-3)]">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </section>
      )}

      {/* =========================================================
          COMMAND CENTER
      ========================================================= */}
      {activeSection === "overview" && (
        <>
          {/* KPI */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              icon={DollarSign}
              label="Managed Spend"
              value={fmtNaira(overview.summary?.spend || 0)}
              tone="blue"
              footer={
                <MetricChange value={overview.changes?.spendPct} />
              }
            />

            <StatTile
              icon={TrendingUp}
              label="Weighted ROAS"
              value={`${(
                overview.summary?.roas || 0
              ).toFixed(2)}×`}
              tone="indigo"
              footer={
                <MetricChange value={overview.changes?.roasPct} />
              }
            />

            <StatTile
              icon={DollarSign}
              label="Attributed Revenue"
              value={fmtNaira(
                overview.summary?.revenue || 0
              )}
              tone="success"
              footer={
                <MetricChange value={overview.changes?.revenuePct} />
              }
            />

            <StatTile
              icon={Layers3}
              label="Active Campaigns"
              value={String(
                overview.summary?.activeCampaigns || 0
              )}
              tone="warning"
              footer={
                <span className="text-xs text-[var(--fg-4)]">
                  Across your portfolio
                </span>
              }
            />
          </div>

          {/* MAIN */}
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-5">
              {/* AI PRIORITIES */}
              <GlassCard padding="none" className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--stroke)] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                      <Sparkles className="h-4 w-4" />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-[var(--fg)]">
                        Agent Priorities
                      </h2>
                      <p className="text-xs text-[var(--fg-4)]">
                        What Kora thinks you should focus on
                      </p>
                    </div>
                  </div>

                  <Pill tone="muted">
                    {overview.opportunities?.length || 0} signals
                  </Pill>
                </div>

                <div className="divide-y divide-[var(--stroke)]/60">
                  {!overview.opportunities ||
                  overview.opportunities.length === 0 ? (
                    <div className="p-8 text-center">
                      <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-400" />
                      <p className="mt-2 text-xs font-semibold text-[var(--fg)]">
                        Portfolio looks healthy
                      </p>
                      <p className="mt-1 text-xs text-[var(--fg-4)]">
                        The agent has no high-priority opportunities right now.
                      </p>
                    </div>
                  ) : (
                    overview.opportunities
                      .slice(0, 5)
                      .map((opp: MarketingOpportunity) => (
                        <OpportunityRow
                          key={opp.id}
                          opportunity={opp}
                        />
                      ))
                  )}
                </div>
              </GlassCard>

              {/* CLIENT PORTFOLIO */}
              <GlassCard padding="none" className="overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-[var(--stroke)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--fg)]">
                      Portfolio Workspaces
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--fg-4)]">
                      Workspace health and agent coverage
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fg-4)]" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search clients..."
                      className="h-8 w-48 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] pl-8 pr-3 text-xs text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)] focus:border-blue-500"
                    />
                  </div>
                </div>

                {filteredClients.length === 0 ? (
                  <EmptyPanel
                    icon={Users}
                    title="No workspaces found"
                    description="Connect a client workspace to start letting the agent monitor it."
                  />
                ) : (
                  <div className="divide-y divide-[var(--stroke)]/60">
                    {filteredClients.map(
                      (client: ClientHealth) => (
                        <PortfolioRow
                          key={client.workspaceId}
                          client={client}
                          onOpen={() =>
                            setActiveWorkspace(
                              client.workspaceId
                            )
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </GlassCard>

              {/* CAMPAIGNS */}
              <GlassCard padding="none" className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--stroke)] px-5 py-4">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--fg)]">
                      Campaign Performance
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--fg-4)]">
                      Highest-return campaigns detected by the agent
                    </p>
                  </div>

                  <Link
                    href="/dashboard/campaigns"
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    View campaigns →
                  </Link>
                </div>

                <div className="divide-y divide-[var(--stroke)]/60">
                  {!overview.topCampaigns ||
                  overview.topCampaigns.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--fg-4)]">
                      No campaign performance data available.
                    </div>
                  ) : (
                    overview.topCampaigns
                      .slice(0, 5)
                      .map(
                        (campaign: CampaignPerformance) => (
                          <CampaignRow
                            key={campaign.id}
                            campaign={campaign}
                          />
                        )
                      )
                  )}
                </div>
              </GlassCard>
            </div>

            {/* RIGHT RAIL */}
            <aside className="space-y-5">
              {/* APPROVAL QUEUE */}
              <GlassCard padding="none" className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--stroke)] px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-[var(--fg)]">
                        Approval Queue
                      </h3>
                      <p className="text-[10px] text-[var(--fg-4)]">
                        Actions waiting on you
                      </p>
                    </div>
                  </div>

                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[9px] font-bold text-white shadow-sm">
                    {approvalItems.length}
                  </span>
                </div>

                {approvalItems.length === 0 ? (
                  <div className="p-6 text-center">
                    <Check className="mx-auto h-5 w-5 text-emerald-400" />
                    <p className="mt-2 text-xs font-medium text-[var(--fg-3)]">
                      Queue cleared
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--stroke)]/60">
                    {approvalItems.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setSelectedApproval(item)
                        }
                        className="w-full p-3.5 text-left transition hover:bg-[var(--panel-fill-2)]"
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={cn(
                              "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                              item.priority === "high"
                                ? "bg-blue-500"
                                : item.priority === "medium"
                                ? "bg-amber-400"
                                : "bg-[var(--fg-4)]"
                            )}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-xs font-semibold text-[var(--fg-2)]">
                              {item.title}
                            </p>

                            <p className="mt-1 text-[10px] text-[var(--fg-4)]">
                              {item.client}
                            </p>
                          </div>

                          <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--fg-4)]" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {approvalItems.length > 3 && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection("approvals")
                    }
                    className="w-full border-t border-[var(--stroke)] px-4 py-3 text-xs font-semibold text-blue-400 hover:bg-[var(--panel-fill-2)]"
                  >
                    View all {approvalItems.length} approvals
                  </button>
                )}
              </GlassCard>

              {/* QUICK ACTIONS */}
              <GlassCard padding="none" className="overflow-hidden">
                <div className="border-b border-[var(--stroke)] px-4 py-3.5">
                  <h3 className="text-xs font-semibold text-[var(--fg)]">
                    Agent Actions
                  </h3>
                  <p className="mt-0.5 text-[10px] text-[var(--fg-4)]">
                    Give Kora something to work on
                  </p>
                </div>

                <div className="p-3 space-y-1">
                  <AgentAction
                    icon={Target}
                    title="Build Campaign"
                    description="Create a campaign from an objective"
                    href="/dashboard/campaigns"
                  />

                  <AgentAction
                    icon={Users}
                    title="Find Leads"
                    description="Discover high-intent prospects"
                    href="/dashboard/crm"
                  />

                  <AgentAction
                    icon={Sparkles}
                    title="Generate Strategy"
                    description="Build a strategy for a workspace"
                    href="/dashboard/strategy"
                  />

                  <AgentAction
                    icon={CalendarDays}
                    title="Plan Content"
                    description="Create the next publishing queue"
                    href="/dashboard/create"
                  />
                </div>
              </GlassCard>

              {/* RECENT ACTIVITY */}
              <GlassCard padding="none" className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--stroke)] px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-blue-400" />
                    <h3 className="text-xs font-semibold text-[var(--fg)]">
                      Recent Activity
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection("activity")
                    }
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    View all
                  </button>
                </div>

                <div className="divide-y divide-[var(--stroke)]/60">
                  {(overview.recentActivity || [])
                    .slice(0, 4)
                    .map((activity: ActivityItem) => (
                      <div
                        key={activity.id}
                        className="p-3.5"
                      >
                        <div className="flex gap-2.5">
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-[var(--panel-fill-2)] text-blue-400 border border-[var(--stroke)]">
                            <Activity className="h-3 w-3" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs leading-relaxed text-[var(--fg-3)]">
                              <strong className="text-[var(--fg)] font-semibold">
                                {activity.title}
                              </strong>{" "}
                              {activity.description}
                            </p>

                            <p className="mt-1 text-[10px] text-[var(--fg-4)]">
                              {activity.workspaceName}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </GlassCard>
            </aside>
          </div>

          {/* UPCOMING */}
          <GlassCard padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--stroke)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="h-4 w-4 text-blue-400" />
                <div>
                  <h2 className="text-sm font-bold text-[var(--fg)]">
                    Upcoming Agent Work
                  </h2>
                  <p className="text-xs text-[var(--fg-4)]">
                    Tasks the agent is preparing next
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/calendar"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                Open calendar →
              </Link>
            </div>

            <div className="grid gap-px bg-[var(--stroke)] md:grid-cols-3">
              {!overview.upcoming ||
              overview.upcoming.length === 0 ? (
                <div className="bg-[var(--panel-fill)] p-8 text-center text-xs text-[var(--fg-4)] md:col-span-3">
                  No upcoming agent tasks.
                </div>
              ) : (
                overview.upcoming
                  .slice(0, 3)
                  .map((task: UpcomingItem) => (
                    <UpcomingTask
                      key={task.id}
                      task={task}
                    />
                  ))
              )}
            </div>
          </GlassCard>
        </>
      )}

      {/* =========================================================
          APPROVAL MODAL
      ========================================================= */}
      {selectedApproval && (
        <ApprovalModal
          item={selectedApproval}
          onClose={() => setSelectedApproval(null)}
          onApprove={() =>
            approveItem(selectedApproval.id)
          }
          onReject={() => {
            setApprovalItems((items) =>
              items.filter(
                (item) => item.id !== selectedApproval.id
              )
            );
            setSelectedApproval(null);
          }}
        />
      )}
    </main>
  );
}

/* ===============================================================
   SUBCOMPONENTS
=============================================================== */

function AgentMiniMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3">
      <p className="text-[9px] uppercase font-bold tracking-widest text-[var(--fg-4)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-lg font-bold",
          accent ? "text-blue-400" : "text-[var(--fg)]"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function AgentNavButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all",
        active
          ? "border-blue-500 text-blue-400 font-bold"
          : "border-transparent text-[var(--fg-4)] hover:text-[var(--fg)]"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>

      {typeof count === "number" && count > 0 && (
        <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
          {count}
        </span>
      )}
    </button>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
  count,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  count?: number;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-blue-400" />
          <h2 className="text-base font-bold text-[var(--fg)]">
            {title}
          </h2>

          {typeof count === "number" && (
            <Pill tone="blue">{count}</Pill>
          )}
        </div>

        <p className="mt-1 text-xs text-[var(--fg-4)]">
          {description}
        </p>
      </div>
    </div>
  );
}

function MetricChange({
  value,
}: {
  value?: number;
}) {
  if (typeof value !== "number") {
    return (
      <span className="text-xs text-[var(--fg-4)]">
        Compared with previous period
      </span>
    );
  }

  const positive = value >= 0;

  return (
    <span
      className={cn(
        "text-xs font-semibold",
        positive ? "text-emerald-400" : "text-rose-400"
      )}
    >
      {positive ? "↑" : "↓"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function OpportunityRow({
  opportunity,
}: {
  opportunity: MarketingOpportunity;
}) {
  return (
    <div className="group flex gap-3.5 p-4 transition hover:bg-[var(--panel-fill-2)]">
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border",
          opportunity.impact === "high"
            ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
            : opportunity.impact === "medium"
            ? "border-blue-500/20 bg-blue-500/5 text-blue-300"
            : "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-4)]"
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xs font-bold text-[var(--fg)]">
            {opportunity.title}
          </h3>

          <span className="rounded-full border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--fg-4)]">
            {opportunity.impact}
          </span>

          {opportunity.category && (
            <span className="text-[10px] text-[var(--fg-4)]">
              {opportunity.category}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs leading-relaxed text-[var(--fg-3)]">
          {opportunity.description}
        </p>

        {opportunity.actionLabel && (
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            {opportunity.actionLabel}
            <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function PortfolioRow({
  client,
  onOpen,
}: {
  client: ClientHealth;
  onOpen: () => void;
}) {
  const health = {
    healthy: {
      label: "Healthy",
      dot: "bg-emerald-400",
      text: "text-emerald-400",
    },
    attention: {
      label: "Attention",
      dot: "bg-amber-400",
      text: "text-amber-400",
    },
    critical: {
      label: "Critical",
      dot: "bg-rose-400",
      text: "text-rose-400",
    },
  }[client.status];

  return (
    <div className="group flex flex-col gap-4 p-4 transition hover:bg-[var(--panel-fill-2)] lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-xs font-bold text-[var(--fg-3)]">
          {getInitials(client.name)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-xs font-semibold text-[var(--fg)]">
              {client.name}
            </h3>

            <span
              className={cn(
                "flex items-center gap-1 text-[10px] font-semibold",
                health.text
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  health.dot
                )}
              />
              {health.label}
            </span>
          </div>

          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[var(--fg-4)]">
            {client.role}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 text-center sm:flex sm:items-center">
        <PortfolioMetric
          label="Campaigns"
          value={String(client.activeCampaigns)}
        />

        <PortfolioMetric
          label="Spend"
          value={fmtNaira(client.spend)}
        />

        <PortfolioMetric
          label="ROAS"
          value={`${client.roas.toFixed(2)}×`}
          tone={
            client.roas >= 2.5
              ? "green"
              : client.roas >= 1.5
              ? "gold"
              : "red"
          }
        />
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3.5 py-2 text-xs font-semibold text-[var(--fg-3)] transition hover:text-[var(--fg)] hover:border-blue-500/30"
      >
        Open workspace
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function PortfolioMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "green" | "gold" | "red";
}) {
  return (
    <div className="min-w-[70px]">
      <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--fg-4)]">
        {label}
      </p>

      <p
        className={cn(
          "mt-0.5 text-xs font-semibold",
          tone === "green"
            ? "text-emerald-400"
            : tone === "gold"
            ? "text-amber-400"
            : tone === "red"
            ? "text-rose-400"
            : "text-[var(--fg)]"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function CampaignRow({
  campaign,
}: {
  campaign: CampaignPerformance;
}) {
  return (
    <div className="flex items-center gap-3 p-4 transition hover:bg-[var(--panel-fill-2)]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-blue-400">
        <Target className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-xs font-semibold text-[var(--fg)]">
            {campaign.name}
          </p>

          <span className="rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-1.5 py-0.5 text-[9px] uppercase font-bold text-[var(--fg-4)]">
            {campaign.platform}
          </span>
        </div>

        <p className="mt-0.5 truncate text-[10px] text-[var(--fg-4)]">
          {campaign.workspaceName} · {fmtNaira(campaign.spend)} spend
        </p>
      </div>

      <div className="text-right">
        <p
          className={cn(
            "text-xs font-bold",
            campaign.roas >= 2.5
              ? "text-emerald-400"
              : campaign.roas >= 1.5
              ? "text-amber-400"
              : "text-rose-400"
          )}
        >
          {campaign.roas.toFixed(2)}×
        </p>

        <p className="mt-0.5 text-[10px] text-[var(--fg-4)]">
          {campaign.conversions} conversions
        </p>
      </div>
    </div>
  );
}

function AgentAction({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl p-3 transition hover:bg-[var(--panel-fill-2)]"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-4)] transition group-hover:border-blue-500/30 group-hover:bg-blue-500/10 group-hover:text-blue-400">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[var(--fg-2)] group-hover:text-[var(--fg)]">
          {title}
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--fg-4)]">
          {description}
        </p>
      </div>

      <ArrowRight className="h-3.5 w-3.5 text-[var(--fg-4)] transition group-hover:text-blue-400" />
    </Link>
  );
}

function ApprovalCard({
  item,
  onReview,
}: {
  item: ApprovalItem;
  onReview: () => void;
}) {
  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
            item.priority === "high"
              ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
              : "border-amber-500/20 bg-amber-500/10 text-amber-400"
          )}
        >
          <BrainCircuit className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xs font-bold text-[var(--fg)]">
              {item.title}
            </h3>

            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase",
                item.priority === "high"
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-400"
              )}
            >
              {item.priority}
            </span>
          </div>

          <p className="mt-1 text-xs leading-relaxed text-[var(--fg-3)]">
            {item.description}
          </p>

          <p className="mt-1.5 text-[10px] text-[var(--fg-4)]">
            {item.client}
          </p>
        </div>

        <button
          type="button"
          onClick={onReview}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-4 py-2.5 text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
        >
          Review
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </GlassCard>
  );
}

function UpcomingTask({
  task,
}: {
  task: UpcomingItem;
}) {
  return (
    <div className="bg-[var(--panel-fill)] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-blue-400">
          <Clock3 className="h-3.5 w-3.5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-xs font-semibold text-[var(--fg)]">
              {task.title}
            </h3>
          </div>

          <p className="mt-0.5 text-[10px] text-[var(--fg-4)]">
            {task.workspaceName}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-[var(--fg-4)]">
              {task.dueAt}
            </span>

            <span
              className={cn(
                "text-[8px] font-bold uppercase",
                task.priority === "high" ||
                  task.priority === "urgent"
                  ? "text-rose-400"
                  : task.priority === "medium"
                  ? "text-amber-400"
                  : "text-[var(--fg-4)]"
              )}
            >
              {task.priority}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-blue-400">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-3 text-xs font-bold text-[var(--fg)]">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--fg-4)]">
        {description}
      </p>
    </div>
  );
}

function ApprovalModal({
  item,
  onClose,
  onApprove,
  onReject,
}: {
  item: ApprovalItem;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--stroke)] bg-[var(--panel-fill)] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[var(--stroke)] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <BrainCircuit className="h-4 w-4" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-4)]">
                Agent Recommendation
              </p>

              <h2 className="mt-0.5 text-base font-bold text-[var(--fg)]">
                {item.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-[var(--fg-4)] hover:bg-[var(--panel-fill-2)] hover:text-[var(--fg)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-4)]">
              Why Kora Recommends This
            </p>

            <p className="mt-1.5 text-xs leading-relaxed text-[var(--fg-3)]">
              {item.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--fg-4)]">
                Workspace
              </p>
              <p className="mt-1 text-xs font-semibold text-[var(--fg)]">
                {item.client}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--fg-4)]">
                Proposed Action
              </p>
              <p className="mt-1 text-xs font-semibold text-blue-400">
                {item.action}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-[var(--stroke)] pt-4">
            <button
              type="button"
              onClick={onReject}
              className="flex-1 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-2.5 text-xs font-medium text-[var(--fg-3)] hover:text-[var(--fg)]"
            >
              Dismiss
            </button>

            <button
              type="button"
              onClick={onApprove}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-4 py-2.5 text-xs font-semibold shadow-lg shadow-blue-500/25"
            >
              <Check className="h-3.5 w-3.5" />
              Approve Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  const parts = (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "CL";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
