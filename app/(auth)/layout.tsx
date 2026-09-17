"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,0.92fr)] xl:grid-cols-[minmax(0,1.15fr)_minmax(500px,0.85fr)]">
        {/* =========================================================
            LEFT — PRODUCT / BRAND EXPERIENCE (Desktop)
        ========================================================= */}
        <aside className="relative hidden min-h-screen overflow-hidden border-r border-white/[0.07] bg-[#0e0e10] lg:flex">
          {/* Animated Ambient Brand Blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Primary Brand Pink Blob */}
            <motion.div
              animate={{
                x: [0, 40, -30, 0],
                y: [0, -50, 20, 0],
                scale: [1, 1.15, 0.95, 1],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-20 -top-20 h-[520px] w-[520px] rounded-full opacity-35 blur-[120px]"
              style={{
                background:
                  "radial-gradient(circle, #ff0a8a 0%, #b80062 50%, transparent 75%)",
              }}
            />

            {/* Electric Brand Blue Blob */}
            <motion.div
              animate={{
                x: [0, -50, 30, 0],
                y: [0, 40, -30, 0],
                scale: [1, 1.2, 0.9, 1],
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute -bottom-24 right-[-10%] h-[480px] w-[480px] rounded-full opacity-30 blur-[130px]"
              style={{
                background:
                  "radial-gradient(circle, #3b82f6 0%, #1d4ed8 50%, transparent 75%)",
              }}
            />

            {/* Center Violet Synergy Glow */}
            <motion.div
              animate={{
                x: [0, 25, -25, 0],
                y: [0, -30, 35, 0],
                scale: [0.9, 1.1, 1, 0.9],
              }}
              transition={{
                duration: 26,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 4,
              }}
              className="absolute left-1/3 top-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full opacity-20 blur-[140px]"
              style={{
                background:
                  "radial-gradient(circle, #a855f7 0%, #7c3aed 50%, transparent 75%)",
              }}
            />

            {/* Subtle Geometric Orbit Ring 1 (Brand Pink) */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.05, 1],
              }}
              transition={{
                rotate: { duration: 40, repeat: Infinity, ease: "linear" },
                scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
              }}
              className="absolute -left-[140px] top-[12%] h-[320px] w-[320px] rounded-full border border-[#ff0a8a]/20"
            >
              <div className="absolute top-1/2 -right-1.5 h-3 w-3 -translate-y-1/2 rounded-full bg-[#ff0a8a] shadow-[0_0_12px_#ff0a8a]" />
            </motion.div>

            {/* Subtle Geometric Orbit Ring 2 (Brand Blue) */}
            <motion.div
              animate={{
                rotate: -360,
                scale: [1, 1.08, 1],
              }}
              transition={{
                rotate: { duration: 48, repeat: Infinity, ease: "linear" },
                scale: { duration: 12, repeat: Infinity, ease: "easeInOut" },
              }}
              className="absolute bottom-[8%] -right-16 h-[260px] w-[260px] rounded-full border border-[#3b82f6]/20"
            >
              <div className="absolute top-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#3b82f6] shadow-[0_0_12px_#3b82f6]" />
            </motion.div>

            {/* Subtle Grid texture */}
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
                `,
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between px-10 py-10 xl:px-14">
            {/* Top brand header */}
            <div className="flex items-center">
              <Link href="/" className="group flex items-center gap-3">
                <KoraLogo />
                <div>
                  <div className="text-[15px] font-semibold tracking-[-0.02em] text-white group-hover:text-white/90">
                    KoraSpace
                  </div>
                  <div className="text-[10.5px] text-white/40">
                    Marketing & Creator Intelligence
                  </div>
                </div>
              </Link>
            </div>

            {/* Main copy + Product Preview */}
            <div className="my-auto py-8">
              <div className="w-full max-w-[640px]">
                {/* Badge */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.06] px-3.5 py-1.5">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
                  <Sparkles className="h-3.5 w-3.5 text-[#ff0a8a]" />
                  <span className="text-[11px] font-medium text-[#ff7fba]">
                    {t.authLayout.commandCenter}
                  </span>
                </div>

                {/* Hero Title */}
                <h1 className="font-display text-[44px] font-semibold leading-[1.04] tracking-[-0.04em] text-white xl:text-[54px]">
                  {t.authLayout.titleStart}
                  <span className="block text-[#ff0a8a]">
                    {t.authLayout.titleHighlight}
                  </span>
                </h1>

                {/* Description */}
                <p className="mt-5 max-w-[540px] text-[14.5px] leading-relaxed text-white/50">
                  {t.authLayout.description}
                </p>

                {/* Product preview card */}
                <div className="mt-8 max-w-[580px]">
                  <ProductPreview t={t} />
                </div>

                {/* Trust / feature checklist */}
                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[11.5px] text-white/40">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#ff0a8a]" />
                    <span>{t.authLayout.feature1}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#ff0a8a]" />
                    <span>{t.authLayout.feature2}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#ff0a8a]" />
                    <span>{t.authLayout.feature3}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom meta row */}
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-5 text-[10.5px] text-white/30">
              

              <div className="flex items-center gap-4">
                <span>{t.authLayout.secureCloud}</span>
                <span>•</span>
                <span>Creator & Marketer Edition</span>
              </div>
            </div>
          </div>
        </aside>

        {/* =========================================================
            RIGHT — AUTH FORM CONTAINER
        ========================================================= */}
        <main className="relative flex min-h-screen flex-1 flex-col justify-between overflow-hidden bg-[#121212]">
          {/* Animated Background Blobs on Auth form side */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Top Right Pink Glow */}
            <motion.div
              animate={{
                x: [0, -30, 20, 0],
                y: [0, 30, -20, 0],
                scale: [1, 1.12, 0.95, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -right-24 -top-24 h-[460px] w-[460px] rounded-full opacity-20 blur-[130px]"
              style={{
                background:
                  "radial-gradient(circle, #ff0a8a 0%, #b80062 50%, transparent 75%)",
              }}
            />

            {/* Bottom Left Blue Glow */}
            <motion.div
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -40, 20, 0],
                scale: [1, 1.15, 0.9, 1],
              }}
              transition={{
                duration: 24,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3,
              }}
              className="absolute -bottom-28 -left-20 h-[440px] w-[440px] rounded-full opacity-18 blur-[120px]"
              style={{
                background:
                  "radial-gradient(circle, #3b82f6 0%, #1d4ed8 50%, transparent 75%)",
              }}
            />

            {/* Subtle Grid texture */}
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
                `,
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          {/* Top navigation row */}
          <div className="relative z-50 flex items-center justify-between px-6 pt-6 sm:px-10">
            {/* Mobile Brand */}
            <Link href="/" className="flex items-center gap-2.5 lg:hidden">
              <KoraLogo />
              <span className="text-sm font-semibold tracking-[-0.02em] text-white">
                KoraSpace
              </span>
            </Link>

            {/* Back link & Language Switcher */}
            <div className="relative z-50 ml-auto flex items-center gap-3">
              <LanguageSwitcher variant="compact" />
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[12px] font-medium text-white/50 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to site</span>
              </Link>
            </div>
          </div>

          {/* Form wrapper */}
          <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
            {children}
          </div>

          {/* Mobile footer */}
          <div className="relative z-10 px-6 pb-6 text-center text-[11px] text-white/25 lg:hidden">
            <span>© {new Date().getFullYear()} KoraSpace. All rights reserved.</span>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ===============================================================
   BRAND LOGO
=============================================================== */

function KoraLogo() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm transition-transform duration-200 group-hover:scale-105">
      <Image
        src="/logo.png"
        alt="KoraSpace Logo"
        width={36}
        height={36}
        className="h-full w-full object-contain"
        priority
      />
    </div>
  );
}

