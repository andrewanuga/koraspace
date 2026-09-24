"use client";

import { useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import type { RefObject } from "react";

/**
 * Per-layer scroll drift.
 *
 * Only the floating intelligence layer moves — environment and product stay
 * put. That was a deliberate call: drifting everything reads as a parallax
 * effect, whereas drifting only what is closest to the viewer reads as depth.
 *
 * Travel is the HALF range: a layer moves from +travel to -travel across the
 * section, so `lift` covers 60px in total.
 */
const TRAVEL = {
  /** Cards sitting just off the product surface. */
  lift: 30,
  /** Annotations and chips at the very front. */
  hover: 46,
} as const;

export type ParallaxDepth = keyof typeof TRAVEL;

export function useParallax(
  ref: RefObject<HTMLElement | null>,
  depth: ParallaxDepth = "lift"
): MotionValue<number> {
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    // from the section entering the bottom of the viewport to leaving the top
    offset: ["start end", "end start"],
  });

  // Collapsing the range to zero rather than branching keeps the hook order
  // stable and makes reduced-motion a no-op instead of a special case.
  const travel = reduce ? 0 : TRAVEL[depth];

  return useTransform(scrollYProgress, [0, 1], [travel, -travel]);
}

export default useParallax;
