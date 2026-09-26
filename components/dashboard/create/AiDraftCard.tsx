"use client";

import { useState } from "react";
import {
  Sparkles,
  Copy,
  Pencil,
  WandSparkles,
  Check,
  MoreHorizontal,
  ArrowRight,
  Calendar,
  Layers,
  Send,
  Loader2,
  X,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

import { MarkdownRenderer } from "@/components/dashboard/MarkdownRenderer";
import type { ScoreResponse } from "@/app/api/ai/score/route";

interface AiDraftCardProps {
  content?: string;
  hashtags?: string[];
  isGenerating?: boolean;
  scoreData?: ScoreResponse | null;
  onImprove?: () => void;
  onEdit?: () => void;
  onUse?: () => void;
  onGenerateVariations?: () => void;
  onScheduleSuccess?: () => void;
}

const PLATFORMS = [
  { id: "x", name: "X (Twitter)" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "instagram", name: "Instagram" },
  { id: "tiktok", name: "TikTok" },
];

export function AiDraftCard({
  content,
  hashtags = [],
  isGenerating = false,
  scoreData,
  onImprove,
  onEdit,
  onUse,
  onGenerateVariations,
  onScheduleSuccess,
}: AiDraftCardProps) {
  const [copied, setCopied] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["x"]);
  const [scheduleTime, setScheduleTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    const text = hashtags.length
      ? `${content}\n\n${hashtags.map((t) => `#${t.replace("#", "")}`).join(" ")}`
      : content;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard fallback */
    }
  };

  const handleScheduleSubmit = async (instant: boolean = false) => {
    if (!content) return;
    setIsScheduling(true);
    setScheduleError(null);
    try {
      const fullText = hashtags.length
        ? `${content}\n\n${hashtags.map((t) => `#${t.replace("#", "")}`).join(" ")}`
        : content;

      const res = await fetch("/api/posts/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: fullText,
          platforms: selectedPlatforms,
          scheduledAt: instant ? null : scheduleTime ? new Date(scheduleTime).toISOString() : null,
          score: scoreData?.score,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule");

      setScheduleSuccess(true);
      setTimeout(() => {
        setShowScheduleModal(false);
        setScheduleSuccess(false);
        onScheduleSuccess?.();
      }, 1400);
    } catch (err: unknown) {
      setScheduleError(err instanceof Error ? err.message : "Scheduling failed");
    } finally {
      setIsScheduling(false);
    }
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((p) => p !== id) : prev) : [...prev, id]
    );
  };

  /* ── Skeleton ── */
  if (isGenerating) {
    return (
      <section className="min-h-[420px] rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5">
        <div className="mb-8 flex justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-[var(--brand-primary-soft)] skeleton-shimmer" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-20 rounded bg-[var(--panel-fill-2)] skeleton-shimmer" />
              <div className="h-2.5 w-28 rounded bg-[var(--panel-fill-2)] skeleton-shimmer" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[100, 90, 75, 60, 80, 55].map((w, i) => (
            <div
              key={i}
              className="h-3.5 rounded skeleton-shimmer"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>

        {/* Kora thinking state */}
        <div className="mt-8 space-y-2.5">
          {[
            { label: "Checking creator niche & target audience", done: true },
            { label: "Matching Brand Brain voice and memories", done: true },
            { label: "Synthesizing viral hook & content structure", done: false },
            { label: "Evaluating KoraScore rubric before returning", done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2.5 text-[11px]">
              {step.done ? (
                <Check className="h-3.5 w-3.5 text-[var(--success)]" />
              ) : (
                <span className="flex h-3.5 w-3.5 items-center justify-center">
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--brand-primary)]"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                </span>
              )}
              <span className={step.done ? "text-[var(--fg-3)]" : "text-[var(--brand-primary)]"}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ── Empty state ── */
  if (!content) {
    return (
      <section className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--stroke-strong)] bg-[var(--panel-fill)] p-8 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
          <Sparkles className="h-5 w-5" />
        </div>
        <h3 className="text-[15px] font-semibold text-[var(--fg)]">
          Your AI draft will appear here
        </h3>
        <p className="mt-2 max-w-[280px] text-[12px] leading-relaxed text-[var(--fg-4)]">
          Tell Kora what you want to create or pick a viral format to generate content instantly.
        </p>
      </section>
    );
  }

  const scoreColor =
    (scoreData?.score ?? 85) >= 75
      ? "var(--success)"
      : (scoreData?.score ?? 85) >= 50
      ? "var(--sai-gold, #f59e0b)"
      : "var(--danger)";

  /* ── Draft ── */
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)]">
      {/* Score bar */}
      {scoreData && (
        <div className="flex items-center justify-between border-b border-[var(--stroke)] bg-[var(--panel-fill-2)] px-5 py-2.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span
              className="flex h-2 w-2 rounded-full"
              style={{ backgroundColor: scoreColor }}
            />
            <span className="font-semibold text-[var(--fg)]">
              KoraScore: <span style={{ color: scoreColor }}>{scoreData.score}/100</span>
            </span>
            <span className="hidden text-[var(--fg-4)] sm:inline">
              ({scoreData.prediction === "high" ? "High Engagement" : "Moderate Reach"})
            </span>
          </div>
          <div className="text-[10.5px] text-[var(--fg-3)]">
            🎯 Best: <span className="font-medium text-[var(--fg)]">{scoreData.bestTime}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--stroke)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[var(--fg)]">AI Draft</p>
            <p className="text-[10px] text-[var(--fg-4)]">Generated by Kora AI Composing Pipeline</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onGenerateVariations && (
            <button
              onClick={onGenerateVariations}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--brand-primary)] transition-colors hover:brightness-110"
              title="Generate 3 A/B test variations"
            >
              <Layers className="h-3 w-3" />
              A/B Variations
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="text-[13px] leading-[1.8] text-[var(--fg-2)]">
          <MarkdownRenderer content={content} />
        </div>

        {hashtags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-[var(--brand-primary-soft)] px-2.5 py-1.5 text-[10.5px] text-[var(--brand-primary)]"
              >
                #{tag.replace("#", "")}
              </span>
            ))}
          </div>
        )}

        {scoreData?.improvements && scoreData.improvements.length > 0 && (
          <div className="mt-4 rounded-xl border border-[var(--stroke)] bg-[var(--app-bg)] p-3">
            <p className="mb-1 text-[11px] font-semibold text-[var(--fg-2)]">AI Diagnostics</p>
            <ul className="space-y-1 text-[10.5px] text-[var(--fg-3)]">
              {scoreData.improvements.slice(0, 2).map((imp, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[var(--brand-primary)]">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-[var(--stroke)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onImprove}
            className="flex items-center gap-2 rounded-lg border border-[var(--stroke)] px-3 py-2 text-[11px] font-medium text-[var(--fg-3)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
          >
            <WandSparkles className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
            Improve
          </button>

          <button
            onClick={onEdit}
            className="flex items-center gap-2 rounded-lg border border-[var(--stroke)] px-3 py-2 text-[11px] font-medium text-[var(--fg-3)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-lg border border-[var(--stroke)] px-3 py-2 text-[11px] font-medium text-[var(--fg-3)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="ml-auto flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-[11px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              boxShadow: "var(--brand-primary-shadow)",
            }}
          >
            <Calendar className="h-3.5 w-3.5" />
            Schedule / Post
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Schedule Dialog Modal ── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[var(--brand-primary)]" />
                <h3 className="text-[15px] font-semibold text-[var(--fg)]">
                  Schedule Post
                </h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-[var(--fg-4)] hover:text-[var(--fg)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-4 text-[12px] text-[var(--fg-3)]">
              Choose target platforms and schedule time or post immediately.
            </p>

            {/* Platforms */}
            <div className="mb-4">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">
                Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const active = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all ${
                        active
                          ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
                          : "border-[var(--stroke)] text-[var(--fg-3)] hover:text-[var(--fg)]"
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Time */}
            <div className="mb-5">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">
                Schedule Date & Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--app-bg)] px-3 py-2 text-[13px] text-[var(--fg)] outline-none focus:border-[var(--brand-primary)]"
              />
              <p className="mt-1.5 text-[10.5px] text-[var(--fg-4)]">
                Recommended window: {scoreData?.bestTime || "Thursday 8:00 AM WAT"}
              </p>
            </div>

            {scheduleError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-[12px] text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{scheduleError}</span>
              </div>
            )}

            {scheduleSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-[12px] text-emerald-400">
                <Check className="h-4 w-4 shrink-0" />
                <span>Successfully queued to {selectedPlatforms.length} platform(s)!</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleScheduleSubmit(false)}
                disabled={isScheduling}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] py-2.5 text-[12px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
              >
                {isScheduling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                {scheduleTime ? "Schedule Post" : "Queue to Calendar"}
              </button>
              <button
                type="button"
                onClick={() => handleScheduleSubmit(true)}
                disabled={isScheduling}
                className="flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-2.5 text-[12px] font-semibold text-[var(--fg)] hover:bg-[var(--hover)] disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
                Post Now
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

