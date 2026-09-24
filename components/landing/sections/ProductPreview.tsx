"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { FloatingCard } from "@/components/landing/primitives";
import { DashboardShowcase } from "@/components/landing/DashboardShowcase";

/**
 * Section 08 — product preview.
 *
 * One real environment, with intelligence floating at its edges: a
 * recommendation breaking the top-left corner and an opportunity breaking the
 * bottom-right, as if the system is surfacing things from inside the workspace.
 *
 * Then the handoff. The homepage sells the outcome and stops; these three
 * links are where a curious visitor goes to see how each part actually works.
 */

const PATHS = [
  { href: "/product/create", label: "Create" },
  { href: "/product/understand", label: "Understand" },
  { href: "/product/grow", label: "Grow" },
];

export function ProductPreview() {
  return (
    <DashboardShowcase
      overlay={
        <>
          <FloatingCard
            depth="front"
            drift="hover"
            className="sm:-left-4 sm:-top-14 sm:w-[230px] lg:-left-6 xl:-left-12"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-[#ff9fc9]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff9fc9]">
                Kora recommends
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/80">
              Your Thursday posts are pulling ahead. Move this week&rsquo;s launch there.
            </p>
          </FloatingCard>

          <FloatingCard
            depth="back"
            drift="lift"
            className="sm:-bottom-12 sm:-right-4 sm:w-[220px] lg:-right-6 xl:-right-12"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
              Opportunity
            </span>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/80">
              Comments on your last reel are asking for a tutorial.
            </p>
          </FloatingCard>
        </>
      }
      after={
        <nav
          aria-label="Explore the product"
          className="mt-16 flex flex-col items-center gap-4 sm:mt-20 sm:flex-row sm:justify-center sm:gap-2"
        >
          <span className="text-[13px] text-white/45 sm:mr-3">Go deeper:</span>
          {PATHS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="group inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.03] px-5 text-[14px] font-semibold text-white/85 transition-colors duration-300 hover:border-[#ff0a8a]/40 hover:text-white"
            >
              {label}
              <ArrowRight className="h-3.5 w-3.5 text-[#ff9fc9] transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </nav>
      }
    />
  );
}

export default ProductPreview;
