export type SupportedLocale =
  | "en-NG"
  | "en-US"
  | "es"
  | "zh"
  | "ar"
  | "fr"
  | "nl";

export type SupportedCurrency = "NGN" | "USD" | "EUR" | "CNY" | "AED";

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  defaultCurrency: SupportedCurrency;
  isRTL?: boolean;
  defaultIsAfrican?: boolean;
}

export const SUPPORTED_LOCALES: Record<SupportedLocale, LocaleInfo> = {
  "en-NG": {
    code: "en-NG",
    name: "English (Nigeria)",
    nativeName: "English (Nigeria)",
    flag: "🇳🇬",
    defaultCurrency: "NGN",
    defaultIsAfrican: true,
  },
  "en-US": {
    code: "en-US",
    name: "English (US)",
    nativeName: "English (US)",
    flag: "🇺🇸",
    defaultCurrency: "USD",
    defaultIsAfrican: false,
  },
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    defaultCurrency: "EUR",
    defaultIsAfrican: false,
  },
  zh: {
    code: "zh",
    name: "Chinese",
    nativeName: "中文 (简体)",
    flag: "🇨🇳",
    defaultCurrency: "CNY",
    defaultIsAfrican: false,
  },
  ar: {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    defaultCurrency: "AED",
    isRTL: true,
    defaultIsAfrican: false,
  },
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    defaultCurrency: "EUR",
    defaultIsAfrican: false,
  },
  nl: {
    code: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    flag: "🇳🇱",
    defaultCurrency: "EUR",
    defaultIsAfrican: false,
  },
};

export interface PlanPricingItem {
  name: string;
  desc: string;
  posts: string;
  features: string[];
  cta: string;
  badge?: string;
  highlight?: boolean;
}

export interface TranslationDictionary {
  nav: {
    product: string;
    audience: string;
    integrations: string;
    resources: string;
    pricing: string;
    signIn: string;
    getStarted: string;
    platform: string;
    company: string;
  };
  hero: {
    badge: string;
    title1: string;
    titleHighlight: string;
    title2: string;
    subtitle: string;
    startTrial: string;
    compareModes: string;
    noCardRequired: string;
    instantSetup: string;
    statCreators: string;
    statPosts: string;
    statRoas: string;
  };
  dashboardShowcase: {
    eyebrow: string;
    title: string;
    subtitle: string;
    creatorMode: string;
    marketerMode: string;
    composerTitle: string;
    composerDesc: string;
    calendarTitle: string;
    calendarDesc: string;
    crmTitle: string;
    crmDesc: string;
    pipelineScore: string;
    engagementRate: string;
    revenueAttributed: string;
  };
  problemSolver: {
    eyebrow: string;
    heading: string;
    paragraph: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    ctaButton: string;
    secondaryButton: string;
  };
  dualModes: {
    eyebrow: string;
    titleLead: string;
    titleCreators: string;
    titleAnd: string;
    titleMarketers: string;
    subtitle: string;
    creatorStudioTitle: string;
    creatorStudioDesc: string;
    marketerStudioTitle: string;
    marketerStudioDesc: string;
    launchCreator: string;
    launchMarketer: string;
  };
  growthLoop: {
    eyebrow: string;
    title: string;
    subtitle: string;
    stage1Title: string;
    stage1Desc: string;
    stage2Title: string;
    stage2Desc: string;
    stage3Title: string;
    stage3Desc: string;
    stage4Title: string;
    stage4Desc: string;
    feedsNext: string;
  };
  features: {
    composerTitle: string;
    composerTagline: string;
    composerDesc: string;
    calendarTitle: string;
    calendarTagline: string;
    calendarDesc: string;
    repurposerTitle: string;
    repurposerTagline: string;
    repurposerDesc: string;
    inboxTitle: string;
    inboxTagline: string;
    inboxDesc: string;
    agencyTitle: string;
    agencyTagline: string;
    agencyDesc: string;
    attributionTitle: string;
    attributionTagline: string;
    attributionDesc: string;
  };
  brandBrain: {
    eyebrow: string;
    title: string;
    subtitle: string;
    brainTitle: string;
    brainDesc: string;
    brainCheck1: string;
    brainCheck2: string;
    brainCheck3: string;
    swarmTitle: string;
  };
  pricing: {
    eyebrow: string;
    titleLead: string;
    titleHighlight: string;
    subtitle: string;
    monthlyBilling: string;
    annualBilling: string;
    discountBadge: string;
    perMonth: string;
    billedAnnually: string;
    starterName: string;
    starterDesc: string;
    creatorProName: string;
    creatorProDesc: string;
    marketerProName: string;
    marketerProDesc: string;
    agencyName: string;
    agencyDesc: string;
    enterpriseTitle: string;
    enterpriseDesc: string;
    enterpriseButton: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    subtitle: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
    q5: string;
    a5: string;
    q6: string;
    a6: string;
  };
  cta: {
    eyebrow: string;
    titleLead: string;
    titleHighlight: string;
    subtitle: string;
    startTrial: string;
    signIn: string;
    feature1: string;
    feature2: string;
  };
  footer: {
    brandDesc: string;
    productHeading: string;
    platformHeading: string;
    legalHeading: string;
    supportHeading: string;
    directContact: string;
    rightsReserved: string;
    builtLocation: string;
  };
  common: {
    exploreFeature: string;
    launchStudio: string;
    viewPricing: string;
    loading: string;
    secureBadge: string;
  };
}
