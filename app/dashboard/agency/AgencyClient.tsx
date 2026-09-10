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
    <div className="mx-auto w-full max-w-[1400px] px-1 pb-14 text-white">
      {/* =========================================================
          HEADER & COMMAND BAR
      ========================================================= */}
      <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-5 items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
              <Sparkles className="h-3 w-3 text-blue-400" />
              <span>Marketer OS</span>
            </div>
            <span className="text-[11px] text-zinc-500">·</span>
            <span className="text-[11px] font-medium text-zinc-400">
              Agency Command Center
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
            Client Portfolio Overview
          </h1>
          <p className="mt-1 max-w-2xl text-[13px] leading-5 text-zinc-400">
            Real-time multi-workspace aggregation, weighted ROAS attribution, campaign intelligence, and portfolio health.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Selector */}
          <div className="flex h-9 items-center rounded-lg border border-white/[0.08] bg-[#121418] p-1 shadow-inner">
            {(["7d", "30d", "90d"] as OverviewRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRangeChange(r)}
                disabled={isPending}
                className={`rounded-md px-3 py-1 text-[11px] font-semibold transition-all ${
                  range === r
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {r === "7d" ? "Last 7 Days" : r === "30d" ? "Last 30 Days" : "Last 90 Days"}
              </button>
            ))}
          </div>

          <Link
            href="/dashboard/analytics"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#16191f] px-3.5 text-[12px] font-semibold text-zinc-300 transition hover:border-zinc-700 hover:bg-[#1d222a] hover:text-white"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </Link>

          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-[12px] font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500 active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            Invite Client
          </button>
        </div>
      </div>

      {/* =========================================================
          KPI STRIP (4 Normalized Core Cards with Period Deltas)
      ========================================================= */}
      <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {/* Managed Spend */}
        <MetricCard
          icon={DollarSign}
          label="Managed Spend"
          value={fmtNaira(overview.summary?.spend || 0)}
          delta={overview.changes?.spendPct}
          accent="blue"
          subtext={`${overview.clientHealth?.length || 0} workspaces contributing`}
        />

        {/* Portfolio Weighted ROAS */}
        <MetricCard
          icon={TrendingUp}
          label="Weighted ROAS"
          value={`${(overview.summary?.roas || 0).toFixed(2)}×`}
          delta={overview.changes?.roasPct}
          accent="purple"
          subtext={`Baseline target: 2.50×`}
        />

        {/* Total Attributed Revenue */}
        <MetricCard
          icon={Activity}
          label="Attributed Revenue"
          value={fmtNaira(overview.summary?.revenue || 0)}
          delta={overview.changes?.revenuePct}
          accent="green"
          subtext={`Net return across channels`}
        />

        {/* Active Campaigns & Health */}
        <MetricCard
          icon={Users}
          label="Active Campaigns"
          value={String(overview.summary?.activeCampaigns || 0)}
          accent="amber"
          customBadge={
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-semibold text-emerald-400">
                {healthyCount} Healthy
              </span>
            </div>
          }
          subtext={`${attentionCount} need attention · ${criticalCount} critical`}
        />
      </div>

      {/* =========================================================
          MAIN COMMAND GRID
      ========================================================= */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* LEFT / MAIN COLUMN */}
        <div className="min-w-0 space-y-6">
          {/* 1. PORTFOLIO TREND CHART (Spend vs Attributed Revenue) */}
          <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#14171d] p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-zinc-100">
                  Spend vs. Attributed Revenue Trend
                </h2>
                <p className="mt-0.5 text-[12px] text-zinc-400">
                  Visualizing multi-account return timeline for the selected {range} window.
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                  <span className="text-zinc-300">Managed Spend</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-zinc-300">Attributed Revenue</span>
                </div>
              </div>
            </div>

            {/* Sparkline / Bar visualization */}
            {(!overview.spendTrend || overview.spendTrend.length === 0) ? (
              <div className="flex h-44 items-center justify-center text-[12px] text-zinc-500">
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
                        <div className="pointer-events-none absolute -top-12 z-20 hidden flex-col items-center rounded-md border border-zinc-700 bg-[#0d0f12] px-2.5 py-1 text-[10px] text-zinc-200 shadow-xl group-hover:flex">
                          <span className="font-semibold text-white">{pt.date}</span>
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

                        <span className="mt-2 block truncate text-[9px] text-zinc-500">
                          {pt.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* 2. CLIENT WORKSPACES TABLE / HEALTH MATRIX */}
          <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#14171d] shadow-sm">
            <div className="flex flex-col gap-4 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-zinc-100">
                  Client Workspaces Health
                </h2>
                <p className="mt-0.5 text-[12px] text-zinc-400">
                  Monitor spend, performance efficiency, and ROAS status by client.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search workspace..."
                    className="h-8 w-44 rounded-lg border border-white/[0.08] bg-[#0e1014] pl-8 pr-3 text-[12px] text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-blue-500"
                  />
                </div>

                {/* Status Pills Filter */}
                <div className="flex h-8 items-center rounded-lg border border-white/[0.08] bg-[#0e1014] p-0.5">
                  <button
                    onClick={() => setHealthFilter("all")}
                    className={`rounded-md px-2.5 py-0.5 text-[10px] font-semibold transition ${
                      healthFilter === "all"
                        ? "bg-zinc-700 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setHealthFilter("healthy")}
                    className={`rounded-md px-2.5 py-0.5 text-[10px] font-semibold transition ${
                      healthFilter === "healthy"
                        ? "bg-emerald-600/30 text-emerald-300"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Healthy
                  </button>
                  <button
                    onClick={() => setHealthFilter("attention")}
                    className={`rounded-md px-2.5 py-0.5 text-[10px] font-semibold transition ${
                      healthFilter === "attention"
                        ? "bg-amber-600/30 text-amber-300"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Attention
                  </button>
                  <button
                    onClick={() => setHealthFilter("critical")}
                    className={`rounded-md px-2.5 py-0.5 text-[10px] font-semibold transition ${
                      healthFilter === "critical"
                        ? "bg-rose-600/30 text-rose-300"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Critical
                  </button>
                </div>
              </div>
            </div>

            {/* Clients List / Cards */}
            <div className="p-4">
              {(!overview.clientHealth || overview.clientHealth.length === 0) ? (
                <EmptyState onInvite={() => setInviteOpen(true)} />
              ) : filteredClients.length === 0 ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                  <Search className="h-6 w-6 text-zinc-600 mb-2" />
                  <p className="text-[13px] font-medium text-zinc-300">No matching clients</p>
                  <p className="text-[11px] text-zinc-500">Adjust your search query or status filter.</p>
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
          </section>

          {/* 3. TOP CAMPAIGNS & CHANNEL BREAKDOWN */}
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Top Campaigns */}
            <div className="rounded-xl border border-white/[0.08] bg-[#14171d] p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-zinc-100">
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

              {(!overview.topCampaigns || overview.topCampaigns.length === 0) ? (
                <p className="py-8 text-center text-[12px] text-zinc-500">
                  No campaigns active across your workspaces.
                </p>
              ) : (
                <div className="space-y-3">
                  {overview.topCampaigns.slice(0, 4).map((c: CampaignPerformance) => (
                    <div
                      key={c.id}
                      className="group flex items-center justify-between rounded-lg border border-white/[0.04] bg-[#0f1115] p-3 transition hover:border-zinc-700"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-zinc-300">
                            {c.platform}
                          </span>
                          <h4 className="truncate text-[12px] font-semibold text-zinc-200">
                            {c.name}
                          </h4>
                        </div>
                        <p className="mt-1 truncate text-[11px] text-zinc-500">
                          {c.workspaceName} · {fmtNaira(c.spend)} spend
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold ${
                            c.roas >= 2.5
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : c.roas >= 1.5
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {c.roas.toFixed(2)}× ROAS
                        </span>
                        <p className="mt-1 text-[10px] text-zinc-500">
                          {c.conversions} conv.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Navigator */}
            <div className="rounded-xl border border-white/[0.08] bg-[#14171d] p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400">
                    <Target className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-zinc-100">
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
                  color="blue"
                />
                <QuickLinkCard
                  title="Content Strategy"
                  desc="30-day client plans"
                  href="/dashboard/strategy"
                  icon={Target}
                  color="purple"
                />
                <QuickLinkCard
                  title="Content Calendar"
                  desc="Multi-brand scheduling"
                  href="/dashboard/calendar"
                  icon={CalendarDays}
                  color="green"
                />
                <QuickLinkCard
                  title="Brand Brains"
                  desc="Voice & persona memory"
                  href="/dashboard/brand"
                  icon={Sparkles}
                  color="pink"
                />
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT RAIL / SIDEBAR */}
        <aside className="space-y-6">
          {/* 1. AI PORTFOLIO OPPORTUNITIES */}
          <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#14171d] shadow-sm">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-pink-500/30 bg-pink-500/10 text-pink-400">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-zinc-100">
                    AI Portfolio Insights
                  </h3>
                  <p className="text-[10px] text-zinc-500">Autonomous growth recommendations</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {(overview.opportunities || []).map((opp: MarketingOpportunity) => (
                <div key={opp.id} className="p-4 transition hover:bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        opp.impact === "high"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : opp.impact === "medium"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {opp.impact} impact
                    </span>
                    <span className="text-[10px] font-medium text-zinc-500">
                      {opp.category}
                    </span>
                  </div>
                  <h4 className="text-[12px] font-semibold text-zinc-200">
                    {opp.title}
                  </h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                    {opp.description}
                  </p>
                  {opp.actionLabel && (
                    <button
                      type="button"
                      className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                    >
                      {opp.actionLabel}
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 2. RECENT ACTIVITY FEED */}
          <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#14171d] shadow-sm">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-400" />
                <h3 className="text-[14px] font-semibold text-zinc-100">
                  Recent Activity
                </h3>
              </div>
              <span className="text-[10px] text-zinc-500">Live feed</span>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {(!overview.recentActivity || overview.recentActivity.length === 0) ? (
                <p className="p-4 text-center text-[11px] text-zinc-500">
                  No recent activity recorded yet.
                </p>
              ) : (
                overview.recentActivity.map((act: ActivityItem) => (
                  <div key={act.id} className="p-3.5 transition hover:bg-white/[0.02]">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-800 text-zinc-400 text-[10px]">
                        <Activity className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-zinc-300">
                          <span className="font-semibold text-white">{act.title}</span>{" "}
                          {act.description}
                        </p>
                        <p className="mt-0.5 text-[10px] text-zinc-500">
                          {act.workspaceName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 3. UPCOMING DELIVERABLES & TASKS */}
          <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#14171d] shadow-sm">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-400" />
                <h3 className="text-[14px] font-semibold text-zinc-100">
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

            <div className="divide-y divide-white/[0.04]">
              {(!overview.upcoming || overview.upcoming.length === 0) ? (
                <p className="p-4 text-center text-[11px] text-zinc-500">
                  No upcoming tasks scheduled.
                </p>
              ) : (
                overview.upcoming.map((t: UpcomingItem) => (
                  <div key={t.id} className="flex items-start gap-3 p-3.5 transition hover:bg-white/[0.02]">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-zinc-700 bg-zinc-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[12px] font-medium text-zinc-200 truncate">
                          {t.title}
                        </h4>
                        <span
                          className={`text-[9px] font-bold uppercase ${
                            t.priority === "high" || t.priority === "urgent"
                              ? "text-rose-400"
                              : t.priority === "medium"
                              ? "text-amber-400"
                              : "text-zinc-500"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-zinc-500">
                        {t.workspaceName} · {t.dueAt}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* =========================================================
          INVITE CLIENT MODAL DIALOG
      ========================================================= */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#14171d] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-white">Invite Client Workspace</h3>
                  <p className="text-[11px] text-zinc-400">Connect a brand or client to your agency</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInviteOpen(false);
                  setInviteSuccess(false);
                }}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-[15px] font-semibold text-white">Invitation Sent!</h4>
                <p className="mt-1 text-[12px] text-zinc-400">
                  We sent an invite link to <span className="font-semibold text-zinc-200">{inviteEmail}</span>. Once accepted, their workspace will appear in your command center.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setInviteOpen(false);
                    setInviteSuccess(false);
                    setInviteEmail("");
                    setInviteName("");
                  }}
                  className="mt-5 w-full rounded-lg bg-blue-600 py-2.5 text-[12px] font-semibold text-white hover:bg-blue-500"
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
                  <label className="block text-[11px] font-semibold text-zinc-300">
                    Client or Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Acme Studio"
                    className="mt-1 h-9 w-full rounded-lg border border-white/[0.1] bg-[#0e1014] px-3 text-[12px] text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300">
                    Client Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="client@acme.com"
                    className="mt-1 h-9 w-full rounded-lg border border-white/[0.1] bg-[#0e1014] px-3 text-[12px] text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300">
                    Access Permission Level
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-white/[0.1] bg-[#0e1014] px-3 text-[12px] text-white outline-none focus:border-blue-500"
                  >
                    <option value="client">Client (View metrics & approvals)</option>
                    <option value="marketer">Marketer (Full campaign management)</option>
                    <option value="admin">Workspace Admin (Full control)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setInviteOpen(false)}
                    className="rounded-lg border border-white/[0.1] bg-[#181b22] px-4 py-2 text-[12px] font-semibold text-zinc-300 hover:bg-[#20252e]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteSending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-[12px] font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 disabled:opacity-50"
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
    </div>
  );
}

/* ===============================================================
   COMPONENTS
=============================================================== */

function MetricCard({
  icon: Icon,
  label,
  value,
  delta,
  accent,
  subtext,
  customBadge,
}: {
  icon: any;
  label: string;
  value: string;
  delta?: number;
  accent: "blue" | "purple" | "green" | "amber";
  subtext?: string;
  customBadge?: React.ReactNode;
}) {
  const accentStyles = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  };

  const hasDelta = typeof delta === "number";
  const isPositive = (delta || 0) >= 0;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#14171d] p-4 transition hover:border-zinc-700">
      <div className="mb-3 flex items-start justify-between">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${accentStyles[accent]}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        {customBadge ? (
          customBadge
        ) : hasDelta ? (
          <div
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {delta?.toFixed(1)}%
            </span>
          </div>
        ) : null}
      </div>

      <p className="text-[11px] font-medium text-zinc-400">{label}</p>
      <p className="mt-1 text-[22px] font-bold tracking-tight text-white">{value}</p>

      {subtext && <p className="mt-1.5 text-[10px] text-zinc-500">{subtext}</p>}
    </div>
  );
}

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
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f1115] transition hover:border-zinc-700">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-800 text-[13px] font-bold text-blue-400">
              {getInitials(client.name)}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-[13px] font-semibold text-zinc-100">
                {client.name}
              </h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {client.role}
                </span>
                <span className="h-1 w-1 rounded-full bg-zinc-700" />
                <span
                  className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.2 text-[9px] font-semibold ${healthBadge.bg}`}
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-800/60 text-zinc-400 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Metrics Row */}
        <div className="mt-4 grid grid-cols-3 border-t border-white/[0.06] pt-3 text-center">
          <div>
            <p className="text-[9px] uppercase font-semibold text-zinc-500">Campaigns</p>
            <p className="mt-0.5 text-[12px] font-bold text-zinc-200">
              {client.activeCampaigns} Active
            </p>
          </div>
          <div className="border-l border-white/[0.06]">
            <p className="text-[9px] uppercase font-semibold text-zinc-500">Spend</p>
            <p className="mt-0.5 text-[12px] font-bold text-zinc-200">
              {fmtNaira(client.spend)}
            </p>
          </div>
          <div className="border-l border-white/[0.06]">
            <p className="text-[9px] uppercase font-semibold text-zinc-500">ROAS</p>
            <p
              className={`mt-0.5 text-[12px] font-bold ${
                client.roas >= 2.5
                  ? "text-emerald-400"
                  : client.roas >= 1.5
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {client.roas.toFixed(2)}×
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center justify-between border-t border-white/[0.06] bg-[#0c0d10] px-4 py-2.5 text-left text-[11px] font-semibold text-zinc-400 transition hover:bg-zinc-800/40 hover:text-blue-400"
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
  color,
}: {
  title: string;
  desc: string;
  href: string;
  icon: any;
  color: "blue" | "purple" | "green" | "pink";
}) {
  const colorStyles = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    pink: "border-pink-500/20 bg-pink-500/10 text-pink-400",
  };

  return (
    <Link
      href={href}
      className="group rounded-lg border border-white/[0.06] bg-[#0f1115] p-3 transition hover:border-zinc-700 hover:bg-zinc-800/30"
    >
      <div
        className={`mb-2.5 flex h-7 w-7 items-center justify-center rounded-md border ${colorStyles[color]}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-[12px] font-semibold text-zinc-200">{title}</p>
      <p className="mt-0.5 text-[10px] text-zinc-500 leading-tight">{desc}</p>
      <ArrowUpRight className="mt-2 h-3 w-3 text-zinc-600 transition group-hover:text-blue-400" />
    </Link>
  );
}

function EmptyState({ onInvite }: { onInvite: () => void }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-[#0f1115] p-6 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
        <Plug className="h-5 w-5" />
      </div>
      <h3 className="text-[15px] font-semibold text-zinc-200">No client workspaces connected</h3>
      <p className="mt-1 max-w-sm text-[12px] text-zinc-400 leading-relaxed">
        Invite your first client workspace to start managing campaigns, tracking multi-channel spend, and automating client reporting.
      </p>
      <button
        type="button"
        onClick={onInvite}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-500"
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
