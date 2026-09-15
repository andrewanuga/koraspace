"use client";

import React from "react";
import { motion } from "framer-motion";

export type SectionTone = "pink" | "blue" | "white";

/**
 * Small pill above a section heading — a pulsing dot plus tracked mono caps.
 * The three tones are the only accents the marketing pages use, so keeping
 * them enumerated here stops one-off colours creeping into new sections.
 */
export function Eyebrow({
  children,
  tone = "pink",
}: {
  children: React.ReactNode;
  tone?: SectionTone;
}) {
  const toneClass =
    tone === "blue"
      ? "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/25 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
      : tone === "white"
      ? "text-white/80 bg-white/5 border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
      : "text-[#ff0a8a] bg-[#ff0a8a]/10 border-[#ff0a8a]/25 shadow-[0_0_15px_rgba(255,10,138,0.15)]";

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider font-semibold border ${toneClass}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full animate-pulse"
        style={{
          background:
            tone === "blue" ? "#3b82f6" : tone === "white" ? "#ffffff" : "#ff0a8a",
        }}
      />
      {children}
    </motion.span>
  );
}

export default Eyebrow;
