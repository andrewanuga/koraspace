"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A hairline that crosses the boundary between two sections, so the story
 * visibly continues instead of stopping and restarting.
 *
 * Zero-height by design — the same anchor trick the old GrowthRail used. It
 * reserves no layout space, and the line hangs out of it in both directions,
 * reaching into the previous section's bottom padding and the next section's
 * top padding. Its reach is kept inside those paddings so it never runs into
 * content.
 *
 * Used sparingly, only at narrative handoffs. A thread between every section
 * would turn a signal into a pattern and stop meaning anything.
 */
export function SectionThread() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none relative z-10 h-0">
      <span className="absolute left-1/2 -top-[72px] h-[144px] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#ff9fc9]/45 to-transparent sm:-top-[96px] sm:h-[192px]">
        {!reduce && (
          <motion.span
            animate={{ top: ["0%", "100%"], opacity: [0, 1, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 h-6 w-[3px] -translate-x-1/2 rounded-full bg-[#ff9fc9] blur-[1px]"
          />
        )}
      </span>
    </div>
  );
}

export default SectionThread;
