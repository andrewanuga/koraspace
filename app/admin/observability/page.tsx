"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Zap,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Wrench,
  Bot,
  Shield,
  Layers,
} from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";

interface ObservabilityMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  totalCostUsd: number;
  agentBreakdown: Record<
    string,
    {
      executions: number;
      successRate: number;
      avgLatencyMs: number;
      avgIterations: number;
      costUsd: number;
    }
  >;
  toolBreakdown: Record<
    string,
    {
      calls: number;
      successRate: number;
      avgLatencyMs: number;
    }
  >;
}

export default function AIObservabilityDashboard() {
  const [metrics, setMetrics] = useState<ObservabilityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/observability?scope=global");
      if (!res.ok) throw new Error("Failed to load metrics");
      const data = await res.json();
      setMetrics(data.metrics);
    } catch (err) {
      console.error("Error fetching observability metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="AI System Observability"
          sub="Real-time execution telemetry, agent performance profiling, latency percentiles, and cost accounting."
        />
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3.5 py-2 text-xs font-medium text-[var(--fg)] hover:bg-[var(--stroke)]/30 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--fg-4)]">
              Total AI Runs
            </span>
            <Activity className="h-4 w-4 text-[var(--sai-indigo)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--fg)] mt-2">
            {metrics?.totalRequests.toLocaleString() ?? "0"}
          </p>
          <p className="text-xs text-emerald-400 mt-1">
            {metrics?.successRate ?? 100}% success rate
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--fg-4)]">
              Average Latency
            </span>
            <Clock className="h-4 w-4 text-[var(--sai-purple)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--fg)] mt-2">
            {metrics ? (metrics.averageLatencyMs / 1000).toFixed(2) : "0.00"}s
          </p>
          <p className="text-xs text-[var(--fg-3)] mt-1">
            P95: {metrics ? (metrics.p95LatencyMs / 1000).toFixed(2) : "0.00"}s
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--fg-4)]">
              P99 Latency
            </span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-[var(--fg)] mt-2">
            {metrics ? (metrics.p99LatencyMs / 1000).toFixed(2) : "0.00"}s
          </p>
          <p className="text-xs text-[var(--fg-3)] mt-1">
            P50: {metrics ? (metrics.p50LatencyMs / 1000).toFixed(2) : "0.00"}s
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--fg-4)]">
              Estimated Cost
            </span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-[var(--fg)] mt-2">
            ${metrics?.totalCostUsd.toFixed(4) ?? "0.0000"}
          </p>
          <p className="text-xs text-[var(--fg-3)] mt-1">USD across all models</p>
        </GlassCard>
      </div>

      {/* Agents Performance Section */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="h-5 w-5 text-[var(--sai-indigo)]" />
          <h3 className="text-sm font-semibold text-[var(--fg)]">
            Agent Performance Profiling
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics && Object.keys(metrics.agentBreakdown).length > 0 ? (
            Object.entries(metrics.agentBreakdown).map(([agentName, meta]) => (
              <div
                key={agentName}
                className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)]/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[var(--fg)]">
                    {agentName}
                  </span>
                  <Pill tone={meta.successRate >= 95 ? "indigo" : "violet"}>
                    {meta.successRate}% Success
                  </Pill>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--stroke)] text-center">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-[var(--fg-4)]">
                      Executions
                    </p>
                    <p className="text-sm font-bold text-[var(--fg)] mt-0.5">
                      {meta.executions}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-[var(--fg-4)]">
                      Avg Latency
                    </p>
                    <p className="text-sm font-bold text-[var(--fg)] mt-0.5">
                      {(meta.avgLatencyMs / 1000).toFixed(2)}s
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-[var(--fg-4)]">
                      Avg Loops
                    </p>
                    <p className="text-sm font-bold text-[var(--fg)] mt-0.5">
                      {meta.avgIterations}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-6 text-xs text-[var(--fg-4)]">
              No agent telemetry recorded yet in current buffer.
            </div>
          )}
        </div>
      </GlassCard>

      {/* Tools Execution & Reliability Section */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="h-5 w-5 text-[var(--sai-purple)]" />
          <h3 className="text-sm font-semibold text-[var(--fg)]">
            Tool Registry Reliability & Latency
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--stroke)] text-[var(--fg-4)] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Tool Name</th>
                <th className="pb-3 font-semibold">Total Calls</th>
                <th className="pb-3 font-semibold">Success Rate</th>
                <th className="pb-3 font-semibold">Avg Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--stroke)]">
              {metrics && Object.keys(metrics.toolBreakdown).length > 0 ? (
                Object.entries(metrics.toolBreakdown).map(([toolName, meta]) => (
                  <tr key={toolName} className="hover:bg-[var(--panel-fill)]/40 transition-colors">
                    <td className="py-3 font-medium text-[var(--fg)] flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--sai-indigo)]" />
                      {toolName}
                    </td>
                    <td className="py-3 text-[var(--fg-2)]">{meta.calls}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          meta.successRate >= 95 ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {meta.successRate}%
                      </span>
                    </td>
                    <td className="py-3 text-[var(--fg-3)]">
                      {(meta.avgLatencyMs / 1000).toFixed(2)}s
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-[var(--fg-4)]">
                    No tool telemetry logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
