"use client";

import { useState } from "react";
import Link from "next/link";
import { Space_Grotesk, Inter } from "next/font/google";
import { motion, type Variants } from "framer-motion";
import { GrowthRail } from "@/components/landing/GrowthRail";
import { IntelligenceCanvas } from "@/components/landing/IntelligenceCanvas";
import type { CanvasStateKey } from "@/components/landing/canvas-states";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 0L8.4 5.6L14 7L8.4 8.4L7 14L5.6 8.4L0 7L5.6 5.6L7 0Z" fill="currentColor" />
    </svg>
  );
}

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 18,
    },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 40, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 20,
      delay: 0.2,
    },
  },
};

export function Hero() {
  const { t } = useLanguage();
  // The rail at the bottom of the hero and the canvas above it are the same
  // loop shown twice, so hovering a stage down there drives the intelligence up
  // here. Held at this level because it is the only common ancestor.
  const [focusedStage, setFocusedStage] = useState<CanvasStateKey | null>(null);

  return (
<<<<<<< HEAD
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
      <FloatingOrbs />

      {/* Spotlight beam */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-80 opacity-25"
        style={{ background: "linear-gradient(to bottom, transparent, #ef4444, transparent)" }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-10 blur-[80px]"
        style={{ background: "radial-gradient(ellipse at top, #dc2626 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Announcement badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Gemma AI - Zero per-token API fees</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
        >
          <span className="text-foreground">Stop Managing</span>
          <br />
          <span className="gradient-text">Social Media.</span>
          <br />
          <span className="text-foreground">Start Delegating It.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Koraspace AI deploys autonomous AI agents that create content, engage
          your followers, predict viral trends, and convert likes into real
          revenue - 24/7, at a price built for the African market.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link href="/signup">
            <Button variant="gradient" size="xl" className="group w-full sm:w-auto">
              Start free - no credit card
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <button className="flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors group">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:border-red-500 group-hover:bg-red-500/10 transition-all">
              <Play className="w-4 h-4 ml-0.5 fill-current" />
            </div>
            <span className="text-sm font-medium">Watch demo (2 min)</span>
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_4px_rgba(234,179,8,0.5)]" />
            ))}
            <span className="ml-2">4.9/5 from 200+ creators</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <div>
            <span className="text-foreground font-medium">2,000+</span> accounts managed
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <div>
            Accepts{" "}
            <span className="text-foreground font-medium">Paystack &amp; Flutterwave</span>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-3 gap-8 max-w-xl mx-auto mb-16"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className={`text-3xl font-bold mb-1 ${i === 2 ? "text-emerald-400" : "gradient-text"}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Platform pills */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <span className="text-xs text-muted-foreground mr-2">Connects to:</span>
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span
                className="text-xs font-bold"
                style={{ color: p.color !== "#888888" ? p.color : undefined }}
              >
                {p.letter}
              </span>
              {p.name}
            </div>
          ))}
          <Badge variant="red" className="text-xs">+ more coming</Badge>
        </motion.div>
      </div>

      {/* Scroll indicator */}
=======
    <section
      className={`${display.variable} ${body.variable} min-h-screen transition-colors duration-200 bg-slate-100 dark:bg-[#07050d] px-3 py-3 font-[family-name:var(--font-body)] sm:px-6 sm:py-6 lg:px-10 lg:py-8 overflow-hidden`}
    >
>>>>>>> main
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[1.75rem] sm:rounded-[2.5rem] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.6)]"
      >
        {/* Animated ambient gradient layers */}
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background:
              "radial-gradient(130% 110% at 14% 8%, #FF2E7A 0%, #C13FE8 26%, #5A3CFF 50%, #14102b 76%, #07050d 100%)",
          }}
        />

        {/* Ambient floating glow orb 1 */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.55, 0.35],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -top-24 -right-24 h-[500px] w-[500px] rounded-full bg-[#5A3CFF]/40 blur-[120px]"
        />

        {/* Ambient floating glow orb 2 */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.45, 0.25],
            x: [0, -25, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="pointer-events-none absolute -bottom-32 -left-20 h-[500px] w-[500px] rounded-full bg-[#FF2E7A]/30 blur-[140px]"
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(48% 55% at 96% 6%, rgba(58,91,255,0.45) 0%, transparent 65%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 55% at 92% 100%, rgba(6,4,14,0.88) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-2/3"
          style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0.28) 0%, transparent 100%)",
          }}
        />

        <div className="relative flex flex-col z-10">
          {/* content */}
          <div className="grid gap-8 mt-24 px-5 pb-8 pt-2 sm:px-10 lg:mt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4 lg:pb-0 lg:pt-0">
            <motion.div
              variants={itemVariants}
              className="flex flex-col justify-center gap-5 py-4 lg:py-16"
            >
              <p className="text-xs font-bold tracking-[0.2em] text-[#ff9fc9]">
                {t.hero.badge.toUpperCase()}
              </p>

              <h1 className="font-[family-name:var(--font-display)] text-[2rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {t.hero.title1}{" "}
                <span className="text-[#ff9fc9]">{t.hero.titleHighlight}</span>{" "}
                {t.hero.title2}
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                {t.hero.subtitle}
              </p>

              <div className="flex flex-col gap-3 pt-4">
                <div className="relative w-fit">
                  <motion.div
                    aria-hidden="true"
                    animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="pointer-events-none absolute -inset-3 rounded-full bg-[#ff0a8a]/50 blur-2xl"
                  />
                  <motion.div
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative"
                  >
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2.5 rounded-full bg-[#ff0a8a] py-4 pl-7 pr-3 text-base font-bold text-white shadow-[0_8px_32px_rgba(255,10,138,0.5)] transition-all hover:bg-[#ff299b] hover:shadow-[0_10px_40px_rgba(255,10,138,0.65)] active:scale-[0.98] sm:text-lg"
                    >
                      <SparkleIcon />
                      <span>{t.hero.startTrial}</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
                        <ArrowIcon />
                      </span>
                    </Link>
                  </motion.div>
                </div>

                <p className="text-xs text-white/50">
                  {t.hero.noCardRequired} · {t.hero.instantSetup}
                </p>

                <a
                  href="#dual-modes"
                  className="w-fit text-sm text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {t.hero.compareModes}
                </a>
              </div>
            </motion.div>

            <div className="relative flex flex-col items-center justify-center py-6 lg:min-h-[440px] lg:py-0">
              <motion.div variants={imageVariants} className="w-full">
                <IntelligenceCanvas focusedKey={focusedStage} />
              </motion.div>
            </div>
          </div>

          {/* the intelligence rail - hero's interactive centerpiece */}
          <motion.div variants={itemVariants} className="mt-2">
            <GrowthRail onFocusStage={setFocusedStage} />
          </motion.div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mx-auto mt-6 max-w-[1400px] px-5 text-sm text-white/50 sm:px-10 flex items-center gap-2"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
        <span>{t.hero.supportedPlatforms}</span>
      </motion.p>
    </section>
  );
}

export default Hero;
