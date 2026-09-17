"use client";

import React from "react";
import { motion } from "framer-motion";
import { Scene, springTransition } from "@/components/landing/primitives";

/**
 * The alternating editorial row — text beside product, flipping sides each time.
 *
 * Sections 04–06 share this skeleton so the run reads as a rhythm, and differ
 * only in the product visual and which side it sits on. It is intentionally
 * calmer than the full scenes in 02 and 03: one floating card at most, a
 * quieter environment. That contrast is the point — the page needs moments
 * of composure between its bigger compositions.
 *
 * On phones the copy always comes first regardless of `reverse`. Flipping the
 * order on a single column would put a product panel above the sentence that
 * explains it, so small screens are recomposed rather than mirrored.
 */
export function EditorialScene({
  index,
  title,
  body,
  visual,
  reverse = false,
  surface = "dark",
  ground = 1,
  id,
}: {
  /** Two-digit section number, e.g. "04". */
  index: string;
  title: string;
  body: string;
  /** The product panel, plus any floating card layered over it. */
  visual: React.ReactNode;
  /** Put the visual on the left from lg up. */
  reverse?: boolean;
  /** Which token scope the row renders in. */
  surface?: "dark" | "light";
  /** Step in the background rhythm, when light. */
  ground?: 1 | 2 | 3;
  id?: string;
}) {
  return (
    <Scene
      id={id}
      numeral={index}
      numeralSide={reverse ? "right" : "left"}
      atmosphere={reverse ? "left" : "right"}
      surface={surface}
      ground={ground}
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* copy — first on mobile always; on desktop, second when reversed */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={springTransition}
          className={reverse ? "lg:order-2" : ""}
        >
          <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-[var(--ks-accent-ink)]">
            {index}
          </span>
          <h2 className="font-display mt-3 text-3xl font-bold leading-[1.1] tracking-tight text-[var(--ks-ink)] sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--ks-ink-2)] sm:text-base">
            {body}
          </p>
        </motion.div>

        {/* visual — the product layer and whatever floats over it */}
        <div className={`relative ${reverse ? "lg:order-1" : ""}`}>
          {visual}
        </div>
      </div>
    </Scene>
  );
}

export default EditorialScene;
