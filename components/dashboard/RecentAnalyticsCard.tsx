"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, SlidersHorizontal } from "lucide-react";
import { fmtNum, platformLabel } from "@/lib/dashboard/helpers";
import { DynamicAnalyticsChart } from "@/components/dashboard/DynamicAnalyticsChart";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { ANALYTICS_STYLES, type AnalyticsStyle } from "@/lib/preferences/types";

type DayPoint = {
  label: string;
  views: number;
  engagement: number;
  reach: number;
  followers: number;
};

type PlatformRow = {
  platform: string;
  value: number;
  pct: string;
  positive: boolean;
  color: string;
};

const TABS = [
  { key: "views", label: "Views" },
  { key: "engagement", label: "Engagement" },
  { key: "reach", label: "Reach" },
  { key: "followers", label: "Followers" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function RecentAnalyticsCard({
  series,
  platforms,
}: {
  series: DayPoint[];
  platforms: PlatformRow[];
}) {
  const { preferences, setAnalyticsStyle } = usePreferences();
  const [tab, setTab] = useState<TabKey>("views");
  const [overrideStyle, setOverrideStyle] = useState<AnalyticsStyle | null>(null);
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  const activeStyle = overrideStyle || preferences.analytics_style || "auto";

  const chartData = useMemo(() => {
    return series.map((item) => ({
      label: item.label,
      value: item[tab],
      category: item.label,
    }));
  }, [series, tab]);

  const values = useMemo(() => series.map((item) => item[tab]), [series, tab]);
  const latest = values.at(-1) ?? 0;
  const previous = values.at(-2) ?? latest;

  const change =
    previous > 0
      ? ((latest - previous) / previous) * 100
      : 0;

  return (
    <section className="glass-panel group relative overflow-hidden rounded-2xl border border-[var(--stroke)] p-5 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
              <TrendingUp className="h-4 w-4" />
            </div>

            <div>
              <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">
                Recent analytics
              </h3>
              <p className="mt-0.5 text-[12px] text-[var(--fg-4)]">
                Performance over the last period
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Style Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-2.5 py-1 text-[11px] font-medium text-[var(--fg-3)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span className="capitalize">{activeStyle}</span>
            </button>

            {showStyleMenu && (
              <div className="absolute right-0 top-full mt-1 z-30 w-44 rounded-xl border border-[var(--stroke)] bg-[var(--app-surface)] p-1.5 shadow-2xl backdrop-blur-xl">
                <p className="px-2 py-1 text-[9.5px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">
                  Visualization Style
                </p>
                <div className="space-y-0.5">
                  {ANALYTICS_STYLES.map((styleOpt) => (
                    <button
                      key={styleOpt.id}
                      type="button"
                      onClick={() => {
                        setOverrideStyle(styleOpt.id);
                        setAnalyticsStyle(styleOpt.id);
                        setShowStyleMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                        activeStyle === styleOpt.id
                          ? "bg-[var(--brand-primary)] text-white font-medium"
                          : "text-[var(--fg-2)] hover:bg-[var(--hover)] hover:text-[var(--fg)]"
                      }`}
                    >
                      <span>{styleOpt.title}</span>
                      {activeStyle === styleOpt.id && (
                        <span className="text-[10px] opacity-80">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-1 text-[12px] font-medium text-[var(--brand-primary)] transition-opacity hover:opacity-70"
          >
            View analytics
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_210px]">
        {/* Main Chart Area */}
        <div className="min-w-0">
          {/* Metric Tabs */}
          <div className="mb-4 flex items-center gap-1 overflow-x-auto pb-1">
            {TABS.map((item) => {
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className="relative rounded-lg px-3 py-1.5 text-[11.5px] font-medium transition-all"
                  style={{
                    background: active ? "var(--brand-primary)" : "transparent",
                    color: active ? "#ffffff" : "var(--fg-3)",
                    border: active
                      ? "1px solid var(--brand-primary)"
                      : "1px solid var(--stroke)",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {series.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-[var(--stroke)]">
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--fg-2)]">
                  No analytics yet
                </p>
                <p className="mt-1 text-[12px] text-[var(--fg-4)]">
                  Connect an account to start tracking performance.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Dynamic Chart */}
              <div className="relative h-[220px]">
                <DynamicAnalyticsChart
                  data={chartData}
                  style={activeStyle}
                  height={220}
                  metricLabel={tab}
                />
              </div>

              {/* Summary */}
              <div className="mt-5 flex items-center gap-4 border-t border-[var(--stroke)] pt-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--fg-4)]">
                    Latest
                  </p>
                  <p className="mt-1 text-[20px] font-semibold text-[var(--fg)]">
                    {fmtNum(latest)}
                  </p>
                </div>

                <div className="h-8 w-px bg-[var(--stroke)]" />

                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--fg-4)]">
                    Change
                  </p>
                  <p
                    className="mt-1 text-[13px] font-semibold"
                    style={{
                      color: change >= 0 ? "#34d399" : "#f87171",
                    }}
                  >
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(1)}%
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Platforms Sidebar */}
        <aside className="border-t border-[var(--stroke)] pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-data text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--fg-4)]">
              Top platforms
            </p>
            <span className="text-[10px] text-[var(--fg-4)]">
              This period
            </span>
          </div>

          {platforms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--stroke)] p-4 text-center">
              <p className="text-[12px] text-[var(--fg-4)]">
                No accounts connected.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {platforms.map((platform) => (
                <div
                  key={platform.platform}
                  className="group/platform rounded-xl border border-transparent p-3 transition-all hover:border-[var(--stroke)] hover:bg-[var(--hover)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ background: platform.color }}
                      />
                      <span className="truncate text-[12px] font-medium text-[var(--fg-2)]">
                        {platformLabel(platform.platform)}
                      </span>
                    </div>

                    <span className="text-[12px] font-medium text-[var(--fg)]">
                      {fmtNum(platform.value)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--panel-fill-2)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              8,
                              (platform.value /
                                Math.max(
                                  ...platforms.map((item) => item.value),
                                  1
                                )) *
                                100
                            )
                          )}%`,
                          background: platform.color,
                        }}
                      />
                    </div>

                    <span
                      className="ml-3 text-[10.5px] font-medium"
                      style={{
                        color: platform.positive ? "#34d399" : "#f87171",
                      }}
                    >
                      {platform.pct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}