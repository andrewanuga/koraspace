"use client";

import { Preloader } from "@/components/landing/Preloader";
import { FloatingNav } from "@/components/landing/FloatingNav";
import { Hero } from "@/components/landing/Hero";
import { DashboardShowcase } from "@/components/landing/DashboardShowcase";
import {
  ProblemSolverSection,
  DualModeShowcaseSection,
  GrowthLoopSection,
  FeatureSection,
  FeatureShowcase,
  BrainAndAgentsSection,
  AgentTools,
  Integrations,
  RevenueAttributionSection,
  Collaboration,
  FAQ,
  Stories,
  Pricing,
  FinalCTA,
  SiteFooter,
} from "@/components/landing/LowerSections";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen transition-colors duration-200 bg-slate-50 text-slate-900 dark:bg-[#121212] dark:text-white selection:bg-[#ff0a8a]/20 selection:text-[#ff0a8a]">
      <Preloader />
      <FloatingNav />
      <main>
        <Hero />
        <DashboardShowcase />
        <ProblemSolverSection />
        <DualModeShowcaseSection />
        <GrowthLoopSection />

        {/* Alternating FeatureSection Showcase Rows */}
        <FeatureSection
          badge={t.featureRows.composer.badge}
          tone="pink"
          title={t.featureRows.composer.title}
          description={t.featureRows.composer.description}
          imageUrl="/features/Kora-AI-Composer.jpg"
          imageAlt="AI Composing Pipeline Showcase"
          imageLeft={true}
        />

        <FeatureSection
          badge={t.featureRows.calendar.badge}
          tone="pink"
          title={t.featureRows.calendar.title}
          description={t.featureRows.calendar.description}
          imageUrl="/features/Visual-Drag-and-Drop Calendar.jpg"
          imageAlt="Visual Content Calendar Showcase"
          imageLeft={false}
        />

        {/* Interactive Showcase Matrix Engine */}
        <FeatureShowcase />

        <BrainAndAgentsSection />

        <FeatureSection
          badge={t.featureRows.crm.badge}
          tone="blue"
          title={t.featureRows.crm.title}
          description={t.featureRows.crm.description}
          imageUrl="/features/social-ecommerce.jpg"
          imageAlt="Social Inbox & CRM Showcase"
          imageLeft={true}
        />

        <FeatureSection
          id="agency-workspaces"
          badge={t.featureRows.agency.badge}
          tone="blue"
          title={t.featureRows.agency.title}
          description={t.featureRows.agency.description}
          imageUrl="/features/manage-multiple-brands.jpg"
          imageAlt="Agency Workspaces Showcase"
          imageLeft={false}
        />

        <AgentTools />
        <Integrations />
        <RevenueAttributionSection />
        <Collaboration />
        <FAQ />
        <Stories />
        <Pricing />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
