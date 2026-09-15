"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eyebrow, type SectionTone } from "./Eyebrow";
import { springTransition } from "./motion";

/**
 * Centred eyebrow + h2 + optional sub-line. Every marketing section that has
 * a heading uses this, so the vertical rhythm above the content stays
 * identical across the site.
 */
export function SectionHead({
  eyebrow,
  tone = "pink",
  title,
  sub,
}: {
  eyebrow: string;
  tone?: SectionTone;
  title: React.ReactNode;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={springTransition}
      className="mx-auto mb-14 max-w-3xl text-center"
    >
      <div>
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      </div>
      <h2 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/60 font-normal max-w-2xl mx-auto">
          {sub}
        </p>
      )}
    </motion.div>
  );
}

export default SectionHead;
