"use client";

import { Sparkles } from "lucide-react";
import { ConnectorLine, FloatingCard } from "@/components/landing/primitives";
import { PerformancePanel } from "@/components/landing/product/PerformancePanel";
import { EditorialScene } from "./EditorialScene";

/**
 * Section 06 — learn from results. TEXT ◀ VISUAL, closing the alternating run.
 *
 * The floating card is an annotation on the evidence: it names what the
 * highlighted post has in common with the others that did well. The connector
 * ties it back to that row, which is the difference between a card that says
 * something and a card that points at something.
 *
 * The connector is desktop-only. On phones the card drops into normal flow
 * below the panel, where a line aimed at a row above would point at nothing.
 */
export function LearnFromResults() {
  return (
    <EditorialScene
      index="06"
      surface="light"
      ground={1}
      title="Learn from what happened."
      body="Every post comes back as a signal. KoraSpace reads your results against your own baseline, spots what the winners have in common, and keeps that for the next thing you make."
      visual={
        <>
          <PerformancePanel />

          <ConnectorLine
            d="M 88 96 L 70 26"
            className="hidden h-full w-full inset-0 sm:block"
            delay={0.6}
          />

          <FloatingCard
            depth="front"
            drift="lift"
            className="sm:-bottom-12 sm:-right-4 sm:w-[215px] lg:-right-6 xl:-right-12"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-[var(--ks-accent-ink)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ks-accent-ink)]">
                Pattern found
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--ks-ink-2)]">
              Your two strongest posts both explain how you did something.
            </p>
          </FloatingCard>
        </>
      }
    />
  );
}

export default LearnFromResults;
