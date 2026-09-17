import {
  Briefcase,
  Building2,
  Palette,
  Rocket,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  siFacebook,
  siGoogleanalytics,
  siInstagram,
  siShopify,
  siTiktok,
  siX,
  siYoutube,
  type BrandMark,
} from "@/components/landing/brand-icons";
import type { TranslationDictionary } from "@/lib/i18n/types";

export const ctaTargets = {
  product: "#features",
  audience: "#dual-modes",
  integrations: "#integrations",
} as const;

export type MenuLeaf = { label: string; href?: string };

export type ProductCategory = {
  key: string;
  title: string;
  items: MenuLeaf[];
  preview: { status: string; finding: string; action: string };
};

export type Audience = MenuLeaf & {
  Icon: LucideIcon;
  description: string;
};

export type NavItem =
  | { label: string; kind: "link"; href?: string }
  | { label: string; kind: "product"; align?: "right" }
  | { label: string; kind: "audience"; align?: "right" }
  | { label: string; kind: "integrations"; href?: string; align?: "right" }
  | { label: string; kind: "resources"; align?: "right" };

export function getNavItems(t: TranslationDictionary): NavItem[] {
  return [
    { label: t.nav.product, kind: "product" },
    { label: t.nav.audience, kind: "audience" },
    { label: t.nav.integrations, kind: "integrations", href: "#integrations" },
    { label: t.nav.resources, kind: "resources", align: "right" },
    { label: t.nav.pricing, kind: "link", href: "#pricing" },
  ];
}

export function getProductCategories(t: TranslationDictionary): ProductCategory[] {
  const cats = t.megaMenus.categories;
  return [
    {
      key: "create",
      title: cats.createTitle,
      items: cats.createItems.map((label) => ({ label })),
      preview: {
        status: t.heroLoop.canvas.createKicker,
        finding: t.heroLoop.canvas.createPrompt,
        action: t.heroLoop.canvas.createAction,
      },
    },
    {
      key: "manage",
      title: cats.manageTitle,
      items: cats.manageItems.map((label) => ({ label })),
      preview: {
        status: t.heroLoop.canvas.publishKicker,
        finding: t.heroLoop.canvas.publishBody,
        action: t.heroLoop.stages[3]?.action || "View schedule",
      },
    },
    {
      key: "understand",
      title: cats.understandTitle,
      items: cats.understandItems.map((label) => ({ label })),
      preview: {
        status: t.heroLoop.canvas.understandKicker,
        finding: t.heroLoop.canvas.understandBody,
        action: t.heroLoop.stages[0]?.action || "View brand profile",
      },
    },
    {
      key: "grow",
      title: cats.growTitle,
      items: cats.growItems.map((label) => ({ label })),
      preview: {
        status: t.heroLoop.stages[5]?.kicker || "Kora Intelligence",
        finding: t.heroLoop.stages[5]?.body || "",
        action: t.heroLoop.stages[5]?.action || "Generate campaign",
      },
    },
    {
      key: "convert",
      title: cats.convertTitle,
      items: cats.convertItems.map((label) => ({ label })),
      preview: {
        status: t.revenueAttribution.radarHeading,
        finding: t.revenueAttribution.radarDesc,
        action: t.common.exploreFeature,
      },
    },
    {
      key: "automate",
      title: cats.automateTitle,
      items: cats.automateItems.map((label) => ({ label })),
      preview: {
        status: t.agentTools.list[2]?.title || "Social CRM",
        finding: t.agentTools.list[2]?.desc || "",
        action: t.common.exploreFeature,
      },
    },
  ];
}

const AUDIENCE_ICONS: LucideIcon[] = [
  Rocket,
  Palette,
  Building2,
  Briefcase,
  Users,
  ShoppingBag,
];

export function getAudiences(t: TranslationDictionary): Audience[] {
  return t.megaMenus.audiences.map((aud, i) => ({
    label: aud.label,
    Icon: AUDIENCE_ICONS[i] || Users,
    description: aud.desc,
  }));
}

export type IntegrationEntry =
  | { label: string; icon: BrandMark }
  | { label: string; custom: "linkedin" };

export const integrationPreview: IntegrationEntry[] = [
  { label: "Instagram", icon: siInstagram },
  { label: "Facebook", icon: siFacebook },
  { label: "TikTok", icon: siTiktok },
  { label: "YouTube", icon: siYoutube },
  { label: "LinkedIn", custom: "linkedin" },
  { label: "X", icon: siX },
  { label: "Shopify", icon: siShopify },
  { label: "Google Analytics", icon: siGoogleanalytics },
];

