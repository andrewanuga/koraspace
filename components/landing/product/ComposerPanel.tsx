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
      <div className="rounded-xl border border-white/[0.10] bg-[#141414] px-3.5 py-3">
        <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">
          Prompt
        </span>
        <p className="mt-1.5 text-[13px] text-white/85">
          Repurpose last week&rsquo;s thread into three short videos.
        </p>
      </div>

      {/* draft */}
      <div className="mt-3 rounded-xl border border-white/[0.08] bg-[#181818] p-3.5">
        <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">
          Draft &mdash; in your voice
        </span>
        <div className="mt-2.5 space-y-1.5">
          <span className="block h-2 w-[92%] rounded-full bg-white/[0.13]" />
          <span className="block h-2 w-[78%] rounded-full bg-white/[0.10]" />
          <span className="block h-2 w-[85%] rounded-full bg-white/[0.10]" />
          <span className="block h-2 w-[46%] rounded-full bg-white/[0.07]" />
        </div>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {HASHTAGS.map((h) => (
            <span
              key={h}
              className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[11px] text-white/55"
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
