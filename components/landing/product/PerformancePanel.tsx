"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PanelFrame } from "./PanelFrame";

/**
 * Performance — recent posts read against the account's own baseline.
 *
 * Distinct from NextMovePanel (section 03), which already shows the
 * recommendation. This is the step before it: the evidence. The PRD documents
 * real per-post analytics with cross-post suggestions, so that is what this
 * depicts.
 *
 * Results are expressed relative to the account's average rather than as
 * absolute reach or revenue. A relative bar says "this one was different",
 * which is the point, without putting a headline number on the page that
 * could read as a customer result.
 */
const POSTS = [
  { title: "How we priced our first product", kind: "Video", score: 2.3 },
  { title: "Behind the launch week", kind: "Carousel", score: 1.1 },
  { title: "New feature: scheduling", kind: "Post", score: 0.7 },
  { title: "Five mistakes in year one", kind: "Thread", score: 1.8 },
];

/** Bars are drawn on a 0–2.5× scale; the dashed line marks 1× (average). */
const SCALE = 2.5;

export function PerformancePanel() {
  const reduce = useReducedMotion();

  return (
    <PanelFrame title="Performance">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--ks-ink-3)]">
          Last 4 posts vs your average
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-[var(--ks-ink-3)]">
          <span className="h-px w-3 border-t border-dashed ks-line-marker" />
          average
        </span>
      </div>

      <div className="space-y-2">
        {POSTS.map(({ title, kind, score }, i) => {
          const top = i === 0;
          return (
            <div
              key={title}
              className={`rounded-xl border px-3.5 py-3 ${
                top
                  ? "ks-line-accent bg-[var(--ks-accent-soft)]"
                  : "ks-line bg-[var(--ks-panel-chrome)]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-[12.5px] text-[var(--ks-ink-2)]">{title}</span>
                <span className="shrink-0 text-[11px] text-[var(--ks-ink-3)]">{kind}</span>
              </div>

              <div className="relative mt-2 h-[3px] rounded-full bg-[var(--ks-panel-inset)]">
                {/* the 1× baseline */}
                <span
                  aria-hidden="true"
                  className="absolute -top-1 h-[11px] border-l border-dashed ks-line-marker"
                  style={{ left: `${(1 / SCALE) * 100}%` }}
                />
                <motion.span
                  initial={reduce ? false : { width: 0 }}
                  whileInView={{ width: `${(score / SCALE) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  style={{ width: `${(score / SCALE) * 100}%` }}
                  className={`block h-full rounded-full ${
                    top
                      ? "bg-[linear-gradient(to_right,var(--ks-bar-from),var(--ks-bar-to))]"
                      : "bg-[var(--ks-bar)]"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </PanelFrame>
  );
}

export default PerformancePanel;
