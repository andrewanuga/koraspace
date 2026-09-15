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
      <div className="rounded-xl border border-white/[0.08] bg-[#181818] p-4">
        <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">
          What changed
        </span>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">
          Posts where you explain how something works held attention longer than
          anything else you published this month.
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-[#ff0a8a]/30 bg-[#ff0a8a]/[0.07] p-4">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[#ff9fc9]">
          Next move
        </span>
        <p className="mt-1.5 text-[14px] leading-relaxed text-white/90">
          Build next week around the how-to angle, and lead with it on Thursday.
        </p>

        <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-[#ff0a8a] px-3.5 py-2 text-[12px] font-bold text-white">
          Generate
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </PanelFrame>
  );
}

export default NextMovePanel;