/* ===============================================================
   PRODUCT PREVIEW MOCKUP
=============================================================== */

function ProductPreview({ t }: { t: any }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#171717] shadow-[0_25px_70px_rgba(0,0,0,0.45)]">
      {/* Window header */}
      <div className="flex h-10 items-center justify-between border-b border-white/[0.07] px-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
          <span className="text-[8.5px] font-medium text-white/40">
            {t.authLayout.workspaceCommand}
          </span>
        </div>

        <div className="h-4 w-4 rounded-full border border-white/10 bg-white/[0.04]" />
      </div>

      <div className="grid grid-cols-[105px_1fr]">
        {/* Mini sidebar */}
        <div className="border-r border-white/[0.06] p-2.5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-white p-0.5 shadow-xs">
              <Image
                src="/logo.png"
                alt="KoraSpace"
                width={16}
                height={16}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="h-2 w-10 rounded-full bg-white/20" />
          </div>

          <div className="space-y-1">
            <MiniNav active label={t.authLayout.overview} />
            <MiniNav label={t.authLayout.create} />
            <MiniNav label={t.authLayout.campaignsNav} />
            <MiniNav label={t.authLayout.analytics} />
            <MiniNav label={t.authLayout.crmNav} />
          </div>

          <div className="mt-5 border-t border-white/[0.06] pt-2">
            <MiniNav label={t.authLayout.brandKitNav} />
            <MiniNav label={t.authLayout.settings} />
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="min-w-0 p-3.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="h-2 w-24 rounded-full bg-white/25" />
              <div className="mt-1.5 h-1.5 w-36 rounded-full bg-white/[0.08]" />
            </div>

            <div className="h-5 w-16 rounded-lg bg-[#ff0a8a]/20" />
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat
              label={t.authLayout.revenue}
              value="₦8.4M"
              accent="pink"
            />
            <MiniStat
              label={t.authLayout.roas}
              value="3.42×"
              accent="blue"
            />
            <MiniStat
              label={t.authLayout.leads}
              value="1,284"
              accent="green"
            />
          </div>

          {/* Mini chart bar strip */}
          <div className="mt-3 rounded-xl border border-white/[0.07] bg-[#131313] p-2.5">
            <div className="flex items-center justify-between">
              <div className="h-1.5 w-16 rounded-full bg-white/20" />
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
                <span className="text-[7.5px] text-white/30">{t.authLayout.growth}</span>
              </div>
            </div>

            <div className="mt-3 flex h-[60px] items-end gap-1.5">
              {[28, 42, 35, 52, 48, 64, 58, 76, 68, 85, 74, 92].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-[2px] transition-all"
                    style={{
                      height: `${height}%`,
                      background:
                        index >= 9
                          ? "#ff0a8a"
                          : "rgba(255, 255, 255, 0.08)",
                    }}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniNav({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex h-6 items-center rounded-md px-2 text-[7.5px] font-medium ${
        active
          ? "border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.10] text-[#ff7fba]"
          : "text-white/30"
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-sm ${
          active ? "bg-[#ff0a8a]" : "bg-white/15"
        }`}
      />
      {label}
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "pink" | "blue" | "green";
}) {
  const accentClass =
    accent === "pink"
      ? "text-[#ff4da6]"
      : accent === "blue"
      ? "text-[#60a5fa]"
      : "text-[#34d399]";

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#131313] p-2">
      <div className="text-[7px] text-white/30">{label}</div>
      <div className={`mt-1 text-[12px] font-bold ${accentClass}`}>
        {value}
      </div>
<<<<<<< HEAD

      {/* ── Brand panel (desktop) ── */}
      <aside className="relative hidden w-[46%] flex-col justify-between p-14 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={26} height={23} className="h-[24px] w-auto" />
          <span className="font-display text-lg font-semibold text-white">
            Koraspace<span className="text-[var(--sai-indigo)]"> AI</span>
          </span>
        </Link>

        <div>
          <h2
            className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.02em] text-white xl:text-6xl"
            style={{ textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}
          >
            Social,
            <br />
            <span className="sai-gradient-text">understood.</span>
          </h2>
          <p className="mt-5 max-w-sm text-white/55">
            Deploy a personal agent that creates, engages, and converts — around
            the clock.
          </p>

          <ul className="mt-10 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h.text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                  <h.icon className="h-4 w-4 text-[var(--sai-indigo)]" />
                </span>
                <span className="text-sm leading-relaxed text-white/70">{h.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="font-data text-[11px] uppercase tracking-[0.2em] text-white/30">
          Powered by Llama 3.3 70B
        </p>
      </aside>

      {/* ── Form panel ── */}
      <main className="relative flex flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-5 pt-5 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={24} height={21} className="h-[22px] w-auto" />
            <span className="font-display text-[15px] font-semibold text-white">
              Koraspace<span className="text-[var(--sai-indigo)]"> AI</span>
            </span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
        </div>

        {/* Desktop back link */}
        <Link
          href="/"
          className="absolute right-8 top-8 hidden items-center gap-1.5 text-[13px] text-white/50 transition-colors hover:text-white lg:flex"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>

        <div className="flex flex-1 items-center justify-center px-5 py-12">
          {children}
        </div>
      </main>
=======
>>>>>>> main
    </div>
  );
}
