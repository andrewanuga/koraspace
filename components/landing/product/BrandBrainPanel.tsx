"use client";

import { PanelFrame } from "./PanelFrame";

/**
 * Brand Brain — the context KoraSpace holds about a business.
 *
 * Capabilities shown are the ones the PRD documents: it stores brand voice,
 * audience understanding, products and past content, and mirrors how the user
 * writes. Nothing here claims a capability the product does not have.
 */
const ROWS = [
  { label: "Brand voice", value: "Direct, practical, no hype" },
  { label: "Audience", value: "Founders and operators, 25–40" },
  { label: "Products", value: "4 tracked" },
  { label: "Past content", value: "128 posts learned" },
];

export function BrandBrainPanel() {
  return (
    <PanelFrame title="Brand Brain">
      <div className="space-y-2">
        {ROWS.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-[#141414] px-3.5 py-3"
          >
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">
              {label}
            </span>
            <span className="text-right text-[13px] text-white/80">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-[#ff0a8a]/25 bg-[#ff0a8a]/[0.06] px-3.5 py-3">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[#ff9fc9]">
          Context ready
        </span>
        <p className="mt-1 text-[13px] leading-relaxed text-white/75">
          Every draft starts from this, not from an empty box.
        </p>
      </div>
    </PanelFrame>
  );
}

export default BrandBrainPanel;