export function getResourceGroups(t: TranslationDictionary): { title: string; items: MenuLeaf[] }[] {
  return t.megaMenus.resourceGroups;
}

export function getMobileSections(t: TranslationDictionary): { label: string; groups: { title?: string; items: MenuLeaf[] }[] }[] {
  const cats = getProductCategories(t);
  const auds = getAudiences(t);
  const res = getResourceGroups(t);

  return [
    {
      label: t.nav.product,
      groups: cats.map((c) => ({ title: c.title, items: c.items })),
    },
    {
      label: t.nav.audience,
      groups: [{ items: auds.map(({ label, href }) => ({ label, href })) }],
    },
    {
      label: t.nav.resources,
      groups: res,
    },
  ];
}

// Default fallback exports for backwards compatibility
export const navItems: NavItem[] = [
  { label: "Product", kind: "product" },
  { label: "Made for", kind: "audience" },
  { label: "Integrations", kind: "integrations", href: "#integrations" },
  { label: "Resources", kind: "resources", align: "right" },
  { label: "Pricing", kind: "link", href: "#pricing" },
];

export const productCategories: ProductCategory[] = [
  {
    key: "create",
    title: "Create",
    items: [{ label: "AI Content" }, { label: "Brand Voice" }, { label: "Repurposing" }],
    preview: {
      status: "Drafts ready for review",
      finding: "3 posts written in your brand voice from this week's top thread.",
      action: "Review drafts",
    },
  },
  {
    key: "manage",
    title: "Manage",
    items: [{ label: "Publishing" }, { label: "Calendar" }, { label: "Social Accounts" }],
    preview: {
      status: "Your week is scheduled",
      finding: "18 posts queued across 5 platforms, timed to when your audience is active.",
      action: "Open calendar",
    },
  },
  {
    key: "understand",
    title: "Understand",
    items: [{ label: "Analytics" }, { label: "Trends" }, { label: "Competitors" }],
    preview: {
      status: "KoraSpace found an opportunity",
      finding: "Your audience engages 42% more with short-form educational content.",
      action: "Create content",
    },
  },
  {
    key: "grow",
    title: "Grow",
    items: [{ label: "Strategy" }, { label: "Campaigns" }, { label: "Experiments" }],
    preview: {
      status: "Strategy updated",
      finding: "Founder-led video is projected to lift reach 28% this month.",
      action: "View strategy",
    },
  },
  {
    key: "convert",
    title: "Convert",
    items: [{ label: "Lead Intelligence" }, { label: "CRM" }, { label: "Revenue" }],
    preview: {
      status: "3 high-intent conversations detected",
      finding: "Potential leads identified from this week's social activity.",
      action: "View leads",
    },
  },
  {
    key: "automate",
    title: "Automate",
    items: [{ label: "AI Bots" }, { label: "Smart Inbox" }, { label: "Workflows" }],
    preview: {
      status: "Your bots handled 47 replies",
      finding: "Common questions answered automatically while you were offline.",
      action: "Review activity",
    },
  },
];

export const audiences: Audience[] = [
  {
    label: "Startups & founders",
    Icon: Rocket,
    description: "Build your audience without building a marketing team.",
  },
  {
    label: "Creators",
    Icon: Palette,
    description: "Create, publish and grow your personal brand.",
  },
  {
    label: "Businesses",
    Icon: Building2,
    description: "Turn marketing into a growth engine.",
  },
  {
    label: "Agencies",
    Icon: Briefcase,
    description: "Manage multiple brands and clients in one place.",
  },
  {
    label: "Marketing teams",
    Icon: Users,
    description: "Plan, collaborate and execute together.",
  },
  {
    label: "Online businesses",
    Icon: ShoppingBag,
    description: "Turn social attention into customers.",
  },
];

export const resourceGroups: { title: string; items: MenuLeaf[] }[] = [
  {
    title: "Learn",
    items: [{ label: "Blog" }, { label: "Marketing Guides" }, { label: "KoraSpace Academy" }],
  },
  {
    title: "Get Help",
    items: [
      { label: "Help Center" },
      { label: "Documentation" },
      { label: "FAQs", href: "#faq" },
    ],
  },
  {
    title: "Developers",
    items: [{ label: "Developer Portal" }, { label: "API" }, { label: "Integrations" }],
  },
];

export function mobileSections(): { label: string; groups: { title?: string; items: MenuLeaf[] }[] }[] {
  return [
    {
      label: "Product",
      groups: productCategories.map((c) => ({ title: c.title, items: c.items })),
    },
    {
      label: "Made for",
      groups: [{ items: audiences.map(({ label, href }) => ({ label, href })) }],
    },
    {
      label: "Resources",
      groups: resourceGroups,
    },
  ];
}
