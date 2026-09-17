"use client";

import { Sparkles, Target, Zap, Lightbulb, Check } from "lucide-react";
import type { ContentAnalysis, ContentAngle } from "@/lib/repurpose/types";
import { GlassCard } from "@/components/dashboard/ui";

interface AnalysisCardProps {
  analysis: ContentAnalysis;
  selectedHook?: string;
  onSelectHook?: (hook: string) => void;
  selectedAngle?: string;
  onSelectAngle?: (angleTitle: string) => void;
}

export function AnalysisCard({
  analysis,
  selectedHook,
  onSelectHook,
  selectedAngle,
  onSelectAngle,
}: AnalysisCardProps) {
  return (
    <GlassCard className="overflow-hidden border-[var(--kora-blue-border)] p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--kora-blue-soft)" }}
          >
            <Sparkles className="h-4 w-4" style={{ color: "var(--kora-blue)" }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--fg)]">
              Kora Content Intelligence
            </h3>
            <p className="text-[11px] text-[var(--fg-4)]">
              Extracted insights & angles from your source
            </p>
          </div>
        </div>

        {analysis.tone && (
          <span
            className="rounded-lg px-2.5 py-1 text-[10px] font-semibold"
            style={{
              background: "var(--kora-blue-soft)",
              color: "var(--kora-blue)",
            }}
          >
            Tone: {analysis.tone}
          </span>
        )}
      </div>

      {/* Summary */}
      {analysis.summary && (
        <div className="mb-5 rounded-xl border border-[var(--stroke)] bg-[var(--app-bg)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">
            Core Summary
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--fg-2)]">
            {analysis.summary}
          </p>
        </div>
      )}

      {/* Key Takeaways */}
      {analysis.key_points && analysis.key_points.length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">
            Key Strategic Points
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {analysis.key_points.map((pt, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-2.5 text-xs text-[var(--fg-3)]"
              >
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--success-soft)]">
                  <Check className="h-2.5 w-2.5 text-[var(--success)]" />
                </div>
                <span className="line-clamp-2">{pt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Angles Selection (Phase 3) */}
      {analysis.angles && analysis.angles.length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">
            Choose a Content Angle (Optional)
          </p>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {analysis.angles.map((angle) => {
              const active = selectedAngle === angle.title;
              return (
                <button
                  key={angle.id}
                  type="button"
                  onClick={() => onSelectAngle?.(active ? "" : angle.title)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    active
                      ? "border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)]"
                      : "border-[var(--stroke)] bg-[var(--panel-fill-2)] hover:border-[var(--stroke-strong)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--fg)]">
                      {angle.title}
                    </span>
                    {active && (
                      <div
                        className="flex h-4 w-4 items-center justify-center rounded-full"
                        style={{ background: "var(--brand-primary)" }}
                      >
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-[var(--fg-4)]">
                    {angle.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Viral Hooks Selection */}
      {analysis.hooks && analysis.hooks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">
            Select a Viral Opening Hook
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.hooks.map((hook, idx) => {
              const active = selectedHook === hook;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectHook?.(active ? "" : hook)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-all ${
                    active
                      ? "border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
                      : "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-3)] hover:border-[var(--stroke-strong)] hover:text-[var(--fg)]"
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-1">{hook}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
