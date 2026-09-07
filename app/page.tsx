import { Preloader } from "@/components/landing/Preloader";
import { FloatingNav } from "@/components/landing/FloatingNav";
import { Hero } from "@/components/landing/Hero";
import {
  GrowthLoopSection,
  Features,
  BrainAndAgentsSection,
  AgentTools,
  Integrations,
  RevenueAttributionSection,
  Collaboration,
  HowItWorks,
  Stories,
  Pricing,
  FinalCTA,
  SiteFooter,
} from "@/components/landing/LowerSections";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#07050d]">
      <Preloader />
      <FloatingNav />
      <main>
        <Hero />
        <GrowthLoopSection />
        <Features />
        <BrainAndAgentsSection />
        <AgentTools />
        <Integrations />
        <RevenueAttributionSection />
        <Collaboration />
        <HowItWorks />
        <Stories />
        <Pricing />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

