"use client";

/**
 * Oversized section numeral, sitting in the environment layer behind everything.
 *
 * New to this codebase — the largest type anywhere else is text-6xl — so it is
 * the main thing that makes a scene read as editorial rather than as a card.
 * It is decoration, not content: aria-hidden, and the real section number (if
 * any) belongs in the eyebrow where a screen reader will reach it.
 *
 * Positioned to bleed past the content column. The parent Scene clips
 * horizontally, so the bleed never creates page scroll.
 */
export function SceneNumeral({
  value,
  side = "left",
  className = "",
}: {
  value: string;
  /** Which edge it hangs off. */
  side?: "left" | "right" | "center";
  className?: string;
}) {
  const position =
    side === "right"
      ? "right-0 translate-x-[18%]"
      : side === "center"
        ? "left-1/2 -translate-x-1/2"
        : "left-0 -translate-x-[18%]";

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-0 select-none font-display font-bold leading-none text-[var(--ks-numeral)] text-[8rem] sm:text-[12rem] lg:text-[16rem] ${position} ${className}`}
    >
      {value}
    </span>
  );
}

export default SceneNumeral;
