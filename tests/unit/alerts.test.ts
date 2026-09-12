import { describe, it, expect } from "vitest";
import { AIAlertEngine } from "@/lib/ai/core/alerts";
import type { ObservabilityMetrics } from "@/lib/ai/core/telemetry";

describe("AIAlertEngine & Production Health Monitor", () => {
  const healthyMetrics: ObservabilityMetrics = {
    totalRequests: 100,
    successfulRequests: 99,
    failedRequests: 1,
    successRate: 99.0,
    averageLatencyMs: 1200,
    p50LatencyMs: 800,
    p95LatencyMs: 2500,
    p99LatencyMs: 4000,
    totalCostUsd: 12.5,
    agentBreakdown: {},
    toolBreakdown: {
      web_scraper: { calls: 20, successRate: 98.0, avgLatencyMs: 900 },
    },
  };

  it("should return zero alerts for healthy metrics within SLA", () => {
    const alerts = AIAlertEngine.evaluate(healthyMetrics, { monthlyBudgetUsd: 100 });
    expect(alerts.length).toBe(0);
  });

  it("should trigger warning when error rate exceeds 5.0%", () => {
    const degradedMetrics: ObservabilityMetrics = {
      ...healthyMetrics,
      successRate: 92.0, // 8% error rate
    };

    const alerts = AIAlertEngine.evaluate(degradedMetrics);
    expect(alerts.some((a) => a.code === "WARN_HIGH_ERROR_RATE")).toBe(true);
  });

  it("should trigger warning when P95 latency exceeds 8.0 seconds", () => {
    const slowMetrics: ObservabilityMetrics = {
      ...healthyMetrics,
      p95LatencyMs: 9500, // 9.5s
    };

    const alerts = AIAlertEngine.evaluate(slowMetrics);
    expect(alerts.some((a) => a.code === "WARN_HIGH_LATENCY")).toBe(true);
  });

  it("should trigger critical alert when monthly spend reaches budget limit", () => {
    const maxedMetrics: ObservabilityMetrics = {
      ...healthyMetrics,
      totalCostUsd: 105.0,
    };

    const alerts = AIAlertEngine.evaluate(maxedMetrics, { monthlyBudgetUsd: 100.0 });
    expect(alerts.some((a) => a.code === "CRIT_BUDGET_EXHAUSTED")).toBe(true);
  });
});
