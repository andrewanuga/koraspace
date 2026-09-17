"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Users,
  UserPlus,
  ShieldAlert,
  Ban,
  DollarSign,
  Activity,
  CreditCard,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Radio,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { GlassCard, PageHeader, StatTile, Pill } from "@/components/dashboard/ui";
import { getAdminOverviewStats } from "./actions";
import { fmtNaira, fmtNum, timeAgo } from "@/lib/dashboard/helpers";
import { PLAN_ORDER, PLANS, type PlanId } from "@/lib/billing/plans";

type Evt = {
  id: string;
  type: string;
  ip: string | null;
  email: string | null;
  severity: string;
  created_at: string;
  detail: string | null;
};

const sevTone = (s: string) =>
  s === "critical" ? "red" : s === "warning" ? "gold" : ("indigo" as const);

export default function AdminOverview() {
  const [stats, setStats] = useState({
    users: 0,
    new7: 0,
    suspended: 0,
    blocked: 0,
    events24: 0,
    revenue: 0,
    activePaidSubs: 0,
    mrr: 0,
  });
  const [plans, setPlans] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<Evt[]>([]);
  const [signups, setSignups] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // 30s default
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [timeframe, setTimeframe] = useState<"7d" | "14d" | "30d">("14d");

  const fetchData = useCallback(async () => {
    try {
      const {
        users,
        new7,
        suspended,
        blocked,
        events24,
        profiles,
        pays,
        evs
      } = await getAdminOverviewStats();

      const planMap: Record<string, number> = {};
      let paidCount = 0;
      let calculatedMrr = 0;

      (profiles ?? []).forEach((p: any) => {
        const planKey = p.plan ?? "free";
        planMap[planKey] = (planMap[planKey] ?? 0) + 1;
        if (planKey !== "free") {
          paidCount++;
          const planConfig = PLANS[planKey as PlanId];
          if (planConfig?.price) {
            calculatedMrr += planConfig.price;
          }
        }
      });

      const totalRev = (pays ?? [])
        .filter((p: any) => p.status === "success")
        .reduce((a: number, p: any) => a + Number(p.amount || 0), 0);

      // Signups buckets for chart (14 days)
      const numDays = 14;
      const buckets = new Array(numDays).fill(0);
      (profiles ?? []).forEach((p: any) => {
        const d = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 864e5);
        if (d >= 0 && d < numDays) {
          buckets[numDays - 1 - d]++;
        }
      });

      setStats({
        users: users ?? 0,
        new7: new7 ?? 0,
        suspended: suspended ?? 0,
        blocked: blocked ?? 0,
        events24: events24 ?? 0,
        revenue: totalRev > 0 ? totalRev : calculatedMrr * 3, // fallback based on subscriptions
        activePaidSubs: paidCount,
        mrr: calculatedMrr,
      });
      setPlans(planMap);
      setEvents((evs ?? []) as Evt[]);
      setSignups(buckets);
      setLastRefreshed(new Date());
    } catch {
      // offline / not admin
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  const maxSignup = Math.max(...signups, 1);
  const maxPlan = Math.max(...Object.values(plans), 1);

  return (
<<<<<<< HEAD
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Security operations" title="SOC Overview" sub="Live view of users, revenue, and security across Koraspace AI." />
=======
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Top Header */}
      <PageHeader
        eyebrow="Security Operations Center"
        title="SOC Command Overview"
        sub="Real-time multi-tenant telemetry, user lifecycle distribution, financial health, and threat mitigation."
        actions={
          <div className="flex items-center gap-3">
            {/* Auto Refresh Select */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white/70">
              <RefreshCw className={`h-3.5 w-3.5 text-blue-400 ${loading ? "animate-spin" : ""}`} />
              <span>Auto-refresh:</span>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-white font-semibold outline-none cursor-pointer"
              >
                <option value={10} className="bg-[#12131a]">10s</option>
                <option value={30} className="bg-[#12131a]">30s</option>
                <option value={60} className="bg-[#12131a]">60s</option>
                <option value={0} className="bg-[#12131a]">Paused</option>
              </select>
            </div>
>>>>>>> main

            <button
              onClick={() => {
                setLoading(true);
                fetchData();
              }}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-blue-600/10 px-3.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-600/20"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        }
      />

      {/* KPI Cards Row (6 stats) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatTile
          label="Total Users"
          value={fmtNum(stats.users)}
          icon={Users}
          tone="indigo"
          footer={<span className="text-[11px] text-white/50">{stats.activePaidSubs} paying</span>}
        />
        <StatTile
          label="New Signups (7d)"
          value={`+${fmtNum(stats.new7)}`}
          icon={UserPlus}
          tone="violet"
          footer={<span className="text-[11px] text-emerald-400 font-semibold">Active trend</span>}
        />
        <StatTile
          label="Est. MRR"
          value={fmtNaira(stats.mrr)}
          icon={DollarSign}
          tone="green"
          footer={<span className="text-[11px] text-white/50">Monthly recurring</span>}
        />
        <StatTile
          label="Security Events (24h)"
          value={fmtNum(stats.events24)}
          icon={Activity}
          tone="gold"
          footer={<span className="text-[11px] text-white/50">Audited logs</span>}
        />
        <StatTile
          label="Blocked IPs"
          value={fmtNum(stats.blocked)}
          icon={Ban}
          tone="red"
          footer={<span className="text-[11px] text-white/50">Zero-trust banned</span>}
        />
        <StatTile
          label="Suspended Users"
          value={fmtNum(stats.suspended)}
          icon={ShieldAlert}
          tone="red"
          footer={<span className="text-[11px] text-white/50">Restricted access</span>}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Signups Velocity Chart */}
        <GlassCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-[16px] font-semibold text-white">
                Signup Velocity
              </p>
              <p className="text-xs text-white/50">Daily account registrations over the last 14 days</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium text-white/60">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span>Avg: {(signups.reduce((a, b) => a + b, 0) / (signups.length || 1)).toFixed(1)}/day</span>
            </div>
          </div>

          <div className="mt-6 flex h-44 items-end gap-2 border-b border-white/10 pb-2">
            {signups.map((v, i) => {
              const heightPct = (v / maxSignup) * 100;
              return (
                <div key={i} className="group relative flex flex-1 flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-t-lg transition-all duration-300 group-hover:brightness-125"
                    style={{
                      height: `${Math.max(heightPct, 6)}%`,
                      background: i >= signups.length - 2
                        ? "linear-gradient(180deg, #3b82f6, #6366f1)"
                        : "linear-gradient(180deg, #6366f1, rgba(99,102,241,0.3))",
                    }}
                  />
                  {/* Tooltip */}
                  <span className="pointer-events-none absolute -top-8 hidden rounded-md bg-[#181920] px-2 py-1 text-[10px] font-bold text-white shadow-xl border border-white/10 group-hover:block z-20">
                    Day {i + 1}: {v} users
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10.5px] font-data text-white/40">
            <span>14 days ago</span>
            <span>Today</span>
          </div>
        </GlassCard>

        {/* Plan Distribution Matrix */}
        <GlassCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-400" />
              <p className="font-display text-[16px] font-semibold text-white">
                Subscription Matrix
              </p>
            </div>
            <span className="text-xs text-white/40 font-data">{stats.users} total accounts</span>
          </div>

          <div className="mt-4 space-y-4">
            {PLAN_ORDER.map((id) => {
              const count = plans[id] ?? 0;
              const plan = PLANS[id as PlanId];
              const pct = stats.users > 0 ? (count / stats.users) * 100 : 0;

              return (
                <div key={id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white capitalize">{plan.name}</span>
                      {id !== "free" && (
                        <span className="text-[10.5px] text-white/40 font-data">
                          {fmtNaira(plan.price)}/mo
                        </span>
                      )}
                    </div>
                    <span className="font-data font-semibold text-white">
                      {count} <span className="text-white/40 text-[10.5px]">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.04] border border-white/[0.04]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background:
                          id === "team" || id === "advanced"
                            ? "linear-gradient(90deg, #3b82f6, #a855f7)"
                            : id === "pro"
                            ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                            : "linear-gradient(90deg, #6366f1, #818cf8)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Live Security Audit Feed */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <div>
              <h3 className="font-display text-[16px] font-semibold text-white">
                Live Threat &amp; Audit Stream
              </h3>
              <p className="text-xs text-white/50">Continuous Zero-Trust logging and suspicious activity telemetry</p>
            </div>
          </div>
          <Pill tone="red">{events.length} logs</Pill>
        </div>

        {events.length === 0 ? (
          <div className="py-8 text-center text-xs text-white/40">
            No security events logged in current window.
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((e) => (
              <div
                key={e.id}
                className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-white/10 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      e.severity === "critical"
                        ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                        : e.severity === "warning"
                        ? "bg-amber-400"
                        : "bg-blue-400"
                    }`}
                  />
                  <Pill tone={sevTone(e.severity)}>{e.type.replace(/_/g, " ")}</Pill>
                  <p className="truncate text-white/80 font-medium">
                    {e.detail || e.email || e.ip || "—"}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-white/40 shrink-0">
                  {e.ip && <span className="font-data bg-white/[0.04] px-2 py-0.5 rounded">{e.ip}</span>}
                  <span>{timeAgo(e.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
