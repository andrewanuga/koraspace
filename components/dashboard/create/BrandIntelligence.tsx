"use client";

import {
  Fingerprint,
  Pencil,
  CheckCircle2,
  MessageSquare,
  Hash,
  Target,
} from "lucide-react";

export function BrandIntelligence() {
  return (
    <div className="space-y-4">
      {/* Brand voice */}
      <section className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-[var(--kora-blue)]" />
            <h3 className="text-[13px] font-semibold text-[var(--fg)]">
              Brand voice
            </h3>
          </div>
          <button className="flex items-center gap-1 text-[10px] text-[var(--fg-4)] transition-colors hover:text-[var(--kora-pink)]">
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        </div>

        <div className="rounded-xl border border-[var(--stroke)] bg-[var(--app-bg)] p-3">
          <p className="mb-2 text-[11px] font-medium text-[var(--fg-2)]">
            Friendly · Motivational · Authentic
          </p>
          <p className="text-[10.5px] leading-relaxed text-[var(--fg-4)]">
            Your content feels personal, optimistic and helpful. You speak
            directly to your audience without sounding overly formal.
          </p>
        </div>
      </section>

      {/* Content intelligence */}
      <section className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5">
        <div className="mb-5 flex items-center gap-2">
          <Target className="h-4 w-4 text-[var(--kora-blue)]" />
          <h3 className="text-[13px] font-semibold text-[var(--fg)]">
            Content intelligence
          </h3>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-[var(--kora-blue)]">
            <div className="text-center">
              <p className="text-[22px] font-bold text-[var(--fg)]">92</p>
              <p className="text-[9px] text-[var(--fg-4)]">SCORE</p>
            </div>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-[var(--success)]">
              Excellent
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-[var(--fg-4)]">
              Strong potential based on your audience and content history.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          {[
            { label: "Clear message",               icon: MessageSquare },
            { label: "Relevant hashtags",            icon: Hash },
            { label: "Strong engagement potential",  icon: CheckCircle2 },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 text-[10.5px] text-[var(--fg-3)]">
              <Icon className="h-3.5 w-3.5 text-[var(--success)]" />
              {label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
