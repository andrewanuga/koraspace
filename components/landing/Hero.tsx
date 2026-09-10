"use client";

import Image from "next/image";
import Link from "next/link";
import { Space_Grotesk, Inter } from "next/font/google";
import { motion } from "framer-motion";

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

const loopStages = [
  { n: "01", label: "Understand" },
  { n: "02", label: "Create" },
  { n: "03", label: "Publish" },
  { n: "04", label: "Optimize" },
];

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      delay: 0.25,
    },
  },
};

export function Hero() {
  return (
    <section
      className={`${display.variable} ${body.variable} min-h-screen bg-[#07050d] px-3 py-3 font-[family-name:var(--font-body)] sm:px-6 sm:py-6 lg:px-10 lg:py-8`}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[1.75rem] sm:rounded-[2.5rem]"
      >
        {/* gradient layers */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(130% 110% at 14% 8%, #FF2E7A 0%, #C13FE8 26%, #5A3CFF 50%, #14102b 76%, #07050d 100%)",
          }}
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

        <div className="relative flex flex-col">
          {/* nav */}
          <motion.nav
            variants={itemVariants}
            className="flex items-center justify-between px-5 py-5 sm:px-10 sm:py-7"
          >
            <Link
              href="/"
              className="flex items-center gap-3 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-white transition-opacity hover:opacity-90"
            >
              <Image
                src="/logo.png"
                alt="KoraSpace Logo"
                width={32}
                height={32}
                className="h-8 w-auto object-contain"
                priority
              />
              <span>KoraSpace</span>
            </Link>

            <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
              <a
                href="#features"
                className="rounded-sm transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Platform
              </a>
              <a
                href="#how"
                className="rounded-sm transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Growth loop
              </a>
              <a
                href="#pricing"
                className="rounded-sm transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Pricing
              </a>
            </div>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-sm font-medium text-[#0b0714] transition-transform hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span>Get started</span>
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                style={{ background: "linear-gradient(135deg, #FF2E7A, #2A4BFF)" }}
              >
                <ArrowIcon />
              </span>
            </Link>
          </motion.nav>

          {/* content */}
          <div className="grid gap-8 px-5 pb-8 pt-2 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4 lg:pb-0 lg:pt-0">
            <motion.div
              variants={itemVariants}
              className="flex flex-col justify-center gap-5 py-4 lg:py-16"
            >
              <p className="text-sm text-white/70">Hey, I&apos;m not another scheduler.</p>
              <h1 className="font-[family-name:var(--font-display)] text-[2.5rem] font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4rem]">
                Marketing that
                <br />
                markets itself.
              </h1>
            </motion.div>

            <div className="relative flex flex-col lg:min-h-[440px]">
              <motion.div
                variants={itemVariants}
                className="max-w-xs self-start pt-1 sm:self-end sm:text-right lg:pt-14"
              >
                <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                  Growth should feel automatic.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  KoraSpace learns your brand, creates and publishes content, and
                  optimizes what performs — so your strategy keeps improving on
                  its own.
                </p>
              </motion.div>

              <motion.div
                variants={imageVariants}
                className="relative mx-auto -mb-8 mt-6 h-[280px] w-[220px] sm:h-[360px] sm:w-[280px] lg:absolute lg:bottom-[-2rem] lg:right-[-1rem] lg:mx-0 lg:mt-0 lg:h-[440px] lg:w-[340px]"
              >
                <Image
                  src="/hero-img.png"
                  alt="A KoraSpace creator, arms crossed, looking at the camera"
                  fill
                  priority
                  sizes="(min-width: 1024px) 340px, 280px"
                  className="object-contain object-bottom drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]"
                />
              </motion.div>
            </div>
          </div>

          {/* growth loop stage strip */}
          <motion.div
            variants={itemVariants}
            className="relative mt-2 grid grid-cols-2 gap-x-4 gap-y-6 border-t border-white/15 px-5 py-6 sm:grid-cols-4 sm:px-10 sm:py-8"
          >
            {loopStages.map((stage) => (
              <div key={stage.n}>
                <span className="text-xs font-medium text-[#ff9fc9]">
                  #{stage.n}
                </span>
                <p className="mt-1 text-sm text-white/80">{stage.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mx-auto mt-6 max-w-[1400px] px-5 text-sm text-white/40 sm:px-10"
      >
        Built to grow across Instagram, TikTok, X, LinkedIn, and Threads.
      </motion.p>
    </section>
  );
}

export default Hero;