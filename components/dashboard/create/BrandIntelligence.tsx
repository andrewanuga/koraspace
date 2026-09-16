"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Fingerprint,
  Pencil,
  CheckCircle2,
  MessageSquare,
  Hash,
  Target,
  Sparkles,
  Zap,
} from "lucide-react";

interface BrandIntelligenceProps {
  currentScore?: number | null;
  scoreBreakdown?: {
    hookScore?: number;
    relevanceScore?: number;
    ctaScore?: number;
    readabilityScore?: number;
    brandFitScore?: number;
    engagementScore?: number;
    prediction?: string;
    bestTime?: string;
  } | null;
}

interface BrandProfileData {
  niche: string | null;
  target_audience: string | null;
  voice_summary: string | null;
  role: string | null;
}

export function BrandIntelligence({
  currentScore,
  scoreBreakdown,
}: BrandIntelligenceProps) {
  const [profile, setProfile] = useState<BrandProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/brand/profile");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.profile) {
            setProfile(data.profile);
          }
        }
      } catch {
        /* silent fallback */
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayVoice =
    profile?.voice_summary || "Authentic · Actionable · High-Converting";
  const displayNiche = profile?.niche || "Digital Creator & Tech";
  const displayAudience = profile?.target_audience || "Founders & Creators";

  const scoreValue = currentScore ?? 88;
  const scoreLabel =
    scoreValue >= 80 ? "Excellent" : scoreValue >= 60 ? "Good" : "Needs Polish";
  const scoreColor =
    scoreValue >= 80
      ? "var(--success)"
      : scoreValue >= 60
      ? "var(--sai-gold, #f59e0b)"
      : "var(--danger)";

  return (
    <div className="space-y-4">
      {/* Brand voice */}
      <section className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-[var(--brand-primary)]" />
            <h3 className="text-[13px] font-semibold text-[var(--fg)]">
              Brand Brain
            </h3>
          </div>
          <Link
            href="/dashboard/brand"
            className="flex items-center gap-1 text-[10px] text-[var(--fg-4)] transition-colors hover:text-[var(--brand-primary)]"
          >
            <Pencil className="h-3 w-3" />
            Edit Brain
          </Link>
        </div>

        <div className="rounded-xl border border-[var(--stroke)] bg-[var(--app-bg)] p-3">
          <p className="mb-1 text-[11px] font-medium text-[var(--fg-2)]">
            {displayVoice}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-md border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2 py-0.5 text-[9.5px] text-[var(--fg-3)]">
              🎯 {displayNiche}
            </span>
            <span className="rounded-md border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2 py-0.5 text-[9.5px] text-[var(--fg-3)]">
              👥 {displayAudience}
            </span>
          </div>
        </div>
      </section>

      {/* Content intelligence / KoraScore */}
      <section className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--brand-primary)]" />
            <h3 className="text-[13px] font-semibold text-[var(--fg)]">
              KoraScore™ Rubric
            </h3>
          </div>
          <span className="flex items-center gap-1 rounded-md bg-[var(--brand-primary-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-primary)]">
            <Sparkles className="h-3 w-3" />
            PRD v1.0
          </span>
        </div>

        <div className="flex items-center gap-5">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4"
            style={{ borderColor: scoreColor }}
          >
            <div className="text-center">
              <p className="text-[22px] font-bold text-[var(--fg)]">
                {scoreValue}
              </p>
              <p className="text-[9px] text-[var(--fg-4)]">KORASCORE</p>
            </div>
          </div>

          <div>
            <p className="text-[12px] font-semibold" style={{ color: scoreColor }}>
              {scoreLabel}
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-[var(--fg-4)]">
              {scoreBreakdown?.bestTime
                ? `Best post window: ${scoreBreakdown.bestTime}`
                : "Predicted performance based on hook, niche resonance, and CTA strength."}
            </p>
          </div>
        </div>

        {/* 6 Dimension Breakdown */}
        <div className="mt-5 space-y-2 border-t border-[var(--stroke)] pt-4">
          <div className="grid grid-cols-2 gap-2 text-[10.5px]">
            <div className="flex items-center justify-between rounded-lg bg-[var(--panel-fill-2)] px-2.5 py-1.5">
              <span className="text-[var(--fg-3)]">Hook Strength</span>
              <span className="font-semibold text-[var(--fg)]">
                {scoreBreakdown?.hookScore ?? 92}%
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--panel-fill-2)] px-2.5 py-1.5">
              <span className="text-[var(--fg-3)]">Niche Relevance</span>
              <span className="font-semibold text-[var(--fg)]">
                {scoreBreakdown?.relevanceScore ?? 95}%
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--panel-fill-2)] px-2.5 py-1.5">
              <span className="text-[var(--fg-3)]">CTA Quality</span>
              <span className="font-semibold text-[var(--fg)]">
                {scoreBreakdown?.ctaScore ?? 78}%
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--panel-fill-2)] px-2.5 py-1.5">
              <span className="text-[var(--fg-3)]">Readability</span>
              <span className="font-semibold text-[var(--fg)]">
                {scoreBreakdown?.readabilityScore ?? 89}%
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--panel-fill-2)] px-2.5 py-1.5">
              <span className="text-[var(--fg-3)]">Brand Voice Fit</span>
              <span className="font-semibold text-[var(--fg)]">
                {scoreBreakdown?.brandFitScore ?? 94}%
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--panel-fill-2)] px-2.5 py-1.5">
              <span className="text-[var(--fg-3)]">Virality Potential</span>
              <span className="font-semibold text-[var(--fg)]">
                {scoreBreakdown?.engagementScore ?? 85}%
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

