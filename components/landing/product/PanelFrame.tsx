"use client";

import React from "react";

/**
 * The shell every coded product panel sits in.
 *
 * Follows the surface ladder DashboardShowcase already established — frame
 * over chrome over canvas — so a panel composed here and the real dashboard
 * mock read as the same product rather than two different mockups.
 *
 * Every surface comes from the --ks-* tokens, so the same panel renders dark or
 * light depending on the scope it sits in. Dark is the default, so a panel that
 * nothing wraps looks exactly as it always has.
 *
 * Built in DOM rather than using the screenshots on disk because a flat image
 * cannot be overlapped convincingly: a floating card on top of a JPEG reads as
 * pasted on, where a card overlapping real markup reads as part of the
 * interface.
 *
 * The "preview" tag is deliberate. The figures inside these panels are
 * illustrative, and the page should say so rather than imply live data.
 */
export function PanelFrame({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border border-[var(--ks-panel-line)] bg-[var(--ks-panel-frame)] shadow-[var(--ks-panel-shadow)] ${className}`}
    >
      {/* chrome */}
      <div className="flex items-center justify-between border-b border-[var(--ks-line)] bg-[var(--ks-panel-chrome)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--ks-accent)]" />
          <span className="text-[11px] font-semibold tracking-wide text-[var(--ks-ink-2)]">
            {title}
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ks-ink-4)]">
          Preview
        </span>
      </div>

      <div className="bg-[var(--ks-panel-canvas)] p-4 sm:p-5">{children}</div>
    </div>
  );
}

export default PanelFrame;
