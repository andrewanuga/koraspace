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

/**
 * Interim CTA targets: /product, /for/* and /integrations don't exist yet, so
 * each panel's call-to-action points at the closest live homepage section.
 * Swap these for the real routes as those pages land.
 */
export const ctaTargets = {
  product: "#features",
  audience: "#dual-modes",
  integrations: "#integrations",
} as const;

/**
 * Most menu destinations (/product, /for/*, blog, docs, API…) don't exist yet —
 * the only public marketing route is "/". Items without an `href` render
 * complete but inert, and get a real href as each page lands.
 */
export type MenuLeaf = { label: string; href?: string };

export type ProductCategory = {
  key: string;
  title: string;
  items: MenuLeaf[];
  /** Shown in the mega-menu's preview panel while this category is hovered. */
  preview: { status: string; finding: string; action: string };
};

export type Audience = MenuLeaf & {
  Icon: LucideIcon;
  description: string;
};

/**
 * `align: "right"` anchors the panel to the trigger's right edge instead of its
 * left. Needed for triggers far enough along the bar that a wide left-aligned
 * panel would run off-screen (Resources overflowed by ~74px at 1024px).
 */
export type NavItem =
  | { label: string; kind: "link"; href?: string }
  | { label: string; kind: "product"; align?: "right" }
  | { label: string; kind: "audience"; align?: "right" }
  | { label: string; kind: "integrations"; href?: string; align?: "right" }
  | { label: string; kind: "resources"; align?: "right" };

export const navItems: NavItem[] = [
  { label: "Product", kind: "product" },
  { label: "Made for", kind: "audience" },
  // Keeps the live homepage section until /integrations exists — making this
  // inert would regress a link that works today.
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

/**
 * The eight platforms originally specced. Seven come from simple-icons as
 * crisp SVG; LinkedIn was removed from simple-icons following a legal request,
 * so it keeps the existing raster (whitened to match — see brand-icons.tsx).
 */
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
      // Live section on the homepage today.
      { label: "FAQs", href: "#faq" },
    ],
  },
  {
    title: "Developers",
    items: [{ label: "Developer Portal" }, { label: "API" }, { label: "Integrations" }],
  },
];

/** Flattened for the mobile accordion. */
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
