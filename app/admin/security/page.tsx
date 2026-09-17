"use client";
﻿import { prisma } from "@/lib/db";
import { auth } from "@/auth";



import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  Plus,
  X,
  ShieldAlert,
  Loader2,
  Download,
  Search,
  RefreshCw,
  Lock,
  Filter,
} from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { useToast } from "@/components/ui/toast";
import { timeAgo } from "@/lib/dashboard/helpers";
import { blockIpAddress, unblockIpAddress } from "./actions";

type Blocked = {
  ip: string;
  reason: string | null;
  auto: boolean;
  created_at: string;
  expires_at: string | null;
};

type Evt = {
  id: string;
  type: string;
  ip: string | null;
  email: string | null;
  severity: string;
  path: string | null;
  detail: string | null;
  created_at: string;
};

const FILTERS = ["all", "critical", "warning", "info"] as const;
const sevTone = (s: string) =>
  s === "critical" ? "red" : s === "warning" ? "gold" : ("indigo" as const);

export default function AdminSecurity() {
  const { success, error: toastError } = useToast();
  const [blocked, setBlocked] = useState<Blocked[]>([]);
  const [events, setEvents] = useState<Evt[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [ipInput, setIpInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [{ data: b }, { data: e }] = await Promise.all([
        supabase
          .from("blocked_ips")
          .select("ip, reason, auto, created_at, expires_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("security_events")
          .select("id, type, ip, email, severity, path, detail, created_at")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      if (b) setBlocked(b as Blocked[]);
      if (e) setEvents(e as Evt[]);
    } catch {
      // offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(() => {
    let list = filter === "all" ? events : events.filter((e) => e.severity === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          (e.ip && e.ip.toLowerCase().includes(q)) ||
          (e.type && e.type.toLowerCase().includes(q)) ||
          (e.detail && e.detail.toLowerCase().includes(q)) ||
          (e.email && e.email.toLowerCase().includes(q))
      );
    }
    return list;
  }, [events, filter, searchQuery]);

  const blockIp = async () => {
    const ip = ipInput.trim();
    if (!ip) return;
    setBusy(true);
    try {
      await blockIpAddress(ip);
      setBlocked((prev) => [
        {
          ip,
          reason: reasonInput.trim() || "Manually blocked by SOC officer",
          auto: false,
          created_at: new Date().toISOString(),
          expires_at: null,
        },
        ...prev.filter((b) => b.ip !== ip),
      ]);
      setIpInput("");
      setReasonInput("");
      success(`IP ${ip} blocked`);
    } catch (e) {
      toastError("Couldn't block IP", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const unblock = async (ip: string) => {
    setBlocked((prev) => prev.filter((b) => b.ip !== ip));
    try {
      await unblockIpAddress(ip);
      success(`IP ${ip} unblocked`);
    } catch {
      load();
    }
  };

  const exportLogs = () => {
    const jsonStr = JSON.stringify(events, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `koraspace-security-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success("Security audit logs exported");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Zero-Trust Sentinel &amp; Firewall"
        title="Security &amp; Threat Mitigation"
        sub="Manage IP firewalls, inspect zero-trust security events, and export compliance audit logs."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={exportLogs}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-xs font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Download className="h-3.5 w-3.5" /> Export Audit Log
            </button>
            <button
              onClick={load}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-blue-600/10 px-3.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-600/20"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.65fr]">
        {/* Blocked IPs Column */}
        <GlassCard className="h-fit p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-rose-400" />
              <p className="font-display text-[15px] font-semibold text-white">
                Banned IP Addresses
              </p>
            </div>
            <Pill tone="red">{blocked.length}</Pill>
          </div>

          {/* Add IP Form */}
          <div className="space-y-2">
            <input
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="e.g. 198.51.100.42"
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 text-xs text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none font-data"
            />
            <input
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="Reason (optional)"
              className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 text-xs text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={blockIp}
              disabled={!ipInput.trim() || busy}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600/90 text-xs font-semibold text-white hover:bg-rose-600 transition disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span>Add to Firewall Blocklist</span>
            </button>
          </div>

          {/* Blocked IPs List */}
          <div className="mt-4 space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {blocked.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-6">No IPs currently blacklisted.</p>
            ) : (
              blocked.map((b) => (
                <div
                  key={b.ip}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-data font-semibold text-white">{b.ip}</span>
                      {b.auto ? <Pill tone="gold">Auto</Pill> : <Pill tone="muted">Manual</Pill>}
                    </div>
                    {b.reason && <p className="truncate text-[11px] text-white/40">{b.reason}</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10.5px] text-white/40 font-data">{timeAgo(b.created_at)}</span>
                    <button
                      onClick={() => unblock(b.ip)}
                      className="p-1 text-white/40 hover:text-white transition"
                      title="Unblock IP"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Security Events Stream */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-blue-400" />
              <p className="font-display text-[15px] font-semibold text-white">
                Live Audit Logs
              </p>
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex rounded-xl border border-white/10 bg-white/[0.02] p-0.5 text-xs">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-2.5 py-1 capitalize transition ${
                    filter === f ? "bg-blue-600 text-white font-semibold" : "text-white/60 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Search box for events */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event type, IP address, detail..."
              className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.02] pl-8 pr-3 text-xs text-white placeholder:text-white/30 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Events list */}
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>
          ) : shown.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-8">No security events found.</p>
          ) : (
            <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {shown.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs space-y-1 transition hover:border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          e.severity === "critical"
                            ? "bg-rose-500"
                            : e.severity === "warning"
                            ? "bg-amber-400"
                            : "bg-blue-400"
                        }`}
                      />
                      <Pill tone={sevTone(e.severity)}>{e.type.replace(/_/g, " ")}</Pill>
                      {e.ip && (
                        <span className="font-data text-[11px] text-white/50 bg-white/[0.03] px-1.5 py-0.5 rounded">
                          {e.ip}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-white/40 font-data">{timeAgo(e.created_at)}</span>
                  </div>

                  <p className="text-white/80 font-medium pt-0.5">{e.detail || e.email || e.path || "-"}</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
