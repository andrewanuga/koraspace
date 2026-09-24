"use client";

import { FloatingCard, Surface } from "@/components/landing/primitives";
import { RepurposePanel } from "@/components/landing/product/RepurposePanel";
import { EditorialScene } from "./EditorialScene";

/**
 * Section 05 — create with context. VISUAL ▶ TEXT, the first reversed row.
 *
 * The one row where the panel stays dark on a light ground. It is the page's
 * device-on-a-desk moment: the surrounding sections show the product in the
 * page's own colours, and this one shows it as a screen, which makes it the
 * focal point without needing to be any larger.
 *
 * Two things follow from that. The panel bleeds toward the outer margin so the
 * row does not read as two tidy columns — and because it does, the floating
 * card breaks the panel's INNER edge into the gutter instead. Breaking the
 * outer edge as well would push the card off the section: at 1280 the content
 * column leaves roughly 64px of margin, and the bleed already spends most of it.
 */
export function CreateWithContext() {
  return (
    <EditorialScene
      index="05"
      reverse
      surface="light"
      ground={2}
      visualBleed
      title="Create with context."
      body="One idea that worked becomes a native version for every platform you publish to. Each one written for how that audience reads — and every one of them in your voice."
      visual={
        <>
          <Surface theme="dark">
            <RepurposePanel />
          </Surface>
          <FloatingCard
            depth="front"
            drift="lift"
            className="sm:-bottom-10 sm:-right-4 sm:w-[205px] lg:-right-6 xl:-right-8"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ks-accent-ink)]">
              Voice match
            </span>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--ks-ink-2)]">
              Written the way you write, not the way a template does.
            </p>
          </FloatingCard>
        </>
      }
    />
  );
}

export default CreateWithContext;
