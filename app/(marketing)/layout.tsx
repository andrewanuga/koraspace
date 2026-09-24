import { FloatingNav } from "@/components/landing/FloatingNav";
import { SiteFooter } from "@/components/landing/sections/SiteFooter";

/**
 * Shell shared by every public marketing page.
 *
 * Holds the nav, the footer and the dark ground so the homepage and the deeper
 * product pages cannot drift apart. Deliberately does NOT render <Preloader/>:
 * that is a homepage-only intro, and mounting it here would replay the full
 * loading sequence on every navigation.
 *
 * /privacy and /terms stay outside this group — they bring their own header via
 * LegalShell, so they would end up with two.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#121212] selection:bg-[#ff0a8a]/20 selection:text-[#ff0a8a]">
      <FloatingNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
