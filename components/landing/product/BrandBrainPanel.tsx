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
            className="flex items-center justify-between gap-4 rounded-xl border ks-line bg-[var(--ks-panel-chrome)] px-3.5 py-3"
          >
            <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--ks-ink-3)]">
              {label}
            </span>
            <span className="text-right text-[13px] text-[var(--ks-ink-2)]">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border ks-line-accent bg-[var(--ks-accent-soft)] px-3.5 py-3">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--ks-accent-ink)]">
          Context ready
        </span>
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--ks-ink-2)]">
          Every draft starts from this, not from an empty box.
        </p>
      </div>
    </PanelFrame>
  );
}

export default BrandBrainPanel;
