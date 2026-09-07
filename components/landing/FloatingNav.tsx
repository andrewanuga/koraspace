"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "Stories", href: "#stories" },
];

export function FloatingNav() {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
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
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed left-1/2 -translate-x-1/2 z-[9999] flex items-center max-w-[95vw] xl:max-w-7xl w-full transition-all duration-300 px-2 sm:px-4 ${
        isScrolled
          ? "top-2.5 justify-between"
          : "top-4 md:top-6 justify-center"
      }`}
    >
      {/* ── WHEN AT TOP: Unified Full White Glass Bar ── */}
      {!isScrolled ? (
        <motion.div
          layout
          transition={capsuleSpring}
          className="flex w-full items-center justify-between rounded-full px-5 py-3 sm:px-8 sm:py-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.18),0_0_20px_rgba(255,255,255,0.06)] transition-all duration-300"
          style={{
            background:
              "linear-gradient(rgba(255,255,255,0.14), rgba(255,255,255,0.14)) padding-box, linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.15) 100%) border-box",
            border: "1.5px solid transparent",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <motion.div whileHover={{ rotate: 12, scale: 1.05 }} className="relative h-9 w-9 sm:h-10 sm:w-10">
              <Image
                src="/logo.png"
                alt="Koraspace"
                width={40}
                height={40}
                className="h-full w-full object-contain"
                priority
              />
            </motion.div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow-sm">
              Koraspace
            </span>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map(({ label, href }) => {
              const isAnchorTag = href.startsWith("#");
              const content = (
                <motion.span
                  className="relative z-10 px-5 py-2.5 block text-[15px] font-medium tracking-wide transition-colors text-white/90 hover:text-white"
                  onMouseEnter={() => setHoveredPath(href)}
                >
                  {label}
                  {hoveredPath === href && (
                    <motion.span
                      layoutId="top-nav-hover"
                      className="absolute inset-0 rounded-full -z-10 shadow-inner"
                      style={{
                        background:
                          "linear-gradient(rgba(255,255,255,0.22), rgba(255,255,255,0.22)) padding-box, linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.2)) border-box",
                        border: "1px solid transparent",
                        backdropFilter: "blur(12px)",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                </motion.span>
              );

              return (
                <div key={href} onMouseLeave={() => setHoveredPath(null)} className="relative">
                  {isAnchorTag ? <a href={href}>{content}</a> : <Link href={href}>{content}</Link>}
                </div>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <button
                className="rounded-full px-5 py-2.5 text-[15px] font-medium text-white/90 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)) padding-box, linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.15)) border-box",
                  border: "1px solid transparent",
                }}
              >
                Sign in
              </button>
            </Link>
            <Link href="/signup">
              <button
                className="rounded-full px-6 py-2.5 text-[15px] font-semibold text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #0066FF 0%, #FF2E93 100%)",
                  boxShadow: "0 0 24px -4px rgba(0,102,255,0.6), 0 0 16px -4px rgba(255,46,147,0.4)",
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              >
                Get started
              </button>
            </Link>
          </div>

          {/* Mobile Toggle Button */}
          <motion.button
            onClick={() => setShowMobileMenu((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="block text-white lg:hidden rounded-full p-3 cursor-pointer focus:outline-none transition-all duration-300"
            style={{
              background:
                "linear-gradient(rgba(255,255,255,0.16), rgba(255,255,255,0.16)) padding-box, linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15)) border-box",
              border: "1.5px solid transparent",
            }}
            whileTap={{ scale: 0.92 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={showMobileMenu ? "close" : "menu"}
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 45, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </motion.div>
      ) : (
        /* ── WHEN SCROLLED: Separated 3-Capsule Design ── */
        <>
          {/* 1. Brand Logo Capsule */}
          <Link href="/">
            <motion.div
              layout
              transition={capsuleSpring}
              className="flex items-center gap-3 font-bold rounded-full py-2.5 px-5 shadow-[0_10px_35px_rgba(0,0,0,0.22),0_0_15px_rgba(255,255,255,0.08)] transition-all duration-300 hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(rgba(255,255,255,0.22), rgba(255,255,255,0.22)) padding-box, linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%) border-box",
                border: "1.5px solid transparent",
                backdropFilter: "blur(24px)",
              }}
            >
              <motion.div whileHover={{ rotate: 12, scale: 1.05 }} className="relative h-8 w-8 sm:h-9 sm:w-9">
                <Image
                  src="/logo.png"
                  alt="Koraspace"
                  width={36}
                  height={36}
                  className="h-full w-full object-contain"
                  priority
                />
              </motion.div>
              <span className="font-display text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-sm">
                Koraspace
              </span>
            </motion.div>
          </Link>

          {/* 2. Desktop Navigation Menus with Sliding Hover Pill */}
          <motion.nav
            layout
            transition={capsuleSpring}
            className="hidden lg:flex gap-1.5 items-center text-white rounded-full py-2 px-3 shadow-[0_10px_35px_rgba(0,0,0,0.22),0_0_15px_rgba(255,255,255,0.08)] transition-all duration-300"
            style={{
              background:
                "linear-gradient(rgba(255,255,255,0.22), rgba(255,255,255,0.22)) padding-box, linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%) border-box",
              border: "1.5px solid transparent",
              backdropFilter: "blur(24px)",
            }}
          >
            {navLinks.map(({ label, href }) => {
              const isAnchorTag = href.startsWith("#");
              const content = (
                <motion.span
                  className="relative z-10 px-5 py-2 block text-[15px] font-medium tracking-wide transition-colors text-white/90 hover:text-white"
                  onMouseEnter={() => setHoveredPath(href)}
                >
                  {label}
                  {hoveredPath === href && (
                    <motion.span
                      layoutId="desktop-nav-hover"
                      className="absolute inset-0 rounded-full -z-10 shadow-inner"
                      style={{
                        background:
                          "linear-gradient(rgba(255,255,255,0.25), rgba(255,255,255,0.25)) padding-box, linear-gradient(135deg, rgba(255,255,255,0.45), rgba(255,255,255,0.2)) border-box",
                        border: "1px solid transparent",
                        backdropFilter: "blur(12px)",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                </motion.span>
              );

              return (
                <div key={href} onMouseLeave={() => setHoveredPath(null)} className="relative">
                  {isAnchorTag ? <a href={href}>{content}</a> : <Link href={href}>{content}</Link>}
                </div>
              );
            })}
          </motion.nav>

          {/* 3. Action CTA Buttons Capsule */}
          <motion.div
            layout
            transition={capsuleSpring}
            className="hidden lg:flex items-center gap-2.5 rounded-full py-2 px-3 shadow-[0_10px_35px_rgba(0,0,0,0.22),0_0_15px_rgba(255,255,255,0.08)] transition-all duration-300"
            style={{
              background:
                "linear-gradient(rgba(255,255,255,0.22), rgba(255,255,255,0.22)) padding-box, linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%) border-box",
              border: "1.5px solid transparent",
              backdropFilter: "blur(24px)",
            }}
          >
            <Link href="/login">
              <button
                className="rounded-full px-5 py-2 text-[14.5px] font-medium text-white/90 hover:text-white transition-all hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)) padding-box, linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15)) border-box",
                  border: "1px solid transparent",
                }}
              >
                Sign in
              </button>
            </Link>
            <Link href="/signup">
              <button
                className="rounded-full px-5.5 py-2 text-[14.5px] font-semibold text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #0066FF 0%, #FF2E93 100%)",
                  boxShadow: "0 0 24px -4px rgba(0,102,255,0.6), 0 0 16px -4px rgba(255,46,147,0.4)",
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              >
                Get started
              </button>
            </Link>
          </motion.div>

          {/* Mobile Toggle Button */}
          <motion.button
            layout
            transition={capsuleSpring}
            onClick={() => setShowMobileMenu((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="block text-white lg:hidden rounded-full p-3 cursor-pointer focus:outline-none transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.22)]"
            style={{
              background:
                "linear-gradient(rgba(255,255,255,0.22), rgba(255,255,255,0.22)) padding-box, linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%) border-box",
              border: "1.5px solid transparent",
              backdropFilter: "blur(24px)",
            }}
            whileTap={{ scale: 0.92 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={showMobileMenu ? "close" : "menu"}
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 45, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </>
      )}

      {/* Enhanced Mobile Dropdown Overlay */}
      <AnimatePresence>
        {showMobileMenu && <MobileMenu closeMenu={() => setShowMobileMenu(false)} />}
      </AnimatePresence>
    </motion.header>
  );
}

interface MobileMenuProps {
  closeMenu: () => void;
}

function MobileMenu({ closeMenu }: MobileMenuProps) {
  const list: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.08,
      },
    },
  };

  const item: Variants = {
    hidden: { y: 16, opacity: 0, filter: "blur(6px)" },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 140, damping: 18 },
    },
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="left-2 right-2 sm:left-4 sm:right-4 absolute p-6 top-20 rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden origin-top z-[9999]"
      style={{
        background:
          "linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0.2)) padding-box, linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%) border-box",
        border: "1.5px solid transparent",
        backdropFilter: "blur(32px)",
      }}
    >
      <motion.ul
        variants={list}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-y-2 text-base font-medium"
      >
        {navLinks.map(({ label, href }) => {
          const isAnchorTag = href.startsWith("#");
          const renderLink = (
            <span className="block py-3 px-5 rounded-2xl text-[16px] text-white/90 active:bg-white/20 hover:bg-white/15 active:text-white transition-colors">
              {label}
            </span>
          );

          return (
            <motion.li
              key={href}
              variants={item}
              onClick={closeMenu}
              className="w-full list-none"
            >
              {isAnchorTag ? (
                <a href={href}>{renderLink}</a>
              ) : (
                <Link href={href}>{renderLink}</Link>
              )}
            </motion.li>
          );
        })}

        {/* Mobile View CTA Access Additions */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row gap-3 pt-5 mt-3 border-t border-white/15"
        >
          <Link href="/login" onClick={closeMenu} className="w-full">
            <button
              className="w-full rounded-2xl py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/20"
              style={{
                background:
                  "linear-gradient(rgba(255,255,255,0.15), rgba(255,255,255,0.15)) padding-box, linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15)) border-box",
                border: "1px solid transparent",
              }}
            >
              Sign in
            </button>
          </Link>
          <Link href="/signup" onClick={closeMenu} className="w-full">
            <button
              className="w-full rounded-2xl py-3 text-[15px] font-semibold text-white transition-transform active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #0066FF 0%, #FF2E93 100%)",
                boxShadow: "0 0 24px -4px rgba(0,102,255,0.6), 0 0 16px -4px rgba(255,46,147,0.4)",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              Get started
            </button>
          </Link>
        </motion.div>
      </motion.ul>
    </motion.nav>
  );
}


