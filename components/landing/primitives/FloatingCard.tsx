"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { useParallax, type ParallaxDepth } from "./useParallax";

/**
 * Layer 4 — an intelligence fragment floating over the product surface.
 *
 * Depth values are lifted verbatim from IntelligenceCanvas so the hero and the
 * scenes below it speak the same language: a `back` card is smaller, dimmer and
 * slightly out of focus, which is what sells the distance rather than a drop
 * shadow doing all the work.
 *
 * Placement is the caller's job (absolute utilities via `className`), because
 * where a card overlaps the product is a per-composition decision — it should
 * clip a corner or an edge, never sit politely alongside.
 *
 * Two nested elements on purpose: the outer one owns the scroll drift and the
 * inner one owns the entrance. Both animate `y`, so sharing an element would
 * have the entrance tween and the scroll MotionValue overwrite each other.
 */
const depthStyles = {
  front: "z-30 scale-100 opacity-100",
  back: "z-20 scale-[0.92] opacity-75 blur-[0.6px]",
} as const;

export function FloatingCard({
  depth = "front",
  drift = "lift",
  className = "",
  children,
}: {
  depth?: keyof typeof depthStyles;
  /** How far it drifts on scroll. Zero under prefers-reduced-motion. */
  drift?: ParallaxDepth;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const y = useParallax(ref, drift);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={`absolute ${depthStyles[depth]} ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-white/[0.12] bg-[#0e0a1c]/92 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default FloatingCard;
