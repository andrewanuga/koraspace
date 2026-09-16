import { Preloader } from "@/components/landing/Preloader";
import { Hero } from "@/components/landing/Hero";
import { DashboardShowcase } from "@/components/landing/DashboardShowcase";
import { FragmentedMarketing } from "@/components/landing/sections/FragmentedMarketing";
import { OutcomesSection } from "@/components/landing/sections/OutcomesSection";
import { UnderstandBrand } from "@/components/landing/sections/UnderstandBrand";
import { CreateWithContext } from "@/components/landing/sections/CreateWithContext";
import { LearnFromResults } from "@/components/landing/sections/LearnFromResults";
import { SystemThatLearns } from "@/components/landing/sections/SystemThatLearns";
import { FinalCTA } from "@/components/landing/sections/FinalCTA";

/**
 * The homepage sells the outcome; the product pages carry the detail.
 *
 * It used to render twenty sections — the whole feature catalogue — which
 * asked a first-time visitor to evaluate KoraSpace before understanding what
 * it changes about their day. The six narrative sections that replace them
 * land one at a time; this is the lean frame they slot into.
 *
 * Target order:
 *   1 Hero                — the promise                        [here]
 *   2 Old way vs KoraSpace— name the pain
 *   3 What you get back   — sell the outcome
 *   4 The difference      — data becomes a decision
 *   5 Marketing that learns — the loop, and the curiosity
 *   6 Product preview     — proof, then handoff                [DashboardShowcase]
 */
export default function LandingPage() {
  return (
    <>
      <Preloader />

      <Hero />

      {/* SOCIAL PROOF STRIP — intentionally empty. Goes in when there are real
          customers to name. Nothing invented sits on this page. */}

      {/* 2 — The problem: fragmented marketing */}
      <FragmentedMarketing />

      {/* 3 — What KoraSpace gives back */}
      <OutcomesSection />

      {/* 4 — Understand your brand (alternating run begins) */}
      <UnderstandBrand />

      {/* 5 — Create with context (reversed) */}
      <CreateWithContext />

      {/* 6 — Learn from results (alternating run ends) */}
      <LearnFromResults />

      {/* 7 — Data → intelligence → next move, and the loop that repeats it */}
      <SystemThatLearns />



      {/* 6 — Product preview: one real environment, then the handoff into
          /product/create, /product/understand and /product/grow. */}
      <DashboardShowcase />

      {/* RESULTS / CASE STUDIES — insertion point, same rule as above. */}
      {/* TESTIMONIAL WALL — insertion point, same rule as above. */}

      <FinalCTA />
    </>
  );
}
