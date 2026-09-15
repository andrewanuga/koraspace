"use client";

import React from "react";

/**
 * The shell every coded product panel sits in.
 *
 * Follows the surface ladder DashboardShowcase already established — frame
 * #171717, canvas #121212 — so a panel composed here and the real dashboard
 * mock read as the same product rather than two different mockups.
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
      className={`overflow-hidden rounded-3xl border border-white/[0.10] bg-[#171717] shadow-[0_30px_90px_rgba(0,0,0,0.6)] ${className}`}
    >
      {/* chrome */}
      <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#141414] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
          <span className="text-[11px] font-semibold tracking-wide text-white/70">
            {title}
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">
          Preview
        </span>
      </div>

      <div className="bg-[#121212] p-4 sm:p-5">{children}</div>
    </div>
  );
}

export default PanelFrame;
