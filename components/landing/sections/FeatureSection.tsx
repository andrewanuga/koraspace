/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  LandingButton,
  Eyebrow,
  springTransition,
  cardHoverSpring,
} from "@/components/landing/primitives";

/* ── 4. Alternating FeatureSection Layout ─────────────────────────── */

interface FeatureProps {
  id?: string;
  badge?: string;
  tone?: "pink" | "blue";
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  imageLeft?: boolean;
}

export function FeatureSection({
  id,
  badge,
  tone = "pink",
  title,
  description,
  imageUrl,
  imageAlt,
  imageLeft = true,
}: FeatureProps) {
  const isBlue = tone === "blue";
  const brandColor = isBlue ? "#3b82f6" : "#ff0a8a";

  return (
    <section
      id={id}
      className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-14 scroll-mt-24"
    >
      {/* Visual Image Preview with Spring Float & Hover */}
      <motion.div
        initial={{ opacity: 0, x: imageLeft ? -30 : 30, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={springTransition}
        className={`flex-1 w-full ${imageLeft ? "md:order-1" : "md:order-2"}`}
      >
        <motion.div
          whileHover={{ y: -6, scale: 1.01 }}
          transition={cardHoverSpring}
          className="relative rounded-3xl border border-white/[0.10] bg-[#161616] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-[300px] sm:h-[360px] rounded-2xl object-cover object-top border border-white/10"
          />
        </motion.div>
      </motion.div>

      {/* Content Text with Staggered Entrance */}
      <motion.div
        initial={{ opacity: 0, x: imageLeft ? 30 : -30, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={springTransition}
        className={`flex-1 space-y-4 ${imageLeft ? "md:order-2" : "md:order-1"}`}
      >
        {badge && <Eyebrow tone={tone}>{badge}</Eyebrow>}

        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
          {title}
        </h2>

        <p className="text-sm sm:text-base text-white/60 font-normal leading-relaxed">
          {description}
        </p>

        <div className="pt-2">
          <LandingButton
            href="/signup"
            className="text-white"
            style={{
              background: brandColor,
              boxShadow: `0 4px 18px ${brandColor}35`,
            }}
          >
            <span>Explore Feature</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </LandingButton>
        </div>
      </motion.div>
    </section>
  );
}
