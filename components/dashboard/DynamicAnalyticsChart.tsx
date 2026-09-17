"use client";

import React, { useMemo, useState } from "react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { useWorkspace } from "@/components/dashboard/WorkspaceProvider";
import type { AnalyticsStyle } from "@/lib/preferences/types";

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  category?: string;
  change?: string;
  color?: string;
}

interface DynamicAnalyticsChartProps {
  data: ChartDataPoint[] | number[];
  style?: AnalyticsStyle;
  height?: number;
  metricLabel?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
}

export function DynamicAnalyticsChart({
  data,
  style: explicitStyle,
  height = 240,
  metricLabel = "Value",
  valuePrefix = "",
  valueSuffix = "",
  className = "",
}: DynamicAnalyticsChartProps) {
  const { preferences } = usePreferences();
  const { persona } = useWorkspace();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Normalize data points
  const normalizedData: ChartDataPoint[] = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { label: "Mon", value: 120 },
        { label: "Tue", value: 180 },
        { label: "Wed", value: 240 },
        { label: "Thu", value: 310 },
        { label: "Fri", value: 290 },
        { label: "Sat", value: 420 },
        { label: "Sun", value: 510 },
      ];
    }
    if (typeof data[0] === "number") {
      const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Next", "Later"];
      return (data as number[]).map((val, idx) => ({
        label: labels[idx % labels.length],
        value: val,
      }));
    }
    return data as ChartDataPoint[];
  }, [data]);

  // Color theme: Blue for marketer, Pink for creator/default
  const isMarketer = persona === "marketer";
  const primaryColor = isMarketer ? "#3b82f6" : "#ff0a8a";
  const secondaryColor = isMarketer ? "#06b6d4" : "#8b5cf6";
  const tertiaryColor = isMarketer ? "#8b5cf6" : "#f59e0b";

  // Resolve style: if 'auto', pick based on dataset length and characteristics
  const activeStyle: AnalyticsStyle = useMemo(() => {
    const chosen = explicitStyle || preferences.analytics_style || "auto";
    if (chosen !== "auto") return chosen;

    // Smart heuristic:
    if (normalizedData.length <= 5 && normalizedData.every((d) => d.category || normalizedData.length <= 4)) {
      return "donut";
    }
    if (normalizedData.length >= 7) {
      return "area";
    }
    return "bar";
  }, [explicitStyle, preferences.analytics_style, normalizedData]);

  // Calculate statistics
  const values = normalizedData.map((d) => d.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;
  const totalSum = values.reduce((acc, curr) => acc + curr, 0);

  /* -------------------------------------------------------------------------- */
  /*                               1. LINE CHART                                */
  /* -------------------------------------------------------------------------- */
  const renderLineChart = () => {
    const chartWidth = 640;
    const chartHeight = height;
    const padding = 24;
    const innerW = chartWidth - padding * 2;
    const innerH = chartHeight - padding * 2;

    const points = normalizedData.map((d, i) => {
      const x = padding + (i / Math.max(normalizedData.length - 1, 1)) * innerW;
      const y = padding + innerH - ((d.value - minValue) / range) * innerH;
      return { x, y, data: d };
    });

    const pathD = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    return (
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={primaryColor} />
              <stop offset="100%" stopColor={secondaryColor} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              x2={chartWidth - padding}
              y1={padding + innerH * ratio}
              y2={padding + innerH * ratio}
              stroke="var(--stroke)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          ))}

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGlow)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, idx) => (
            <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoverIndex(idx)} onMouseLeave={() => setHoverIndex(null)}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === idx ? 6 : 4}
                fill={hoverIndex === idx ? "#ffffff" : primaryColor}
                stroke={primaryColor}
                strokeWidth="2"
                className="transition-all duration-200"
              />
            </g>
          ))}
        </svg>

        {/* Bottom Labels */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-between px-6">
          {normalizedData.map((d, i) => (
            <span key={i} className="text-[10.5px] font-medium text-[var(--fg-4)]">
              {d.label}
            </span>
          ))}
        </div>

        {/* Hover Tooltip */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="pointer-events-none absolute top-2 rounded-lg border border-[var(--stroke)] bg-[var(--app-surface)] px-2.5 py-1 text-xs shadow-lg backdrop-blur-md"
            style={{
              left: `${(points[hoverIndex].x / chartWidth) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="text-[10px] text-[var(--fg-3)]">{points[hoverIndex].data.label}</p>
            <p className="font-semibold text-[var(--fg)]">
              {valuePrefix}
              {points[hoverIndex].data.value.toLocaleString()}
              {valueSuffix}
            </p>
          </div>
        )}
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                                2. BAR CHART                                */
  /* -------------------------------------------------------------------------- */
  const renderBarChart = () => {
    return (
      <div className="flex h-full w-full flex-col justify-end gap-2 pt-6" style={{ height }}>
        <div className="flex h-[80%] items-end justify-between gap-2 px-2 sm:gap-4">
          {normalizedData.map((item, idx) => {
            const pct = Math.max(((item.value - minValue) / range) * 100, 8);
            const isHovered = hoverIndex === idx;

            return (
              <div
                key={idx}
                className="group relative flex flex-1 flex-col items-center h-full justify-end cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="pointer-events-none absolute -top-8 z-10 whitespace-nowrap rounded-lg border border-[var(--stroke)] bg-[var(--app-surface)] px-2 py-1 text-[11px] shadow-lg backdrop-blur-md">
                    <span className="font-semibold text-[var(--fg)]">
                      {valuePrefix}
                      {item.value.toLocaleString()}
                      {valueSuffix}
                    </span>
                  </div>
                )}

                <div
                  className="w-full max-w-[48px] rounded-t-lg transition-all duration-300"
                  style={{
                    height: `${pct}%`,
                    background: isHovered
                      ? primaryColor
                      : `linear-gradient(180deg, ${primaryColor}cc 0%, ${primaryColor}33 100%)`,
                    boxShadow: isHovered ? `0 0 15px ${primaryColor}66` : "none",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Labels row */}
        <div className="flex justify-between border-t border-[var(--stroke)] pt-2 px-2">
          {normalizedData.map((d, i) => (
            <span key={i} className="flex-1 text-center text-[10.5px] font-medium text-[var(--fg-4)]">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                                3. AREA CHART                               */
  /* -------------------------------------------------------------------------- */
  const renderAreaChart = () => {
    const chartWidth = 640;
    const chartHeight = height;
    const padding = 20;
    const innerW = chartWidth - padding * 2;
    const innerH = chartHeight - padding * 2 - 15;

    const points = normalizedData.map((d, i) => {
      const x = padding + (i / Math.max(normalizedData.length - 1, 1)) * innerW;
      const y = padding + innerH - ((d.value - minValue) / range) * innerH;
      return { x, y, data: d };
    });

    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    const areaPath = `
      ${linePath}
      L ${points[points.length - 1].x.toFixed(1)} ${padding + innerH}
      L ${points[0].x.toFixed(1)} ${padding + innerH}
      Z
    `;

    return (
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.38" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Crest line */}
          <path
            d={linePath}
            fill="none"
            stroke={primaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === idx ? 5 : 3.5}
              fill={hoverIndex === idx ? "#fff" : primaryColor}
              stroke="var(--app-surface)"
              strokeWidth="2"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
              className="cursor-pointer transition-all"
            />
          ))}
        </svg>

        {/* Labels */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-between px-5">
          {normalizedData.map((d, i) => (
            <span key={i} className="text-[10px] font-medium text-[var(--fg-4)]">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                               4. DONUT CHART                               */
  /* -------------------------------------------------------------------------- */
  const renderDonutChart = () => {
    const size = Math.min(height, 240);
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const colors = [
      primaryColor,
      secondaryColor,
      tertiaryColor,
      "#10b981",
      "#f43f5e",
      "#a855f7",
      "#64748b",
    ];

    let cumulativePct = 0;
    const slices = normalizedData.map((item, idx) => {
      const pct = totalSum > 0 ? item.value / totalSum : 1 / normalizedData.length;
      const strokeDashoffset = circumference - pct * circumference;
      const rotation = cumulativePct * 360;
      cumulativePct += pct;

      return {
        ...item,
        pct: Math.round(pct * 100),
        color: colors[idx % colors.length],
        strokeDashoffset,
        rotation,
      };
    });

    return (
      <div className="flex h-full w-full flex-col sm:flex-row items-center justify-around gap-4" style={{ height }}>
        {/* SVG Ring */}
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="var(--stroke)"
              strokeWidth={strokeWidth}
            />
            {slices.map((slice, idx) => (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={slice.strokeDashoffset}
                style={{
                  transformOrigin: "center",
                  transform: `rotate(${slice.rotation}deg)`,
                }}
                className="transition-all duration-500 cursor-pointer hover:opacity-80"
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            ))}
          </svg>

          {/* Center metric */}
          <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase tracking-wider text-[var(--fg-4)]">
              {hoverIndex !== null ? slices[hoverIndex]?.label : "Total"}
            </span>
            <span className="font-display text-lg font-bold text-[var(--fg)]">
              {hoverIndex !== null
                ? `${slices[hoverIndex]?.pct}%`
                : totalSum.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2">
          {slices.map((slice, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1 text-xs transition-colors cursor-pointer"
              style={{
                background: hoverIndex === idx ? "var(--hover)" : "transparent",
              }}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: slice.color }} />
              <span className="min-w-0 flex-1 truncate font-medium text-[var(--fg-2)]">{slice.label}</span>
              <span className="font-mono text-[11px] font-semibold text-[var(--fg)]">{slice.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                              5. SCATTER PLOT                               */
  /* -------------------------------------------------------------------------- */
  const renderScatterPlot = () => {
    const chartW = 600;
    const chartH = height;
    const pad = 25;

    return (
      <div className="relative w-full" style={{ height }}>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="h-full w-full overflow-visible" preserveAspectRatio="none">
          {/* Axis lines */}
          <line x1={pad} y1={chartH - pad} x2={chartW - pad} y2={chartH - pad} stroke="var(--stroke)" strokeWidth="1" />
          <line x1={pad} y1={pad} x2={pad} y2={chartH - pad} stroke="var(--stroke)" strokeWidth="1" />

          {/* Dots */}
          {normalizedData.map((d, i) => {
            const x = pad + ((i + 0.5) / normalizedData.length) * (chartW - pad * 2);
            const y = pad + (chartH - pad * 2) * (1 - (d.value - minValue) / range);
            const r = 5 + (d.value / maxValue) * 5;

            return (
              <g key={i} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)} className="cursor-pointer">
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={primaryColor}
                  fillOpacity="0.7"
                  stroke="#fff"
                  strokeWidth="1.5"
                  className="transition-all hover:scale-125"
                />
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-1 right-4 text-[10px] text-[var(--fg-4)]">
          Index Correlation
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                               6. FUNNEL CHART                              */
  /* -------------------------------------------------------------------------- */
  const renderFunnelChart = () => {
    const stages = normalizedData.slice(0, 5);
    const topValue = stages[0]?.value || 1;

    return (
      <div className="flex h-full w-full flex-col justify-center gap-2.5 px-3" style={{ height }}>
        {stages.map((stage, idx) => {
          const widthPct = Math.max((stage.value / topValue) * 100, 20);
          const dropOff = idx > 0 ? Math.round((1 - stage.value / stages[idx - 1].value) * 100) : 0;

          return (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[var(--fg-2)]">{stage.label}</span>
                <span className="font-mono text-[var(--fg)]">
                  {valuePrefix}
                  {stage.value.toLocaleString()}
                  {valueSuffix}
                  {idx > 0 && dropOff > 0 && (
                    <span className="ml-2 text-[10px] text-red-400">-{dropOff}%</span>
                  )}
                </span>
              </div>

              <div className="h-5 w-full rounded-md bg-[var(--stroke)] overflow-hidden">
                <div
                  className="h-full rounded-md transition-all duration-500"
                  style={{
                    width: `${widthPct}%`,
                    background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                               7. RADAR CHART                               */
  /* -------------------------------------------------------------------------- */
  const renderRadarChart = () => {
    const size = Math.min(height, 240);
    const center = size / 2;
    const radius = size * 0.38;
    const count = Math.max(normalizedData.length, 3);

    const getCoord = (value: number, index: number, maxV: number) => {
      const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
      const r = (value / maxV) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      };
    };

    const polyPoints = normalizedData
      .map((d, i) => {
        const { x, y } = getCoord(d.value, i, maxValue);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    return (
      <div className="flex h-full w-full items-center justify-center" style={{ height }}>
        <div className="relative" style={{ width: size, height: size }}>
          <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full">
            {/* Concentric webs */}
            {[0.25, 0.5, 0.75, 1].map((scale) => {
              const gridPoints = Array.from({ length: count })
                .map((_, i) => {
                  const { x, y } = getCoord(maxValue * scale, i, maxValue);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(" ");

              return (
                <polygon
                  key={scale}
                  points={gridPoints}
                  fill="none"
                  stroke="var(--stroke)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Axis spokes */}
            {normalizedData.map((_, i) => {
              const { x, y } = getCoord(maxValue, i, maxValue);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="var(--stroke)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Radar Polygon */}
            <polygon
              points={polyPoints}
              fill={primaryColor}
              fillOpacity="0.3"
              stroke={primaryColor}
              strokeWidth="2"
            />

            {/* Vertices */}
            {normalizedData.map((d, i) => {
              const { x, y } = getCoord(d.value, i, maxValue);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#ffffff"
                  stroke={primaryColor}
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative w-full ${className}`}>
      {activeStyle === "line" && renderLineChart()}
      {activeStyle === "bar" && renderBarChart()}
      {activeStyle === "area" && renderAreaChart()}
      {activeStyle === "donut" && renderDonutChart()}
      {activeStyle === "scatter" && renderScatterPlot()}
      {activeStyle === "funnel" && renderFunnelChart()}
      {activeStyle === "radar" && renderRadarChart()}
    </div>
  );
}
