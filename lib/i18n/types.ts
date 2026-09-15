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
    languageAndCurrency: string;
  };
  megaMenus: {
    productEyebrow: string;
    productLede: string;
    productCta: string;
    audienceEyebrow: string;
    audienceLede: string;
    audienceCta: string;
    integrationsEyebrow: string;
    integrationsLede: string;
    integrationsMore: string;
    integrationsCta: string;
    categories: {
      createTitle: string;
      createItems: [string, string, string];
      manageTitle: string;
      manageItems: [string, string, string];
      understandTitle: string;
      understandItems: [string, string, string];
      growTitle: string;
      growItems: [string, string, string];
      convertTitle: string;
      convertItems: [string, string, string];
      automateTitle: string;
      automateItems: [string, string, string];
    };
    audiences: Array<{ label: string; desc: string }>;
    resourceGroups: Array<{ title: string; items: Array<{ label: string; href?: string }> }>;
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
    supportedPlatforms: string;
  };
  heroLoop: {
    badge: string;
    stages: Array<{
      label: string;
      kicker: string;
      body: string;
      action: string;
    }>;
    canvas: {
      understandKicker: string;
      understandBody: string;
      createKicker: string;
      createPrompt: string;
      createItems: [string, string, string];
      createAction: string;
      createPerformance: string;
      publishKicker: string;
      publishBody: string;
      learnKicker: string;
      learnBody: string;
      learnSignalKicker: string;
      learnSignalBody: string;
      nextMoveKicker: string;
      nextMoveBody: string;
      nextMoveAction: string;
      stageLabels: [string, string, string, string, string];
    };
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
  featureRows: {
    composer: {
      badge: string;
      title: string;
      description: string;
    };
    calendar: {
      badge: string;
      title: string;
      description: string;
    };
    crm: {
      badge: string;
      title: string;
      description: string;
    };
    agency: {
      badge: string;
      title: string;
      description: string;
    };
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
  featureShowcase: Array<{
    id: string;
    title: string;
    tagline: string;
    description: string;
    tone: "pink" | "blue";
  }>;
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
    swarmAgents: Array<{ name: string; role: string }>;
  };
  agentTools: {
    eyebrow: string;
    title: string;
    subtitle: string;
    list: Array<{
      title: string;
      desc: string;
      badge: string;
      tone: "pink" | "blue";
    }>;
  };
  integrationsSection: {
    eyebrow: string;
    titleLead: string;
    titleHighlight: string;
    subtitle: string;
  };
  revenueAttribution: {
    eyebrow: string;
    titleLead: string;
    titleHighlight: string;
    subtitle: string;
    funnelTitle: string;
    funnelSubtitle: string;
    liveSync: string;
    impressionsLabel: string;
    impressionsVal: string;
    visitsLabel: string;
    visitsVal: string;
    clicksLabel: string;
    clicksVal: string;
    leadsLabel: string;
    leadsVal: string;
    closedCustomers: string;
    revenueVal: string;
    attributionModel: string;
    roas: string;
    koraScoreLabel: string;
    koraScoreTip: string;
    radarTitle: string;
    radarHeading: string;
    radarDesc: string;
  };
  collaboration: {
    eyebrow: string;
    title: string;
    subtitle: string;
    list: Array<{ title: string; desc: string }>;
  };
  stories: {
    eyebrow: string;
    title: string;
    subtitle: string;
    list: Array<{
      name: string;
      role: string;
      avatar: string;
      text: string;
      highlight: string;
      tone: "pink" | "blue";
    }>;
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
    plans: Array<{
      planKey: string;
      name: string;
      desc: string;
      posts: string;
      features: string[];
      cta: string;
      badge?: string;
      highlight?: boolean;
    }>;
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
    links: {
      product: Array<{ label: string; href: string }>;
      platform: Array<{ label: string; href: string }>;
      legal: Array<{ label: string; href: string }>;
      support: Array<{ label: string; href: string }>;
    };
  };
  common: {
    exploreFeature: string;
    launchStudio: string;
    viewPricing: string;
    loading: string;
    secureBadge: string;
  };
}
