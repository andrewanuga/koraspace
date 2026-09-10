"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Pencil, Send, Sparkles, Loader2, Save, Calendar, ArrowRight } from "lucide-react";
import type { RepurposeOutput } from "@/lib/repurpose/types";
import { REPURPOSE_PLATFORMS } from "@/lib/repurpose/platforms";
import { GlassCard } from "@/components/dashboard/ui";
import { useToast } from "@/components/ui/toast";

export function RepurposeResults({
  outputs,
  onUpdate,
}: {
  outputs: RepurposeOutput[];
  onUpdate: (outputs: RepurposeOutput[]) => void;
}) {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [activeId, setActiveId] = useState(outputs[0]?.id);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  const active = outputs.find((output) => output.id === activeId) || outputs[0];
  if (!active) return null;

  const platform = REPURPOSE_PLATFORMS.find((p) => p.id === active.platform);
  const Icon = platform?.icon;

  /* -- Copy to clipboard -- */
  async function copyContent() {
    if (!active.content) return;
    await navigator.clipboard.writeText(active.content);
    setCopied(true);
    success("Copied to clipboard", `Formatted for ${platform?.label || "social"}.`);
    setTimeout(() => setCopied(false), 2000);
  }

  /* -- Save edits (Phase 1 & 4) -- */
  async function saveEdits() {
    setSaving(true);
    try {
      const res = await fetch(`/api/repurpose/output/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: active.content,
          caption: active.caption,
          hashtags: active.hashtags,
        }),
      });

      if (!res.ok) throw new Error("Failed to save changes");
      success("Draft saved", "Your edits have been saved.");
    } catch (err: any) {
      toastError("Could not save", err.message);
    } finally {
      setSaving(false);
    }
  }

  /* -- Send to Create Workspace (Phase 4) -- */
  function sendToCreate() {
    const query = new URLSearchParams({
      idea: active.content?.slice(0, 1000) || "",
      format: active.platform,
    }).toString();
    router.push(`/dashboard/create?${query}`);
  }

  /* -- Send to Scheduler / Calendar (Phase 4) -- */
  async function sendToScheduler() {
    setScheduling(true);
    try {
      const res = await fetch(`/api/repurpose/output/${active.id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: active.content,
          platform: active.platform,
        }),
      });

      if (!res.ok) throw new Error("Failed to schedule");
      success("Scheduled!", "Added to your social calendar.");
      router.push("/dashboard/calendar");
    } catch (err: any) {
      toastError("Scheduling issue", "Redirecting to calendar...");
      router.push("/dashboard/calendar");
    } finally {
      setScheduling(false);
    }
  }

  return (
    <GlassCard className="overflow-hidden">
      {/* -- Top Tabs -- */}
      <div className="border-b border-[var(--stroke)] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: "var(--brand-primary)" }} />
            <h2 className="text-sm font-semibold text-[var(--fg)]">
              Your Repurposed Content
            </h2>
          </div>
          <span className="text-xs text-[var(--fg-4)]">
            {outputs.length} formats ready
          </span>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {outputs.map((output) => {
            const item = REPURPOSE_PLATFORMS.find((p) => p.id === output.platform);
            const activeTab = active.id === output.id;

            return (
              <button
                key={output.id}
                onClick={() => setActiveId(output.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
                  activeTab
                    ? "border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
                    : "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)]"
                }`}
              >
                {item && <item.icon className="h-3.5 w-3.5" />}
                {item?.label || output.platform}
              </button>
            );
          })}
        </div>
      </div>

      {/* -- Editor Body -- */}
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--brand-primary-border)]"
                style={{ background: "var(--brand-primary-soft)" }}
              >
                <Icon className="h-5 w-5" style={{ color: "var(--brand-primary)" }} />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-[var(--fg)]">
                {platform?.label || active.platform}
              </p>
              <p className="text-xs text-[var(--fg-4)]">
                {platform?.description || "Generated for this platform"}
              </p>
            </div>
          </div>

          <button
            onClick={saveEdits}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-1.5 text-xs text-[var(--fg-3)] hover:text-[var(--fg)] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Draft
          </button>
        </div>

        <textarea
          value={active.content || ""}
          onChange={(e) => {
            const nextContent = e.target.value;
            onUpdate(
              outputs.map((output) =>
                output.id === active.id
                  ? { ...output, content: nextContent }
                  : output
              )
            );
          }}
          className="min-h-[380px] w-full resize-y rounded-2xl border border-[var(--stroke)] bg-[var(--app-bg)] p-5 text-sm leading-relaxed text-[var(--fg)] outline-none transition-all focus:border-[var(--brand-primary-border)] focus:ring-2 focus:ring-[var(--brand-primary-soft)]"
        />

        {/* -- Action Buttons (Phase 4) -- */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={copyContent}
            className="flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-4 py-2.5 text-xs font-semibold text-[var(--fg)] transition-colors hover:bg-[var(--hover)]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-[var(--success)]" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>

          <button
            onClick={sendToCreate}
            className="flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-4 py-2.5 text-xs font-semibold text-[var(--fg)] transition-colors hover:bg-[var(--hover)]"
          >
            <Pencil className="h-4 w-4" />
            Edit in Create
          </button>

          <button
            onClick={sendToScheduler}
            disabled={scheduling}
            className="ml-auto flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 shadow-[var(--brand-primary-shadow)]"
            style={{ background: "var(--brand-primary)" }}
          >
            {scheduling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                Send to Scheduler
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
