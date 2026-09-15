"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eyebrow, springTransition, type SectionTone } from "@/components/landing/primitives";

/**
 * Opening block for a marketing sub-page.
 *
 * Distinct from SectionHead, which renders an h2 for a section *within* a page.
 * Each page needs exactly one h1, so product and audience pages start here
 * instead of leading with a section heading.
 */
export function PageHero({
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
    <section className="relative px-4 sm:px-6 lg:px-8 pt-32 pb-12 sm:pt-40 sm:pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={springTransition}
        className="mx-auto max-w-3xl text-center"
      >
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        <h1 className="font-display mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
          {title}
        </h1>
        {sub && (
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/60 max-w-2xl mx-auto">
            {sub}
          </p>
        )}
      </motion.div>
    </section>
  );
}

export default PageHero;
