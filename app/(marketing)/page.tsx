import { Preloader } from "@/components/landing/Preloader";
import { Hero } from "@/components/landing/Hero";
import { SectionThread } from "@/components/landing/primitives";
import { FragmentedMarketing } from "@/components/landing/sections/FragmentedMarketing";
import { OutcomesSection } from "@/components/landing/sections/OutcomesSection";
import { UnderstandBrand } from "@/components/landing/sections/UnderstandBrand";
import { CreateWithContext } from "@/components/landing/sections/CreateWithContext";
import { LearnFromResults } from "@/components/landing/sections/LearnFromResults";
import { SystemThatLearns } from "@/components/landing/sections/SystemThatLearns";
import { ProductPreview } from "@/components/landing/sections/ProductPreview";
import { FinalCTA } from "@/components/landing/sections/FinalCTA";

/**
 * The homepage sells the outcome; the product pages carry the detail.
 *
 * Read top to bottom it is one story: the promise, the problem, what changes,
 * how KoraSpace understands, creates and learns, the system that turns data
 * into a decision and repeats it, a look inside, and the close.
 *
 *   01 Hero                      the promise
 *   02 Fragmented marketing      name the problem
 *   03 What you get back         the outcome, in three scenes
 *   04 Understand your brand     ─┐
 *   05 Create with context        ├ the alternating run
 *   06 Learn from results        ─┘
 *   07 Data → decision + loop    the centrepiece
 *   08 Product preview           proof, then handoff to /product/*
 *      Close                     the loop returns
 */

/**
 * Background tone, one continuous layer behind every section.
 *
 * It covers everything BELOW the hero rather than the whole page. The hero
 * paints its own #07050d ground and its height varies with the viewport, so a
 * percentage stop can never reliably line up with its bottom edge. Starting
 * the layer at that edge on #07050d makes the join exact at any height; it
 * ends on the footer's #070d24 for the same reason.
 *
 * In between it tints faintly warm through the outcome sections and cool
 * through the intelligence section, so the chapters register without a hard
 * edge anywhere. Deliberately close in value to its neighbours: this is
 * atmosphere, not decoration.
 */
const TONE = `linear-gradient(180deg,
  #07050d 0%,
  #0f0b15 12%,
  #120c17 30%,
  #0f0c16 50%,
  #0c0c1b 70%,
  #0a0d20 87%,
  #070d24 100%)`;

export default function LandingPage() {
  return (
    <>
      <Preloader />

      <Hero />

      <div className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: TONE }}
        />

        {/* SOCIAL PROOF STRIP — intentionally empty. Goes in when there are real
            customers to name. Nothing invented sits on this page. */}

        <FragmentedMarketing />

        {/* the core that resolves the scatter leads straight into what it gives back */}
        <SectionThread />

        <OutcomesSection />

        <UnderstandBrand />
        <CreateWithContext />
        <LearnFromResults />

        {/* results feed the intelligence */}
        <SectionThread />

        <SystemThatLearns />

        {/* the system, then a look inside it */}
        <SectionThread />

        <ProductPreview />

        {/* RESULTS / CASE STUDIES and TESTIMONIAL WALL — insertion points, same
            rule as the social proof strip above. */}

        <FinalCTA />
      </div>
    </>
  );
}
