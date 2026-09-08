"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { fmtNum, platformLabel } from "@/lib/dashboard/helpers";

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

function buildPath(
  values: number[],
  width: number,
  height: number,
  padding = 8
) {
  if (!values.length) {
    return {
      line: "",
      area: "",
      points: [] as { x: number; y: number; value: number }[],
    };
  }

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const stepX =
    values.length > 1 ? chartWidth / (values.length - 1) : 0;

  const points = values.map((value, index) => {
    const x = padding + index * stepX;
    const y =
      padding +
      chartHeight -
      ((value - min) / range) * chartHeight;

    return {
      x,
      y,
      value,
    };
  });

  const line = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(
          1
        )} ${point.y.toFixed(1)}`
    )
    .join(" ");

  const area = `${line} L${points[
    points.length - 1
  ].x.toFixed(1)} ${height - padding} L${padding} ${
    height - padding
  } Z`;

  return {
    line,
    area,
    points,
  };
}

export function RecentAnalyticsCard({
  series,
  platforms,
}: {
  series: DayPoint[];
  platforms: PlatformRow[];
}) {
  const [tab, setTab] = useState<TabKey>("views");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const values = useMemo(
    () => series.map((item) => item[tab]),
    [series, tab]
  );

  const { line, area, points } = useMemo(
    () => buildPath(values, 640, 220),
    [values]
  );

  const latest = values.at(-1) ?? 0;
  const previous = values.at(-2) ?? latest;

  const change =
    previous > 0
      ? ((latest - previous) / previous) * 100
      : 0;

  const hoveredPoint =
    hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <section className="glass-panel group relative overflow-hidden rounded-2xl border border-[var(--stroke)] p-5 sm:p-6">
      {/* Header */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: "rgba(59,130,246,0.10)",
                border: "1px solid rgba(59,130,246,0.18)",
              }}
            >
              <TrendingUp
                className="h-4 w-4"
                style={{ color: "#3b82f6" }}
              />
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

        <Link
          href="/dashboard/analytics"
          className="flex items-center gap-1 text-[12px] font-medium text-[#ec4899] transition-opacity hover:opacity-70"
        >
          View analytics
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_210px]">
        {/* Chart */}

        <div className="min-w-0">
          {/* Tabs */}

          <div className="mb-5 flex items-center gap-1 overflow-x-auto pb-1">
            {TABS.map((item) => {
              const active = tab === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setTab(item.key);
                    setHoverIndex(null);
                  }}
                  className="relative rounded-lg px-3 py-1.5 text-[11.5px] font-medium transition-all"
                  style={{
                    background: active
                      ? "#ec4899"
                      : "transparent",
                    color: active
                      ? "#ffffff"
                      : "var(--fg-3)",
                    border: active
                      ? "1px solid #ec4899"
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
              {/* Chart */}

              <div className="relative h-[220px]">
                <svg
                  viewBox="0 0 640 220"
                  className="h-full w-full overflow-visible"
                  preserveAspectRatio="none"
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  {/* Grid */}

                  {[0, 1, 2, 3].map((row) => {
                    const y = 8 + row * 68;

                    return (
                      <line
                        key={row}
                        x1="8"
                        x2="632"
                        y1={y}
                        y2={y}
                        stroke="var(--stroke)"
                        strokeWidth="1"
                        strokeDasharray="3 5"
                      />
                    );
                  })}

                  {/* Area */}

                  <path
                    d={area}
                    fill="rgba(59,130,246,0.07)"
                  />

                  {/* Main line */}

                  <path
                    d={line}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Hover columns */}

                  {points.map((point, index) => (
                    <g
                      key={index}
                      onMouseEnter={() =>
                        setHoverIndex(index)
                      }
                      className="cursor-pointer"
                    >
                      <rect
                        x={point.x - 24}
                        y="0"
                        width="48"
                        height="220"
                        fill="transparent"
                      />

                      {hoverIndex === index && (
                        <>
                          <line
                            x1={point.x}
                            x2={point.x}
                            y1="8"
                            y2="212"
                            stroke="rgba(255,255,255,0.12)"
                            strokeDasharray="4 4"
                          />

                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="5"
                            fill="#121212"
                            stroke="#3b82f6"
                            strokeWidth="2.5"
                          />
                        </>
                      )}
                    </g>
                  ))}
                </svg>

                {/* Tooltip */}

                {hoveredPoint && hoverIndex !== null && (
                  <div
                    className="pointer-events-none absolute z-10 rounded-lg px-3 py-2 shadow-xl"
                    style={{
                      left: `${(hoveredPoint.x / 640) * 100}%`,
                      top: `${(hoveredPoint.y / 220) * 100}%`,
                      transform: "translate(-50%, -120%)",
                      background: "#181818",
                      border: "1px solid var(--stroke)",
                    }}
                  >
                    <p className="text-[10px] text-[var(--fg-4)]">
                      {series[hoverIndex]?.label}
                    </p>

                    <p className="mt-0.5 text-[12px] font-semibold text-[var(--fg)]">
                      {fmtNum(hoveredPoint.value)}
                    </p>
                  </div>
                )}
              </div>

              {/* X labels */}

              <div className="mt-2 flex justify-between px-1 text-[10.5px] text-[var(--fg-4)]">
                {series.map((item, index) => (
                  <span key={`${item.label}-${index}`}>
                    {item.label}
                  </span>
                ))}
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
                      color:
                        change >= 0
                          ? "#34d399"
                          : "#f87171",
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

        {/* Platforms */}

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
                        style={{
                          background: platform.color,
                        }}
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
                                  ...platforms.map(
                                    (item) => item.value
                                  ),
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
                        color: platform.positive
                          ? "#34d399"
                          : "#f87171",
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