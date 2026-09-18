"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A hairline drawn between two layers — a floating card and the product
 * surface it is annotating.
 *
 * This is the piece that makes an overlapping card read as *pointing at*
 * something rather than merely sitting on top of it. It draws itself as the
 * scene enters, then stays.
 *
 * Absolutely positioned by the caller; `preserveAspectRatio="none"` lets one
 * definition stretch to whatever gap it has to cross.
 */
export function ConnectorLine({
  /** SVG path in a 100×100 box, e.g. "M 0 0 L 100 100". */
  d,
  className = "",
  delay = 0.2,
}: {
  d: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute ${className}`}
    >
      <motion.path
        d={d}
        fill="none"
        stroke="var(--ks-connector)"
        strokeWidth="1"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

export default ConnectorLine;
