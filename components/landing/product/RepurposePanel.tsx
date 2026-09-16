"use client";

import { motion, useReducedMotion } from "framer-motion";
import { siInstagram, siThreads, siX, siYoutube } from "simple-icons";
import { BrandIcon } from "@/components/landing/brand-icons";
import { PanelFrame } from "./PanelFrame";

/**
 * Repurposing: one source piece becoming a native version for each platform.
 *
 * Not the AI Composer — that panel already carries scene 02 of section 03,
 * and showing it again two sections later would read as padding. This is the
 * other half of creating: taking something that worked and reshaping it.
 *
 * Only platforms the PRD lists as live for publishing appear here. LinkedIn is
 * absent on purpose — the README marks it Coming Soon, so showing a LinkedIn
 * output would imply a capability the product does not have yet.
 */
const OUTPUTS = [
  { icon: siInstagram, platform: "Instagram", format: "Reel, 30s", status: "Ready" },
  { icon: siYoutube, platform: "YouTube", format: "Short, 45s", status: "Ready" },
  { icon: siX, platform: "X", format: "Thread, 6 posts", status: "Draft" },
  { icon: siThreads, platform: "Threads", format: "Post + carousel", status: "Draft" },
];

export function RepurposePanel() {
  const reduce = useReducedMotion();

  return (
    <PanelFrame title="Repurpose">
      {/* the source */}
      <div className="rounded-xl border border-white/[0.10] bg-[#181818] px-4 py-3.5">
        <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">
          Source
        </span>
        <p className="mt-1.5 text-[13px] text-white/85">
          &ldquo;How we priced our first product&rdquo; &mdash; long-form video
        </p>
      </div>

      {/* fanning out */}
      <div className="flex justify-center py-2.5">
        <span className="h-4 w-px bg-gradient-to-b from-white/15 to-[#ff9fc9]/50" />
      </div>

      <div className="space-y-2">
        {OUTPUTS.map(({ icon, platform, format, status }, i) => (
          <motion.div
            key={platform}
            initial={reduce ? false : { opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#141414] px-3.5 py-2.5"
          >
            <BrandIcon icon={icon} className="h-4 w-4 shrink-0 text-white/70" />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] text-white/85">{platform}</p>
              <p className="text-[11px] text-white/40">{format}</p>
            </div>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                status === "Ready"
                  ? "bg-[#ff0a8a]/15 text-[#ff9fc9]"
                  : "bg-white/[0.05] text-white/40"
              }`}
            >
              {status}
            </span>
          </motion.div>
        ))}
      </div>
    </PanelFrame>
  );
}

export default RepurposePanel;
