"use client";

import React from "react";
import { SceneNumeral } from "./SceneNumeral";

/**
 * A layered stage, as opposed to a rectangular section.
 *
 * Layer 1 (environment) is supplied here — atmosphere, optional hairline grid,
 * and the oversized numeral. Layers 2–4 are the children, which are free to
 * overlap each other and to extend past the content column.
 *
 * The clipping rule is the important part: the section is `overflow-x-clip` so
 * a card can break the right edge without ever creating horizontal page
 * scroll, while `overflow-y` stays visible so a layer can bleed into the
 * section above or below and the page reads as one continuous story.
 */
export function Scene({
  numeral,
  numeralSide = "left",
  atmosphere = "none",
  surface = "dark",
  ground = 1,
  id,
  className = "",
  contentClassName = "",
  children,
}: {
  numeral?: string;
  numeralSide?: "left" | "right" | "center";
  /** Where the ambient glow sits, if any. */
  atmosphere?: "none" | "left" | "right" | "center";
  /**
   * Which token scope the section renders in. A light scene paints its own
   * opaque ground rather than letting the page-wide tone show through, which
   * is what allows sections to be converted one at a time.
   */
  surface?: "dark" | "light";
  /** Step in the background rhythm: 1 paper, 2 lavender, 3 atmospheric. */
  ground?: 1 | 2 | 3;
  id?: string;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  const orbPosition =
    atmosphere === "left"
      ? "-left-32 top-1/4"
      : atmosphere === "right"
        ? "-right-32 top-1/4"
        : "left-1/2 top-1/3 -translate-x-1/2";

  const isLight = surface === "light";

  return (
    <section
      id={id}
      data-ground={isLight ? ground : undefined}
      className={`relative overflow-x-clip px-4 py-24 sm:px-6 sm:py-32 lg:px-8 ${
        isLight ? "kora-light bg-[var(--ks-ground)]" : ""
      } ${id ? "scroll-mt-24" : ""} ${className}`}
    >
      {/* ── Layer 1: environment ─────────────────────────────────────── */}
      {atmosphere !== "none" && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute h-[460px] w-[460px] rounded-full bg-[var(--ks-orb)] blur-[130px] ${orbPosition}`}
        />
      )}

      {numeral && <SceneNumeral value={numeral} side={numeralSide} />}

      {/* ── Layers 2–4: content, product, floating ───────────────────── */}
      <div className={`relative mx-auto max-w-6xl ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
}

export default Scene;
