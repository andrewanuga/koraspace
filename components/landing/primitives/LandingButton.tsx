"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cardHoverSpring } from "./motion";

/**
 * The marketing pages' action button. Callers supply their own colour via
 * `className`/`style` — this owns only the shape, typography and press physics,
 * which is why both the pink primary and the glass secondary can share it.
 */
export function LandingButton({
  href,
  className = "",
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={cardHoverSpring}
        style={style}
        className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs tracking-wide transition-colors duration-200 cursor-pointer ${className}`}
      >
        {children}
      </motion.button>
    </Link>
  );
}

export default LandingButton;
