"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Dual Modes", href: "#dual-modes" },
  { label: "AI Engines", href: "#engines" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function FloatingNav() {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const capsuleSpring = { type: "spring" as const, stiffness: 350, damping: 28 };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed left-1/2 -translate-x-1/2 z-[999] flex items-center max-w-[95vw] xl:max-w-7xl w-full transition-all duration-300 px-2 sm:px-4 ${
        isScrolled
          ? "top-3 justify-between"
          : "top-4 md:top-6 justify-center"
      }`}
    >
      {/* ── WHEN AT TOP: Unified Glass Bar ── */}
      {!isScrolled ? (
        <motion.div
          layout
          transition={capsuleSpring}
          className="flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-[#141414]/80 px-5 py-3 sm:px-7 sm:py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <KoraNavLogo />
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-white group-hover:text-white/90">
                KoraSpace
              </span>
            </div>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ label, href }) => {
              return (
                <a
                  key={href}
                  href={href}
                  onMouseEnter={() => setHoveredPath(href)}
                  onMouseLeave={() => setHoveredPath(null)}
                  className="relative rounded-xl px-4 py-2 text-[13.5px] font-medium text-white/70 transition-colors hover:text-white"
                >
                  <span className="relative z-10">{label}</span>
                  {hoveredPath === href && (
                    <motion.span
                      layoutId="top-nav-hover"
                      className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/[0.08]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-white/80 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-[#ff0a8a] px-4.5 py-2 text-[13px] font-semibold text-white shadow-[0_4px_20px_rgba(255,10,138,0.25)] transition-all hover:bg-[#ff299b] active:scale-[0.98]"
            >
              <span>Get started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMobileMenu((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="flex lg:hidden items-center justify-center h-9 w-9 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white transition-colors hover:bg-white/[0.08]"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </motion.div>
      ) : (
        /* ── WHEN SCROLLED: Clean Glass Bar ── */
        <motion.div
          layout
          transition={capsuleSpring}
          className="flex w-full items-center justify-between rounded-2xl border border-white/[0.10] bg-[#121212]/95 px-4 py-2.5 sm:px-6 sm:py-3 shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <KoraNavLogo />
            <span className="font-display text-base font-bold tracking-tight text-white group-hover:text-white/90">
              KoraSpace
            </span>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ label, href }) => {
              return (
                <a
                  key={href}
                  href={href}
                  onMouseEnter={() => setHoveredPath(href)}
                  onMouseLeave={() => setHoveredPath(null)}
                  className="relative rounded-lg px-3.5 py-1.5 text-[13px] font-medium text-white/70 transition-colors hover:text-white"
                >
                  <span className="relative z-10">{label}</span>
                  {hoveredPath === href && (
                    <motion.span
                      layoutId="scrolled-nav-hover"
                      className="absolute inset-0 rounded-lg bg-white/[0.06] border border-white/[0.08]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden lg:flex items-center gap-2.5">
            <Link
              href="/login"
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[12.5px] font-medium text-white/80 transition-all hover:border-white/20 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#ff0a8a] px-4 py-1.5 text-[12.5px] font-semibold text-white shadow-[0_4px_18px_rgba(255,10,138,0.25)] transition-all hover:bg-[#ff299b]"
            >
              <span>Get started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMobileMenu((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="flex lg:hidden items-center justify-center h-8 w-8 rounded-lg border border-white/[0.08] bg-white/[0.04] text-white"
          >
            {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </motion.div>
      )}

      {/* ── Mobile Menu Dropdown ── */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute left-2 right-2 top-full mt-2 rounded-2xl border border-white/[0.10] bg-[#161616] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl lg:hidden"
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setShowMobileMenu(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  {label}
                </a>
              ))}

              <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.03] py-2.5 text-xs font-semibold text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#ff0a8a] py-2.5 text-xs font-semibold text-white shadow-[0_4px_18px_rgba(255,10,138,0.25)]"
                >
                  <span>Get started</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function KoraNavLogo() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff0a8a] to-[#3b82f6] p-[1px] shadow-sm">
      <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#141414]">
        <img src="/logo.png" alt="KoraSpace" className="h-5 w-5 object-contain" />
      </div>
    </div>
  );
}


