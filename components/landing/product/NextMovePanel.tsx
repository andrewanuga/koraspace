"use client";

import { ArrowRight } from "lucide-react";
import { PanelFrame } from "./PanelFrame";

/**
 * The recommendation surface — the end of the loop, where analysis becomes
 * something you can act on. This is the panel the whole page argues toward.
 */
export function NextMovePanel() {
  return (
    <PanelFrame title="Kora Intelligence">
      <div className="rounded-xl border ks-line bg-[var(--ks-panel-raised)] p-4">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--ks-ink-3)]">
          What changed
        </span>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ks-ink-2)]">
          Posts where you explain how something works held attention longer than
          anything else you published this month.
        </p>
      </div>

      <div className="mt-3 rounded-xl border ks-line-accent bg-[var(--ks-accent-soft)] p-4">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--ks-accent-ink)]">
          Next move
        </span>
        <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--ks-ink)]">
          Build next week around the how-to angle, and lead with it on Thursday.
        </p>

        <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-[var(--ks-accent)] px-3.5 py-2 text-[12px] font-bold text-white">
          Generate
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </PanelFrame>
  );
}

export default NextMovePanel;
