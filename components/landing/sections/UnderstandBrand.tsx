"use client";

import { FloatingCard } from "@/components/landing/primitives";
import { AudiencePanel } from "@/components/landing/product/AudiencePanel";
import { EditorialScene } from "./EditorialScene";

/**
 * Section 04 — understand your brand. TEXT ◀ VISUAL, the first of the
 * alternating run.
 */
export function UnderstandBrand() {
  return (
    <EditorialScene
      index="04"
      title="Understand your brand — and who it's for."
      body="KoraSpace builds context around your business as you work: who engages, what they respond to, when they are listening. Every decision after this starts from that, not from a guess."
      visual={
        <>
          <AudiencePanel />
          <FloatingCard
            depth="front"
            drift="lift"
            className="sm:-right-4 sm:-top-16 sm:w-[200px] lg:-right-6 xl:-right-12"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff9fc9]">
              Updated
            </span>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/80">
              Refreshed after every post you publish.
            </p>
          </FloatingCard>
        </>
      }
    />
  );
}

export default UnderstandBrand;
