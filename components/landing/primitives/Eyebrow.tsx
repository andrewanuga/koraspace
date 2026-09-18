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
  // The white and pink tones are token-driven so the pill follows whichever
  // surface it lands on. Blue keeps its literal values: it is not used on any
  // converted section, so giving it a light twin would be guesswork.
  const toneClass =
    tone === "blue"
      ? "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/25 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
      : tone === "white"
        ? "ks-eyebrow-neutral"
        : "ks-eyebrow-accent";

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider font-semibold border ${toneClass}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full motion-safe:animate-pulse"
        style={{
          background:
            tone === "blue"
              ? "#3b82f6"
              : tone === "white"
                ? "var(--ks-eyebrow-dot)"
                : "var(--ks-accent)",
        }}
      />
      {children}
    </motion.span>
  );
}

export default Eyebrow;
