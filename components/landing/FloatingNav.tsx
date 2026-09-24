"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowRight, ChevronDown, Sun, Moon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import {
  AudienceMenu,
  IntegrationsMenu,
  ProductMenu,
  ResourcesMenu,
} from "@/components/landing/NavMenus";
import {
  getMobileSections,
  getNavItems,
  type NavItem,
} from "@/components/landing/nav-data";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export function FloatingNav() {
  const [isLoaded, setIsLoaded] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { setThemeMode, preferences } = usePreferences();
  const { t } = useLanguage();

  const currentNavItems = getNavItems(t);
  const currentMobileSections = getMobileSections(t);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? (theme || preferences.theme_mode || "dark") : "dark";
  const activeResolved = mounted ? (resolvedTheme || (activeTheme === "light" ? "light" : "dark")) : "dark";
  const isDark = activeTheme === "dark" || activeResolved === "dark";

  const toggleTheme = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const target = isDark ? "light" : "dark";
    setTheme(target);
    setThemeMode(target);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const capsuleSpring = { type: "spring" as const, stiffness: 350, damping: 28 };

  return (
    <AnimatePresence>
      {isLoaded && (
        <motion.header
          initial={{ y: -30, opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200/90 bg-white/85 text-slate-900 px-5 py-3 sm:px-7 sm:py-3.5 shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#141414]/80 dark:text-white dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-colors duration-200"
            >
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <KoraNavLogo />
                <div>
                  <span className="font-display text-xl font-bold tracking-tight text-slate-900 group-hover:text-slate-700 dark:text-white dark:group-hover:text-white/90">
                    KoraSpace
                  </span>
                </div>
              </Link>

              {/* Center Nav Links */}
              <DesktopNavItems layoutId="top-nav-hover" navItems={currentNavItems} />

              {/* Right Action CTAs */}
              <div className="hidden lg:flex items-center gap-3">
                <LanguageSwitcher />

                {mounted && (
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white"
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    aria-label="Toggle Theme"
                  >
                    {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
                  </button>
                )}

                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-[13px] font-medium text-slate-700 transition-all hover:bg-slate-200 hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/80 dark:hover:border-white/20 dark:hover:bg-white/[0.06] dark:hover:text-white xl:px-4"
                >
                  {t.nav.signIn}
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#ff0a8a] px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_4px_20px_rgba(255,10,138,0.25)] transition-all hover:bg-[#ff299b] active:scale-[0.98] xl:px-4.5"
                >
                  <span>{t.nav.getStarted}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Mobile Toggle Button */}
              <div className="flex items-center gap-2 lg:hidden">
                <LanguageSwitcher variant="minimal" />
                {mounted && (
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    aria-label="Toggle Theme"
                  >
                    {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowMobileMenu((prev) => !prev)}
                  aria-label="Toggle navigation menu"
                  className="flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-900 transition-colors hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
                >
                  {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </motion.div>
          ) : (
            /* ── WHEN SCROLLED: Clean Glass Bar ── */
            <motion.div
              layout
              transition={capsuleSpring}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200/90 bg-white/95 text-slate-900 px-4 py-2.5 sm:px-6 sm:py-3 shadow-md backdrop-blur-xl dark:border-white/[0.10] dark:bg-[#121212]/95 dark:text-white dark:shadow-[0_16px_50px_rgba(0,0,0,0.6)] transition-colors duration-200"
            >
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 group">
                <KoraNavLogo />
                <span className="font-display text-lg font-bold tracking-tight text-slate-900 group-hover:text-slate-700 dark:text-white dark:group-hover:text-white/90">
                  KoraSpace
                </span>
              </Link>

              {/* Center Nav Links */}
              <DesktopNavItems compact layoutId="scrolled-nav-hover" navItems={currentNavItems} />

              {/* Right Action CTAs */}
              <div className="hidden lg:flex items-center gap-2.5">
                <LanguageSwitcher variant="compact" />

                {mounted && (
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white"
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    aria-label="Toggle Theme"
                  >
                    {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-slate-700" />}
                  </button>
                )}

                <Link
                  href="/login"
                  className="rounded-lg border border-slate-200 bg-slate-100/80 px-3.5 py-1.5 text-[12.5px] font-medium text-slate-700 transition-all hover:bg-slate-200 hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/80 dark:hover:border-white/20 dark:hover:text-white"
                >
                  {t.nav.signIn}
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#ff0a8a] px-4 py-1.5 text-[12.5px] font-semibold text-white shadow-[0_4px_18px_rgba(255,10,138,0.25)] transition-all hover:bg-[#ff299b]"
                >
                  <span>{t.nav.getStarted}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Mobile Toggle Button */}
              <div className="flex items-center gap-1.5 lg:hidden">
                <LanguageSwitcher variant="minimal" />
                {mounted && (
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    aria-label="Toggle Theme"
                  >
                    {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-slate-700" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowMobileMenu((prev) => !prev)}
                  aria-label="Toggle navigation menu"
                  className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                >
                  {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
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
                className="absolute left-2 right-2 top-full mt-2 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 text-slate-900 p-5 shadow-2xl backdrop-blur-2xl dark:border-white/[0.10] dark:bg-[#161616] dark:text-white lg:hidden"
              >
                <div className="flex flex-col space-y-2.5">
                  <div className="pb-3 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-neutral-400">
                      {t.nav.languageAndCurrency}
                    </span>
                    <LanguageSwitcher />
                  </div>
                  {currentNavItems.map((item) => {
                    const section = currentMobileSections.find((s) => s.label === item.label);

                    if (!section) {
                      return (
                        <a
                          key={item.label}
                          href={"href" in item ? item.href : undefined}
                          onClick={() => setShowMobileMenu(false)}
                          className="block rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-800 hover:bg-slate-100 hover:text-slate-900 dark:text-white/85 dark:hover:bg-white/[0.06] dark:hover:text-white transition-colors"
                        >
                          {item.label}
                        </a>
                      );
                    }

                    const isOpen = openSection === item.label;

                    return (
                      <div key={item.label}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpenSection(isOpen ? null : item.label)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-800 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-white/85 dark:hover:bg-white/[0.06] dark:hover:text-white"
                        >
                          {item.label}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="ml-3 mt-0.5 flex flex-col gap-2 border-l border-slate-200 pl-3 pb-1 dark:border-white/[0.08]">
                                {section.groups.map((group, gi) => (
                                  <div key={group.title ?? gi}>
                                    {group.title && (
                                      <p className="px-2.5 pb-0.5 pt-1 text-[11px] font-bold tracking-[0.16em] text-slate-400 dark:text-white/40">
                                        {group.title.toUpperCase()}
                                      </p>
                                    )}
                                    {group.items.map((child) =>
                                      child.href ? (
                                        <a
                                          key={child.label}
                                          href={child.href}
                                          onClick={() => setShowMobileMenu(false)}
                                          className="block rounded-lg px-2.5 py-2 text-[14.5px] text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-white/65 dark:hover:bg-white/[0.05] dark:hover:text-white"
                                        >
                                          {child.label}
                                        </a>
                                      ) : (
                                        <span
                                          key={child.label}
                                          aria-disabled="true"
                                          className="block cursor-default rounded-lg px-2.5 py-2 text-[14.5px] text-slate-500 dark:text-white/65"
                                        >
                                          {child.label}
                                        </span>
                                      )
                                    )}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] grid grid-cols-2 gap-2.5">
                    <Link
                      href="/login"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 py-3 text-[13.5px] font-semibold text-slate-800 transition-colors hover:bg-slate-200 dark:border-white/[0.10] dark:bg-white/[0.03] dark:text-white"
                    >
                      {t.nav.signIn}
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[#ff0a8a] py-3 text-[13.5px] font-semibold text-white shadow-[0_4px_18px_rgba(255,10,138,0.25)]"
                    >
                      <span>{t.nav.getStarted}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
}

function DesktopNavItems({
  compact = false,
  layoutId,
  navItems,
}: {
  compact?: boolean;
  layoutId: string;
  navItems: NavItem[];
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openNow = (label: string) => {
    cancelClose();
    setHovered(label);
    setOpenMenu(label);
  };

  const closeSoon = () => {
    cancelClose();
    setHovered(null);
    closeTimer.current = window.setTimeout(() => {
      setOpenMenu(null);
      closeTimer.current = null;
    }, 150);
  };

  useEffect(() => cancelClose, []);

  useEffect(() => {
    if (!openMenu) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const trigger = triggerRefs.current[openMenu];
        cancelClose();
        setOpenMenu(null);
        trigger?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  const itemPadding = compact ? "px-2 py-1.5 xl:px-3.5" : "px-2.5 py-2 xl:px-4";
  const itemText = compact
    ? "text-[13.5px] xl:text-[14.5px]"
    : "text-[14px] xl:text-[15px]";
  const itemRadius = compact ? "rounded-lg" : "rounded-xl";

  const renderPanel = (kind: NavItem["kind"]) => {
    if (kind === "product") return <ProductMenu />;
    if (kind === "audience") return <AudienceMenu />;
    if (kind === "integrations") return <IntegrationsMenu />;
    if (kind === "resources") return <ResourcesMenu />;
    return null;
  };

  return (
    <>
      {openMenu && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 -z-10 hidden bg-black/25 backdrop-blur-[3px] lg:block"
        />
      )}

      <nav ref={navRef} className="hidden lg:flex items-center gap-0.5 xl:gap-1">
        {navItems.map((item) => {
          const isOpen = openMenu === item.label;
          const isMenu = item.kind !== "link";
          const isHoverMenu = item.kind === "integrations";

          const pill = (hovered ?? openMenu) === item.label && (
            <motion.span
              layoutId={layoutId}
              className={`absolute inset-0 ${itemRadius} bg-slate-200/80 border border-slate-300/80 dark:bg-white/[0.06] dark:border-white/[0.08]`}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          );

          const panel = isMenu && isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className={`absolute top-full z-10 max-w-[calc(100vw-2rem)] pt-2 ${
                "align" in item && item.align === "right" ? "right-0" : "left-0"
              }`}
            >
              {renderPanel(item.kind)}
            </motion.div>
          );

          if (isHoverMenu) {
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => openNow(item.label)}
                onMouseLeave={closeSoon}
              >
                <a
                  href={item.href}
                  className={`relative flex items-center gap-1 whitespace-nowrap ${itemRadius} ${itemPadding} ${itemText} font-medium transition-colors ${
                    isOpen ? "text-slate-900 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white"
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  <ChevronDown
                    className={`relative z-10 h-3.5 w-3.5 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-slate-900 dark:text-white" : "text-slate-400 dark:text-white/50"
                    }`}
                  />
                  {pill}
                </a>
                {panel}
              </div>
            );
          }

          if (!isMenu) {
            return (
              <a
                key={item.label}
                href={item.href}
                onMouseEnter={() => setHovered(item.label)}
                onMouseLeave={() => setHovered(null)}
                className={`relative whitespace-nowrap ${itemRadius} ${itemPadding} ${itemText} font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-white/70 dark:hover:text-white`}
              >
                <span className="relative z-10">{item.label}</span>
                {pill}
              </a>
            );
          }

          return (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => openNow(item.label)}
              onMouseLeave={closeSoon}
            >
              <button
                ref={(el) => {
                  triggerRefs.current[item.label] = el;
                }}
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onFocus={() => openNow(item.label)}
                onClick={() => (isOpen ? setOpenMenu(null) : openNow(item.label))}
                className={`relative flex items-center gap-1 whitespace-nowrap ${itemRadius} ${itemPadding} ${itemText} font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ff9fc9] cursor-pointer ${
                  isOpen ? "text-slate-900 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                <ChevronDown
                  className={`relative z-10 h-3.5 w-3.5 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-slate-900 dark:text-white" : "text-slate-400 dark:text-white/50"
                  }`}
                />
                {pill}
              </button>
              {panel}
            </div>
          );
        })}
      </nav>
    </>
  );
}

function KoraNavLogo() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff0a8a] to-[#3b82f6] p-[1px] shadow-sm">
      <div className="flex h-full w-full items-center justify-center rounded-[13px] bg-[#141414]">
        <img src="/logo.png" alt="KoraSpace" className="h-7 w-7 object-contain" />
      </div>
    </div>
  );
}
