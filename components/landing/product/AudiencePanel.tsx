"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PanelFrame } from "./PanelFrame";

/**
 * Audience understanding — what KoraSpace has worked out about who responds,
 * and to what.
 *
 * Deliberately not the Brand Brain panel: that one already opens section 03,
 * and showing the same interface twice in a row would read as padding. The
 * PRD documents both — stored brand context, and per-post analytics feeding
 * an understanding of the audience — so this is the deeper half of the same
 * idea rather than an invented capability.
 */
const TOPICS = [
  { label: "How-to breakdowns", share: 86 },
  { label: "Founder stories", share: 64 },
  { label: "Product updates", share: 31 },
];

export function AudiencePanel() {
  const reduce = useReducedMotion();

  return (
    <PanelFrame title="Audience">
      <div className="rounded-xl border border-[var(--ks-line)] bg-[var(--ks-panel-raised)] p-4">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--ks-ink-3)]">
          Responds most to
        </span>

        <div className="mt-3.5 space-y-3">
          {TOPICS.map(({ label, share }, i) => (
            <div key={label}>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-[var(--ks-ink-2)]">{label}</span>
                <span className="text-[var(--ks-ink-3)]">{share}</span>
              </div>
              <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-[var(--ks-panel-inset)]">
                <motion.span
                  initial={reduce ? false : { width: 0 }}
                  whileInView={{ width: `${share}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.9,
                    delay: 0.15 + i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{ width: `${share}%` }}
                  className="block h-full rounded-full bg-gradient-to-r from-[#5a3cff] to-[#ff9fc9]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[var(--ks-line)] bg-[var(--ks-panel-chrome)] px-3.5 py-3">
          <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--ks-ink-3)]">
            Most active
          </span>
          <p className="mt-1 text-[13px] text-[var(--ks-ink-2)]">Thu, 7–9pm</p>
        </div>
        <div className="rounded-xl border border-[var(--ks-line)] bg-[var(--ks-panel-chrome)] px-3.5 py-3">
          <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--ks-ink-3)]">
            Prefers
          </span>
          <p className="mt-1 text-[13px] text-[var(--ks-ink-2)]">Short video</p>
        </div>
      </div>
    </PanelFrame>
  );
}

export default AudiencePanel;
