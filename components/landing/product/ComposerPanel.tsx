"use client";

import { PanelFrame } from "./PanelFrame";

/**
 * The AI Composer mid-draft.
 *
 * Mirrors the pipeline the PRD describes — reads the brand, checks past posts,
 * drafts the post and caption, then assigns hashtags — rather than showing a
 * generic chat box.
 */
const HASHTAGS = ["#founderled", "#buildinpublic", "#marketingops"];

export function ComposerPanel() {
  return (
    <PanelFrame title="AI Composer">
      {/* prompt */}
      <div className="rounded-xl border ks-line bg-[var(--ks-panel-chrome)] px-3.5 py-3">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--ks-ink-3)]">
          Prompt
        </span>
        <p className="mt-1.5 text-[13px] text-[var(--ks-ink-2)]">
          Repurpose last week&rsquo;s thread into three short videos.
        </p>
      </div>

      {/* draft */}
      <div className="mt-3 rounded-xl border ks-line bg-[var(--ks-panel-raised)] p-3.5">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--ks-ink-3)]">
          Draft &mdash; in your voice
        </span>
        <div className="mt-2.5 space-y-1.5">
          <span className="block h-2 w-[92%] rounded-full bg-[var(--ks-skeleton)]" />
          <span className="block h-2 w-[78%] rounded-full bg-[var(--ks-skeleton-2)]" />
          <span className="block h-2 w-[85%] rounded-full bg-[var(--ks-skeleton-2)]" />
          <span className="block h-2 w-[46%] rounded-full bg-[var(--ks-panel-inset)]" />
        </div>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {HASHTAGS.map((h) => (
            <span
              key={h}
              className="rounded-md border ks-line bg-[var(--ks-chip)] px-2 py-1 text-[11px] text-[var(--ks-ink-3)]"
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </PanelFrame>
  );
}

export default ComposerPanel;
