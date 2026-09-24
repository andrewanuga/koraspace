import type { Variants } from "framer-motion";

/**
 * Shared motion language for the marketing pages.
 *
 * Deliberately NOT a client module: these are plain objects, so a server
 * component can import them and hand them to a client child without pulling
 * this file into the client boundary on its own.
 *
 * Extracted verbatim from LowerSections.tsx — values must not drift, or
 * sections that used to animate in step will fall out of sync.
 */

export const springTransition = {
  type: "spring" as const,
  stiffness: 110,
  damping: 18,
  mass: 0.8,
};

export const cardHoverSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 20,
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: springTransition,
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: springTransition,
  },
};
