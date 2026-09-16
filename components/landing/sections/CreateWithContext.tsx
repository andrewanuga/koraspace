"use client";

import { FloatingCard } from "@/components/landing/primitives";
import { RepurposePanel } from "@/components/landing/product/RepurposePanel";
import { EditorialScene } from "./EditorialScene";

/**
 * Section 05 — create with context. VISUAL ▶ TEXT, the first reversed row.
 *
 * With the panel on the left, the floating card breaks the panel's LEFT edge —
 * the outer side of the page — so it reads as coming from the margin into the
 * product rather than colliding with the copy column beside it.
 */
export function CreateWithContext() {
  return (
    <EditorialScene
      index="05"
      reverse
      title="Create with context."
      body="One idea that worked becomes a native version for every platform you publish to. Each one written for how that audience reads — and every one of them in your voice."
      visual={
        <>
          <RepurposePanel />
          <FloatingCard
            depth="front"
            drift="lift"
            className="sm:-bottom-10 sm:-left-4 sm:w-[205px] lg:-left-6 xl:-left-12"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff9fc9]">
              Voice match
            </span>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/80">
              Written the way you write, not the way a template does.
            </p>
          </FloatingCard>
        </>
      }
    />
  );
}

export default CreateWithContext;
