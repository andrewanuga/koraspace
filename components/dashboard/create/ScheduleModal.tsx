"use client";

import { useState } from "react";
import { Calendar, X, Send, Check, AlertCircle, Loader2 } from "lucide-react";
import type { ScoreResponse } from "@/app/api/ai/score/route";

const PLATFORMS = [
  { id: "x", name: "X (Twitter)" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "instagram", name: "Instagram" },
  { id: "tiktok", name: "TikTok" },
];

interface ScheduleModalProps {
  content: string;
  scoreData?: ScoreResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleModal({
  content,
  scoreData,
  isOpen,
  onClose,
  onSuccess,
}: ScheduleModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["x"]);
  const [scheduleTime, setScheduleTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  if (!isOpen) return null;

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((p) => p !== id) : prev) : [...prev, id]
    );
  };

  const handleScheduleSubmit = async (instant: boolean = false) => {
    if (!content) return;
    setIsScheduling(true);
    setScheduleError(null);
    try {
      const res = await fetch("/api/posts/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms,
          scheduledAt: instant ? null : scheduleTime ? new Date(scheduleTime).toISOString() : null,
          score: scoreData?.score,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule");

      setScheduleSuccess(true);
      setTimeout(() => {
        setScheduleSuccess(false);
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setScheduleError(err instanceof Error ? err.message : "Scheduling failed");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="text-[15px] font-semibold text-[var(--fg)]">
              Schedule to Calendar
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--fg-4)] hover:text-[var(--fg)] p-1 rounded-lg hover:bg-[var(--hover)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-[12px] text-[var(--fg-3)]">
          Select target platforms and choose a date & time or post directly.
        </p>

        {/* Target Platforms */}
        <div className="mb-4">
          <label className="mb-2 block text-[10.5px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">
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
                  className={`rounded-xl border px-3 py-1.5 text-[11.5px] font-medium transition-all ${
                    active
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
                      : "border-[var(--stroke)] text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)]"
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
          <label className="mb-2 block text-[10.5px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">
            Schedule Date & Time (Optional)
          </label>
          <input
            type="datetime-local"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--app-bg)] px-3 py-2 text-[12.5px] text-[var(--fg)] outline-none focus:border-[var(--brand-primary)]"
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
  );
}
