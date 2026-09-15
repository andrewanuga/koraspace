"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AudienceMenu,
  IntegrationsMenu,
  ProductMenu,
  ResourcesMenu,
} from "@/components/landing/NavMenus";
import { mobileSections, navItems, type NavItem } from "@/components/landing/nav-data";

export function FloatingNav() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    // Reveal immediately unless this page actually has a preloader running.
    //
    // Only the homepage renders <Preloader/>; every other marketing page would
    // otherwise sit here with no navbar until the 2400ms fallback below fired.
    // That failure mode hides on client-side navigation — the layout does not
    // remount, so `sai-loaded` is still set — and only shows on a cold load.
    const hasPreloader =
      typeof document !== "undefined" &&
      document.querySelector("[data-preloader]") !== null;

    if (
      typeof document !== "undefined" &&
      (!hasPreloader ||
        document.documentElement.classList.contains("sai-loaded"))
    ) {
      setIsLoaded(true);
    }

    const onLoaderDone = () => {
      setIsLoaded(true);
    };

    window.addEventListener("koraspace-loader-done", onLoaderDone);

    // Safety fallback in case preloader completes before listener attached
    const fallbackTimer = window.setTimeout(() => {
      setIsLoaded(true);
    }, 2400);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("koraspace-loader-done", onLoaderDone);
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(fallbackTimer);
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
          className="flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-[#141414]/80 px-5 py-3 sm:px-7 sm:py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <KoraNavLogo />
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-white group-hover:text-white/90">
                KoraSpace
              </span>
            </div>
          </Link>

          {/* Center Nav Links */}
          <DesktopNavItems layoutId="top-nav-hover" />

          {/* Right Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="whitespace-nowrap rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] font-medium text-white/80 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white xl:px-4"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#ff0a8a] px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_4px_20px_rgba(255,10,138,0.25)] transition-all hover:bg-[#ff299b] active:scale-[0.98] xl:px-4.5"
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
            <span className="font-display text-lg font-bold tracking-tight text-white group-hover:text-white/90">
              KoraSpace
            </span>
          </Link>

          {/* Center Nav Links */}
          <DesktopNavItems compact layoutId="scrolled-nav-hover" />

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
            className="absolute left-2 right-2 top-full mt-2 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-white/[0.10] bg-[#161616] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl lg:hidden"
          >
            <div className="flex flex-col space-y-1.5">
              {navItems.map((item) => {
                const section = mobileSections().find((s) => s.label === item.label);

                // Plain links (Integrations, Pricing) navigate directly.
                if (!section) {
                  return (
                    <a
                      key={item.label}
                      href={"href" in item ? item.href : undefined}
                      onClick={() => setShowMobileMenu(false)}
                      className="block rounded-xl px-3 py-2.5 text-[15px] font-medium text-white/85 hover:bg-white/[0.06] hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  );
                }

                // Collapsible: 33 always-visible rows would be unusable, so only
                // one section is expanded at a time.
                const isOpen = openSection === item.label;

                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenSection(isOpen ? null : item.label)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium text-white/85 transition-colors hover:bg-white/[0.06] hover:text-white"
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
                          <div className="ml-3 mt-0.5 flex flex-col gap-2 border-l border-white/[0.08] pl-3 pb-1">
                            {section.groups.map((group, gi) => (
                              <div key={group.title ?? gi}>
                                {group.title && (
                                  <p className="px-2.5 pb-0.5 pt-1 text-[11px] font-bold tracking-[0.16em] text-white/40">
                                    {group.title.toUpperCase()}
                                  </p>
                                )}
                                {group.items.map((child) =>
                                  child.href ? (
                                    <a
                                      key={child.label}
                                      href={child.href}
                                      onClick={() => setShowMobileMenu(false)}
                                      className="block rounded-lg px-2.5 py-2 text-[14.5px] text-white/65 transition-colors hover:bg-white/[0.05] hover:text-white"
                                    >
                                      {child.label}
                                    </a>
                                  ) : (
                                    <span
                                      key={child.label}
                                      aria-disabled="true"
                                      className="block cursor-default rounded-lg px-2.5 py-2 text-[14.5px] text-white/65"
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

              <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.03] py-3 text-[13.5px] font-semibold text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#ff0a8a] py-3 text-[13.5px] font-semibold text-white shadow-[0_4px_18px_rgba(255,10,138,0.25)]"
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
      )}
    </AnimatePresence>
  );
}

/**
 * Shared by both desktop bar states (top + scrolled) so the menu logic isn't
 * written twice. `compact` is the scrolled bar's tighter sizing.
 *
 * All menus open on hover with a rotating arrow (buffer.com behavior). Click,
 * focus and Escape are kept as the touch and keyboard paths.
 */
function DesktopNavItems({
  compact = false,
  layoutId,
}: {
  compact?: boolean;
  layoutId: string;
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

  /** Entering a trigger opens it immediately, even if another is closing. */
  const openNow = (label: string) => {
    cancelClose();
    setHovered(label);
    setOpenMenu(label);
  };

  /**
   * Short grace period before closing: without it, the diagonal move from a
   * trigger down into its own panel closes the menu mid-travel.
   */
  const closeSoon = () => {
    cancelClose();
    setHovered(null);
    closeTimer.current = window.setTimeout(() => {
      setOpenMenu(null);
      closeTimer.current = null;
    }, 150);
  };

  // Don't let a pending close fire against an unmounted component.
  useEffect(() => cancelClose, []);

  // Click-outside + Escape close whichever menu is open.
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

  // Tighter at exactly lg (1024px), where five items + three chevrons + logo
  // + CTAs is the worst case, then roomier from xl up. Type steps up at xl for
  // the same reason — 15px everywhere would overflow the bar at 1024px.
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
      {/* Backdrop blur behind an open menu. No exit animation on purpose:
          AnimatePresence left these mounted after close, and a lingering
          overlay swallows clicks on the page beneath. */}
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

          // The open trigger stays lit, but the pill shares one layoutId, so
          // exactly one may exist: the cursor wins, falling back to the open menu.
          const pill = (hovered ?? openMenu) === item.label && (
            <motion.span
              layoutId={layoutId}
              className={`absolute inset-0 ${itemRadius} bg-white/[0.06] border border-white/[0.08]`}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          );

          const panel = isMenu && isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              // pt-2 keeps the trigger→panel gap inside the hover target.
              // max-w is a safety net so no panel can exceed the viewport even
              // if its alignment is wrong for some width.
              className={`absolute top-full z-10 max-w-[calc(100vw-2rem)] pt-2 ${
                "align" in item && item.align === "right" ? "right-0" : "left-0"
              }`}
            >
              {renderPanel(item.kind)}
            </motion.div>
          );

          // Integrations stays a real link, but it does open a panel on hover,
          // so it carries the same chevron as the other menus — without one the
          // affordance was inconsistent with what it actually does.
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
                    isOpen ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  <ChevronDown
                    className={`relative z-10 h-3.5 w-3.5 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
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
                className={`relative whitespace-nowrap ${itemRadius} ${itemPadding} ${itemText} font-medium text-white/70 transition-colors hover:text-white`}
              >
                <span className="relative z-10">{item.label}</span>
                {pill}
              </a>
            );
          }

          return (
            // Hover lives on the wrapper, which contains the panel too, so
            // moving the cursor into the panel doesn't count as leaving.
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
                className={`relative flex items-center gap-1 whitespace-nowrap ${itemRadius} ${itemPadding} ${itemText} font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ff9fc9] ${
                  isOpen ? "text-white" : "text-white/70 hover:text-white"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                <ChevronDown
                  className={`relative z-10 h-3.5 w-3.5 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
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


