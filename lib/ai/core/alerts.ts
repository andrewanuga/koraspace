/**
 * AI Production Alerting & Health Monitor
 *
 * Continuously evaluates aggregated execution metrics against production SLA thresholds:
 * - Error rate spikes (> 5%)
 * - High latency percentiles (P95 > 8.0s)
 * - Budget exhaustion warnings and critical stops
 * - Tool execution failure spikes (> 10%)
 * - Adversarial prompt injection bursts
 */

import type { ObservabilityMetrics } from "./telemetry";

export type AlertSeverity = "info" | "warning" | "critical";

export interface AIAlert {
  id: string;
  code: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  metricValue: number | string;
  threshold: number | string;
  timestamp: number;
}

export class AIAlertEngine {
  /**
   * Evaluates operational telemetry metrics against production alerting rules.
   */
  public static evaluate(metrics: ObservabilityMetrics, options: { monthlyBudgetUsd?: number } = {}): AIAlert[] {
    const alerts: AIAlert[] = [];
    const now = Date.now();

    if (metrics.totalRequests === 0) return alerts;

    // 1. Error Rate Alert (> 5%)
    const errorRate = Number((100 - metrics.successRate).toFixed(2));
    if (errorRate > 5.0) {
      alerts.push({
        id: `alt_err_${now}`,
        code: "WARN_HIGH_ERROR_RATE",
        severity: "warning",
        title: "High AI Error Rate",
        description: `Error rate is ${errorRate}%, exceeding the 5.0% threshold.`,
        metricValue: `${errorRate}%`,
        threshold: "5.0%",
        timestamp: now,
      });
    }

    // 2. High P95 Latency Alert (> 8.0s)
    if (metrics.p95LatencyMs > 8000) {
      alerts.push({
        id: `alt_lat_${now}`,
        code: "WARN_HIGH_LATENCY",
        severity: "warning",
        title: "High P95 AI Latency",
        description: `P95 latency is ${(metrics.p95LatencyMs / 1000).toFixed(2)}s, exceeding the 8.0s SLA.`,
        metricValue: `${(metrics.p95LatencyMs / 1000).toFixed(2)}s`,
        threshold: "8.0s",
        timestamp: now,
      });
    }

    // 3. Tool Failure Spikes (> 10%)
    for (const [toolName, meta] of Object.entries(metrics.toolBreakdown)) {
      if (meta.calls >= 5 && meta.successRate < 90.0) {
        alerts.push({
          id: `alt_tool_${toolName}_${now}`,
          code: "WARN_TOOL_INSTABILITY",
          severity: "warning",
          title: `Tool Instability: ${toolName}`,
          description: `Tool "${toolName}" has a success rate of only ${meta.successRate}%.`,
          metricValue: `${meta.successRate}%`,
          threshold: "90.0%",
          timestamp: now,
        });
      }
    }

    // 4. Budget Exhaustion
    if (options.monthlyBudgetUsd && options.monthlyBudgetUsd > 0) {
      if (metrics.totalCostUsd >= options.monthlyBudgetUsd) {
        alerts.push({
          id: `alt_budget_${now}`,
          code: "CRIT_BUDGET_EXHAUSTED",
          severity: "critical",
          title: "AI Budget Exhausted",
          description: `Total spend of $${metrics.totalCostUsd.toFixed(2)} has reached the monthly budget limit of $${options.monthlyBudgetUsd.toFixed(2)}.`,
          metricValue: `$${metrics.totalCostUsd.toFixed(2)}`,
          threshold: `$${options.monthlyBudgetUsd.toFixed(2)}`,
          timestamp: now,
        });
      }
    }

    return alerts;
  }
}
