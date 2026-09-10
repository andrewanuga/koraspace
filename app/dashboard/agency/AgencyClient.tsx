"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plug,
  ExternalLink,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Target,
  Activity,
  BriefcaseBusiness,
  Plus,
  CheckCircle2,
  CalendarDays,
  Zap,
  Search,
  Clock,
  Check,
  X,
  ChevronRight,
  Send,
  Loader2,
} from "lucide-react";

import { fmtNaira } from "@/lib/dashboard/helpers";
import { useWorkspace } from "@/components/dashboard/WorkspaceProvider";
import { GlassCard, PageHeader, StatTile, Pill } from "@/components/dashboard/ui";
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

export function AgencyClient({ initialOverview }: AgencyClientProps) {
  const { setActiveWorkspace } = useWorkspace();
  const [overview, setOverview] = useState<MarketerOverview>(initialOverview);
  const [range, setRange] = useState<OverviewRange>(initialOverview.range);
  const [isPending, startTransition] = useTransition();

  // Filters & Search
  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState<"all" | "healthy" | "attention" | "critical">("all");

  // Invite Modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("client");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Range changer
  const handleRangeChange = (newRange: OverviewRange) => {
    if (newRange === range) return;
    setRange(newRange);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/marketer/overview?range=${newRange}`);
        if (res.ok) {
          const data = await res.json();
          setOverview(data);
        }
      } catch (err) {
        console.error("Failed to fetch marketer overview for range:", newRange, err);
      }
    });
  };

  // Filtered clients
  const filteredClients = (overview.clientHealth || []).filter((client: ClientHealth) => {
    const matchesSearch =
      !search.trim() ||
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.role.toLowerCase().includes(search.toLowerCase());

    const matchesHealth =
      healthFilter === "all" ? true : client.status === healthFilter;

    return matchesSearch && matchesHealth;
  });

  // Calculate top spend for chart scaling
  const maxTrendSpend = Math.max(
    ...(overview.spendTrend || []).map((t) => Math.max(t.spend, t.revenue)),
    1
  );

  const healthyCount = (overview.clientHealth || []).filter((c) => c.status === "healthy").length;
  const attentionCount = (overview.clientHealth || []).filter((c) => c.status === "attention").length;
  const criticalCount = (overview.clientHealth || []).filter((c) => c.status === "critical").length;

  return (
    <main className="mx-auto w-full max-w-[1440px] space-y-6">
      {/* HEADER */}
      <PageHeader
        eyebrow="Marketer OS · Command Center"
        title="Client Portfolio Overview"
        sub="Real-time multi-workspace aggregation, weighted ROAS attribution, campaign intelligence, and portfolio health."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Time Range Selector */}
            <div className="flex h-9 items-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-1">
              {(["7d", "30d", "90d"] as OverviewRange[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRangeChange(r)}
                  disabled={isPending}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                    range === r
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-[var(--fg-3)] hover:text-[var(--fg)]"
                  )}
                >
                  {r === "7d" ? "Last 7 Days" : r === "30d" ? "Last 30 Days" : "Last 90 Days"}
                </button>
              ))}
            </div>

            <Link
              href="/dashboard/analytics"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-600/10 px-3.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-600/20"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </Link>

            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 active:bg-blue-700 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Invite Client
            </button>
          </div>
        }
      />

      {/* KPI STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          icon={DollarSign}
          label="Managed Spend"
          value={fmtNaira(overview.summary?.spend || 0)}
          tone="blue"
          footer={
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--fg-4)]">{overview.clientHealth?.length || 0} workspaces</span>
              {typeof overview.changes?.spendPct === "number" && (
                <span className={overview.changes.spendPct >= 0 ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                  {overview.changes.spendPct >= 0 ? "↑ +" : "↓ "}{overview.changes.spendPct.toFixed(1)}%
                </span>
              )}
            </div>
          }
        />

        <StatTile
          icon={TrendingUp}
          label="Weighted ROAS"
          value={`${(overview.summary?.roas || 0).toFixed(2)}×`}
          tone="indigo"
          footer={
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--fg-4)]">Target: 2.50×</span>
              {typeof overview.changes?.roasPct === "number" && (
                <span className={overview.changes.roasPct >= 0 ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                  {overview.changes.roasPct >= 0 ? "↑ +" : "↓ "}{overview.changes.roasPct.toFixed(1)}%
                </span>
              )}
            </div>
          }
        />

        <StatTile
          icon={Activity}
          label="Attributed Revenue"
          value={fmtNaira(overview.summary?.revenue || 0)}
          tone="success"
          footer={
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--fg-4)]">Net cross-channel return</span>
              {typeof overview.changes?.revenuePct === "number" && (
                <span className={overview.changes.revenuePct >= 0 ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                  {overview.changes.revenuePct >= 0 ? "↑ +" : "↓ "}{overview.changes.revenuePct.toFixed(1)}%
                </span>
              )}
            </div>
          }
        />

        <StatTile
          icon={Users}
          label="Active Campaigns"
          value={String(overview.summary?.activeCampaigns || 0)}
          tone="warning"
          footer={
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium">{healthyCount} Healthy</span>
              <span className="text-[var(--fg-4)]">{attentionCount} Attention</span>
            </div>
          }
        />
      </div>

      {/* MAIN COMMAND GRID */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* LEFT / MAIN COLUMN */}
        <div className="min-w-0 space-y-6">
          {/* 1. PORTFOLIO TREND CHART */}
          <GlassCard className="p-5" padding="none">
            <div className="p-5">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-[var(--fg)]">
                    Spend vs. Attributed Revenue Trend
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--fg-4)]">
                    Visualizing multi-account return timeline for the selected {range} window.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                    <span className="text-[var(--fg-3)]">Managed Spend</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                    <span className="text-[var(--fg-3)]">Attributed Revenue</span>
                  </div>
                </div>
              </div>

              {/* Sparkline / Bar visualization */}
              {!overview.spendTrend || overview.spendTrend.length === 0 ? (
                <div className="flex h-44 items-center justify-center text-xs text-[var(--fg-4)]">
                  No campaign daily metrics recorded in this window yet.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex h-44 items-end gap-2 pt-4">
                    {overview.spendTrend.map((pt, idx) => {
                      const spendH = Math.max(8, (pt.spend / maxTrendSpend) * 100);
                      const revH = Math.max(8, (pt.revenue / maxTrendSpend) * 100);

                      return (
                        <div
                          key={idx}
                          className="group relative flex flex-1 flex-col items-center justify-end h-full"
                        >
                          {/* Hover Tooltip */}
                          <div className="pointer-events-none absolute -top-12 z-20 hidden flex-col items-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-2.5 py-1 text-[10px] text-[var(--fg)] shadow-xl group-hover:flex">
                            <span className="font-semibold text-[var(--fg)]">{pt.date}</span>
                            <span className="text-blue-400">Spend: {fmtNaira(pt.spend)}</span>
                            <span className="text-emerald-400">Rev: {fmtNaira(pt.revenue)}</span>
                          </div>

                          <div className="flex w-full items-end justify-center gap-1">
                            <div
                              className="w-1/2 rounded-t bg-blue-500/80 transition-all group-hover:bg-blue-400"
                              style={{ height: `${spendH}%` }}
                            />
                            <div
                              className="w-1/2 rounded-t bg-emerald-500/80 transition-all group-hover:bg-emerald-400"
                              style={{ height: `${revH}%` }}
                            />
                          </div>

                          <span className="mt-2 block truncate text-[9px] text-[var(--fg-4)]">
                            {pt.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* 2. CLIENT WORKSPACES TABLE / HEALTH MATRIX */}
          <GlassCard className="overflow-hidden" padding="none">
            <div className="flex flex-col gap-4 border-b border-[var(--stroke)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[var(--fg)]">
                  Client Workspaces Health
                </h2>
                <p className="mt-0.5 text-xs text-[var(--fg-4)]">
                  Monitor spend, performance efficiency, and ROAS status by client.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fg-4)]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search workspace..."
                    className="h-8 w-44 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] pl-8 pr-3 text-xs text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)] focus:border-blue-500"
                  />
                </div>

                {/* Status Pills Filter */}
                <div className="flex h-8 items-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-0.5">
                  {(["all", "healthy", "attention", "critical"] as const).map((hf) => (
                    <button
                      key={hf}
                      onClick={() => setHealthFilter(hf)}
                      className={cn(
                        "rounded-lg px-2.5 py-0.5 text-[10px] font-semibold transition capitalize cursor-pointer",
                        healthFilter === hf
                          ? "bg-blue-600 text-white"
                          : "text-[var(--fg-4)] hover:text-[var(--fg)]"
                      )}
                    >
                      {hf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clients List / Cards */}
            <div className="p-4">
              {!overview.clientHealth || overview.clientHealth.length === 0 ? (
                <EmptyState onInvite={() => setInviteOpen(true)} />
              ) : filteredClients.length === 0 ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                  <Search className="h-6 w-6 text-[var(--fg-4)] mb-2 opacity-60" />
                  <p className="text-xs font-medium text-[var(--fg-3)]">No matching clients</p>
                  <p className="text-[11px] text-[var(--fg-4)]">Adjust your search query or status filter.</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredClients.map((client: ClientHealth) => (
                    <ClientCard
                      key={client.workspaceId}
                      client={client}
                      onOpen={() => setActiveWorkspace(client.workspaceId)}
                    />
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          {/* 3. TOP CAMPAIGNS & CHANNEL BREAKDOWN */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Campaigns */}
            <GlassCard className="p-5" padding="none">
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between border-b border-[var(--stroke)] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <Zap className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-xs font-semibold text-[var(--fg)]">
                      Top Performing Campaigns
                    </h3>
                  </div>
                  <Link
                    href="/dashboard/campaigns"
                    className="text-[11px] font-medium text-blue-400 hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                {!overview.topCampaigns || overview.topCampaigns.length === 0 ? (
                  <p className="py-8 text-center text-xs text-[var(--fg-4)]">
                    No campaigns active across your workspaces.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {overview.topCampaigns.slice(0, 4).map((c: CampaignPerformance) => (
                      <div
                        key={c.id}
                        className="group flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3 transition hover:border-[var(--stroke-strong)]"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-[var(--panel-fill)] border border-[var(--stroke)] px-1.5 py-0.5 text-[9px] font-semibold uppercase text-[var(--fg-3)]">
                              {c.platform}
                            </span>
                            <h4 className="truncate text-xs font-semibold text-[var(--fg)]">
                              {c.name}
                            </h4>
                          </div>
                          <p className="mt-1 truncate text-[11px] text-[var(--fg-4)]">
                            {c.workspaceName} · {fmtNaira(c.spend)} spend
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={cn(
                              "inline-block rounded-lg px-2 py-0.5 text-[11px] font-bold",
                              c.roas >= 2.5
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : c.roas >= 1.5
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            )}
                          >
                            {c.roas.toFixed(2)}× ROAS
                          </span>
                          <p className="mt-1 text-[10px] text-[var(--fg-4)]">
                            {c.conversions} conv.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Quick Actions Navigator */}
            <GlassCard className="p-5" padding="none">
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between border-b border-[var(--stroke)] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <Target className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-xs font-semibold text-[var(--fg)]">
                      Quick Workflows
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <QuickLinkCard
                    title="Create Campaign"
                    desc="Launch across platforms"
                    href="/dashboard/create"
                    icon={BriefcaseBusiness}
                  />
                  <QuickLinkCard
                    title="Content Strategy"
                    desc="30-day client plans"
                    href="/dashboard/strategy"
                    icon={Target}
                  />
                  <QuickLinkCard
                    title="Content Calendar"
                    desc="Multi-brand scheduling"
                    href="/dashboard/calendar"
                    icon={CalendarDays}
                  />
                  <QuickLinkCard
                    title="Brand Brains"
                    desc="Voice & persona memory"
                    href="/dashboard/brand"
                    icon={Sparkles}
                  />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* RIGHT RAIL / SIDEBAR */}
        <aside className="space-y-6">
          {/* 1. AI PORTFOLIO OPPORTUNITIES */}
          <GlassCard className="overflow-hidden" padding="none">
            <div className="flex items-center justify-between border-b border-[var(--stroke)] px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[var(--fg)]">
                    AI Portfolio Insights
                  </h3>
                  <p className="text-[10px] text-[var(--fg-4)]">Autonomous growth recommendations</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[var(--stroke)]">
              {(overview.opportunities || []).map((opp: MarketingOpportunity) => (
                <div key={opp.id} className="p-4 transition hover:bg-[var(--hover)]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                        opp.impact === "high"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : opp.impact === "medium"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-[var(--panel-fill-2)] text-[var(--fg-4)] border border-[var(--stroke)]"
                      )}
                    >
                      {opp.impact} impact
                    </span>
                    <span className="text-[10px] font-medium text-[var(--fg-4)]">
                      {opp.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[var(--fg)]">
                    {opp.title}
                  </h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--fg-3)]">
                    {opp.description}
                  </p>
                  {opp.actionLabel && (
                    <button
                      type="button"
                      className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      {opp.actionLabel}
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 2. RECENT ACTIVITY FEED */}
          <GlassCard className="overflow-hidden" padding="none">
            <div className="flex items-center justify-between border-b border-[var(--stroke)] px-5 py-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[var(--fg-4)]" />
                <h3 className="text-xs font-semibold text-[var(--fg)]">
                  Recent Activity
                </h3>
              </div>
              <span className="text-[10px] text-[var(--fg-4)]">Live feed</span>
            </div>

            <div className="divide-y divide-[var(--stroke)]">
              {!overview.recentActivity || overview.recentActivity.length === 0 ? (
                <p className="p-4 text-center text-xs text-[var(--fg-4)]">
                  No recent activity recorded yet.
                </p>
              ) : (
                overview.recentActivity.map((act: ActivityItem) => (
                  <div key={act.id} className="p-3.5 transition hover:bg-[var(--hover)]">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px]">
                        <Activity className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-[var(--fg-2)]">
                          <strong className="text-[var(--fg)]">{act.title}</strong>{" "}
                          {act.description}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[var(--fg-4)]">
                          {act.workspaceName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* 3. UPCOMING DELIVERABLES & TASKS */}
          <GlassCard className="overflow-hidden" padding="none">
            <div className="flex items-center justify-between border-b border-[var(--stroke)] px-5 py-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-400" />
                <h3 className="text-xs font-semibold text-[var(--fg)]">
                  Upcoming Tasks
                </h3>
              </div>
              <Link
                href="/dashboard/calendar"
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300"
              >
                Calendar →
              </Link>
            </div>

            <div className="divide-y divide-[var(--stroke)]">
              {!overview.upcoming || overview.upcoming.length === 0 ? (
                <p className="p-4 text-center text-xs text-[var(--fg-4)]">
                  No upcoming tasks scheduled.
                </p>
              ) : (
                overview.upcoming.map((t: UpcomingItem) => (
                  <div key={t.id} className="flex items-start gap-3 p-3.5 transition hover:bg-[var(--hover)]">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-[var(--fg)] truncate">
                          {t.title}
                        </h4>
                        <span
                          className={cn(
                            "text-[9px] font-bold uppercase",
                            t.priority === "high" || t.priority === "urgent"
                              ? "text-rose-400"
                              : t.priority === "medium"
                              ? "text-amber-400"
                              : "text-[var(--fg-4)]"
                          )}
                        >
                          {t.priority}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-[var(--fg-4)]">
                        {t.workspaceName} · {t.dueAt}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </aside>
      </div>

      {/* INVITE CLIENT MODAL DIALOG */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--stroke)] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[var(--fg)]">Invite Client Workspace</h3>
                  <p className="text-xs text-[var(--fg-4)]">Connect a brand or client to your agency</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInviteOpen(false);
                  setInviteSuccess(false);
                }}
                className="rounded-lg p-1.5 text-[var(--fg-4)] hover:bg-[var(--hover)] hover:text-[var(--fg)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-[15px] font-semibold text-[var(--fg)]">Invitation Sent!</h4>
                <p className="mt-1 text-xs text-[var(--fg-4)]">
                  We sent an invite link to <strong className="text-[var(--fg)]">{inviteEmail}</strong>. Once accepted, their workspace will appear in your command center.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setInviteOpen(false);
                    setInviteSuccess(false);
                    setInviteEmail("");
                    setInviteName("");
                  }}
                  className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!inviteEmail) return;
                  setInviteSending(true);
                  setTimeout(() => {
                    setInviteSending(false);
                    setInviteSuccess(true);
                  }, 800);
                }}
                className="mt-4 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-[var(--fg-3)]">
                    Client or Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Acme Studio"
                    className="mt-1 h-9 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)] focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--fg-3)]">
                    Client Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="client@acme.com"
                    className="mt-1 h-9 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)] focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--fg-3)]">
                    Access Permission Level
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs text-[var(--fg)] outline-none focus:border-blue-500"
                  >
                    <option value="client">Client (View metrics & approvals)</option>
                    <option value="marketer">Marketer (Full campaign management)</option>
                    <option value="admin">Workspace Admin (Full control)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--stroke)]">
                  <button
                    type="button"
                    onClick={() => setInviteOpen(false)}
                    className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-2 text-xs font-semibold text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteSending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 cursor-pointer"
                  >
                    {inviteSending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

/* ===============================================================
   COMPONENTS
=============================================================== */

function ClientCard({
  client,
  onOpen,
}: {
  client: ClientHealth;
  onOpen: () => void;
}) {
  const healthBadge = {
    healthy: {
      label: "Healthy",
      bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-400",
    },
    attention: {
      label: "Needs Attention",
      bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      dot: "bg-amber-400",
    },
    critical: {
      label: "Critical",
      bg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      dot: "bg-rose-400",
    },
  }[client.status];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] transition hover:border-[var(--stroke-strong)]">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-xs font-bold text-blue-400">
              {getInitials(client.name)}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-xs font-semibold text-[var(--fg)]">
                {client.name}
              </h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[var(--fg-4)]">
                  {client.role}
                </span>
                <span className="h-1 w-1 rounded-full bg-[var(--stroke)]" />
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.2 text-[9px] font-semibold",
                    healthBadge.bg
                  )}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${healthBadge.dot}`} />
                  {healthBadge.label}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpen}
            title="Open workspace"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-4)] transition hover:border-blue-500 hover:text-blue-400 cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Metrics Row */}
        <div className="mt-4 grid grid-cols-3 border-t border-[var(--stroke)] pt-3 text-center">
          <div>
            <p className="text-[9px] uppercase font-semibold text-[var(--fg-4)]">Campaigns</p>
            <p className="mt-0.5 text-xs font-bold text-[var(--fg)]">
              {client.activeCampaigns} Active
            </p>
          </div>
          <div className="border-l border-[var(--stroke)]">
            <p className="text-[9px] uppercase font-semibold text-[var(--fg-4)]">Spend</p>
            <p className="mt-0.5 text-xs font-bold text-[var(--fg)]">
              {fmtNaira(client.spend)}
            </p>
          </div>
          <div className="border-l border-[var(--stroke)]">
            <p className="text-[9px] uppercase font-semibold text-[var(--fg-4)]">ROAS</p>
            <p
              className={cn(
                "mt-0.5 text-xs font-bold",
                client.roas >= 2.5
                  ? "text-emerald-400"
                  : client.roas >= 1.5
                  ? "text-amber-400"
                  : "text-rose-400"
              )}
            >
              {client.roas.toFixed(2)}×
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center justify-between border-t border-[var(--stroke)] bg-[var(--panel-fill)] px-4 py-2.5 text-left text-xs font-semibold text-blue-400 hover:text-blue-300 transition cursor-pointer"
      >
        <span>Manage Campaigns & Assets</span>
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

function QuickLinkCard({
  title,
  desc,
  href,
  icon: Icon,
}: {
  title: string;
  desc: string;
  href: string;
  icon: any;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3 transition hover:border-blue-500/50 hover:bg-[var(--hover)]"
    >
      <div className="mb-2.5 flex h-7 w-7 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-xs font-semibold text-[var(--fg)]">{title}</p>
      <p className="mt-0.5 text-[10px] text-[var(--fg-4)] leading-tight">{desc}</p>
      <ArrowUpRight className="mt-2 h-3 w-3 text-[var(--fg-4)] transition group-hover:text-blue-400" />
    </Link>
  );
}

function EmptyState({ onInvite }: { onInvite: () => void }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--stroke)] bg-[var(--panel-fill-2)] p-6 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
        <Plug className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--fg)]">No client workspaces connected</h3>
      <p className="mt-1 max-w-sm text-xs text-[var(--fg-4)] leading-relaxed">
        Invite your first client workspace to start managing campaigns, tracking multi-channel spend, and automating client reporting.
      </p>
      <button
        type="button"
        onClick={onInvite}
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5" />
        Invite First Client
      </button>
    </div>
  );
}

function getInitials(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "CL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
