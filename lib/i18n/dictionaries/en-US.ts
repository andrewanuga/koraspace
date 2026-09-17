import { TranslationDictionary } from "../types";

export const enUS: TranslationDictionary = {
  onboarding: {
  "topBarTitle": "Workspace Setup",
  "secureBadge": "Secure Onboarding",
  "exit": "Exit",
  "stepIndicator": "Step",
  "personalizingBadge": "Personalizing Koraspace",
  "stepTitles": [
    "Your role",
    "Your goals",
    "Your channels",
    "Your content",
    "Your audience",
    "Your workflow",
    "Analytics style",
    "Typography",
    "Appearance"
  ],
  "step1": {
    "eyebrow": "01",
    "titleStart": "Let's build your",
    "titleHighlight": "Koraspace around you.",
    "description": "Tell us how you work with social media so we can configure your workspace properly.",
    "roles": {
      "businessTitle": "Business / Brand",
      "businessBlurb": "I run a business and want social media to drive qualified leads.",
      "businessDetail": "Business growth, leads, sales, and brand presence.",
      "creatorTitle": "Creator Studio",
      "creatorBlurb": "I build an audience, publish content, and grow my influence.",
      "creatorDetail": "Audience growth, signature content, engagement, and repurposing.",
      "marketerTitle": "Marketing Operator",
      "marketerBlurb": "I manage marketing, lead pipelines, and multi-channel campaigns.",
      "marketerDetail": "Campaigns, CRM lead triage, analytics, and autonomous automation."
    }
  },
  "step2": {
    "eyebrow": "02",
    "titleStart": "What should",
    "titleHighlight": "Koraspace help you achieve?",
    "description": "Pick everything that matters. We'll use these goals to prioritize your dashboard, recommendations and agent.",
    "goals": {
      "growth": {
        "title": "Grow my audience",
        "description": "Reach more people and increase visibility."
      },
      "leads": {
        "title": "Generate leads",
        "description": "Turn social attention into qualified prospects."
      },
      "sales": {
        "title": "Increase sales",
        "description": "Connect content and campaigns to revenue."
      },
      "content": {
        "title": "Create better content",
        "description": "Produce higher quality, voice-matched posts."
      },
      "brand": {
        "title": "Build brand authority",
        "description": "Establish a clear, consistent presence."
      },
      "management": {
        "title": "Save time on planning",
        "description": "Streamline scheduling and asset management."
      },
      "repurpose": {
        "title": "Repurpose across platforms",
        "description": "Turn one piece of content into multiple formats."
      },
      "analytics": {
        "title": "Track full-funnel metrics",
        "description": "Understand engagement, ROAS, and conversion."
      }
    },
    "selectedCount": "goals selected",
    "selectAtLeastOne": "Select at least one goal"
  },
  "step3": {
    "eyebrow": "03",
    "titleStart": "Where does your",
    "titleHighlight": "audience find you?",
    "description": "Select the channels you actively use or plan to grow. You can connect accounts later.",
    "platformsLabel": "Your platforms & connected networks",
    "usernameLabel": "Your workspace username",
    "usernameHint": "This is your unique Koraspace username. Alphanumeric characters and underscores only.",
    "usernamePlaceholder": "yourhandle",
    "selectedCount": "platforms selected"
  },
  "step4": {
    "eyebrow": "04",
    "titleStart": "Tell us what",
    "titleHighlight": "you create.",
    "description": "This gives the content engine context before it starts making recommendations.",
    "nicheLabel": "Your niche or industry topic",
    "nichePlaceholder": "e.g. AI, SaaS, fashion, fitness, real estate, fintech...",
    "formatsLabel": "What formats do you use?",
    "formats": {
      "short_video": {
        "title": "Short-form video",
        "description": "Reels, TikToks, Shorts"
      },
      "text": {
        "title": "Text & threads",
        "description": "X posts, LinkedIn insights"
      },
      "carousel": {
        "title": "Carousels & slides",
        "description": "Multi-slide visual breakdowns"
      },
      "image": {
        "title": "Single images & graphics",
        "description": "Product shots, quotes, flyers"
      },
      "long_form": {
        "title": "Long-form content",
        "description": "Articles, newsletters, YouTube"
      },
      "mixed": {
        "title": "A mix of everything",
        "description": "Diverse cross-platform format"
      }
    },
    "cadenceLabel": "How often do you want to publish?",
    "cadences": {
      "1": {
        "title": "1-2 posts / week",
        "description": "Low-frequency, high-focus consistency"
      },
      "3": {
        "title": "3-5 posts / week",
        "description": "Active growth and audience momentum"
      },
      "7": {
        "title": "Daily (7 posts / week)",
        "description": "Aggressive multi-channel presence"
      },
      "14": {
        "title": "Multiple times / day",
        "description": "Heavy publishing volume across channels"
      }
    }
  },
  "step5": {
    "eyebrow": "05",
    "titleStart": "A little more",
    "titleHighlight": "context.",
    "creatorDesc": "Help us understand your audience so recommendations aren't generic.",
    "clientDesc": "Tell us about the business you're trying to grow.",
    "marketerDesc": "Give us the context you need for better marketing intelligence.",
    "audienceSizeLabel": "Current audience size",
    "targetAudienceLabel": "Who are you trying to reach?",
    "targetAudiencePlaceholderCreator": "e.g. founders building AI startups",
    "businessTypeLabel": "What type of business?",
    "targetAudiencePlaceholderClient": "e.g. small business owners in Lagos",
    "industryLabel": "What industry do you work in?",
    "industryPlaceholder": "e.g. SaaS, fintech, e-commerce...",
    "primarilyMarketLabel": "What do you primarily market?"
  },
  "step6": {
    "eyebrow": "06",
    "titleStart": "How much should",
    "titleHighlight": "Koraspace do for you?",
    "description": "You stay in control. This simply tells Koraspace how proactive your workspace should be.",
    "levels": {
      "suggestions": {
        "title": "Suggestions & Ideas",
        "description": "Give me ideas and recommendations. I'll craft the rest."
      },
      "drafts": {
        "title": "AI Pipeline Drafts",
        "description": "Turn recommendations into ready-to-edit 8-step drafts."
      },
      "create_schedule": {
        "title": "Create & Auto-Schedule",
        "description": "Generate drafts and place them onto the visual calendar."
      },
      "automate": {
        "title": "Autonomous Operator",
        "description": "Let Koraspace triage leads and optimize campaigns continuously."
      }
    },
    "summaryConfigured": "Your workspace will be configured around your answers."
  },
  "step7": {
    "eyebrow": "07",
    "titleStart": "Choose your",
    "titleHighlight": "analytics style.",
    "description": "Select your default chart visualization. This shapes how performance, growth, and conversion data are plotted across your dashboard.",
    "bestForPrefix": "Best for:",
    "styles": {
      "auto": {
        "title": "Smart / Auto",
        "subtitle": "Context-aware adaptive",
        "bestFor": "Automated best fit for metric type"
      },
      "area": {
        "title": "Area Chart",
        "subtitle": "Volume & engagement",
        "bestFor": "Traffic, reach, engagement volume over time"
      },
      "bar": {
        "title": "Bar Chart",
        "subtitle": "Comparative breakdown",
        "bestFor": "Comparing campaigns & platform splits"
      },
      "line": {
        "title": "Line Chart",
        "subtitle": "Growth & trajectories",
        "bestFor": "Growth, velocity, and multi-trend progress"
      },
      "donut": {
        "title": "Donut Chart",
        "subtitle": "Channel distribution",
        "bestFor": "Platform audience and lead share breakdown"
      },
      "funnel": {
        "title": "Funnel Chart",
        "subtitle": "Conversion pipeline",
        "bestFor": "Lead → qualified → revenue pipeline dropoffs"
      },
      "radar": {
        "title": "Radar Chart",
        "subtitle": "Multi-axis health",
        "bestFor": "Multi-dimensional performance overview"
      }
    }
  },
  "step8": {
    "eyebrow": "08",
    "titleStart": "Choose your",
    "titleHighlight": "typography & font.",
    "description": "Select the primary typeface that sets the tone for your interface, metrics telemetry, and post drafts.",
    "fonts": {
      "inter": {
        "label": "Inter",
        "category": "Modern Neutral",
        "preview": "The quick brown fox jumps over the lazy dog · 1,234,567"
      },
      "geist": {
        "label": "Geist",
        "category": "Technical Precision",
        "preview": "Autonomous agents analyzing conversion telemetry · 98.4%"
      },
      "dm-sans": {
        "label": "DM Sans",
        "category": "Contemporary Geometric",
        "preview": "Audience growth velocity across verified accounts · +24.8%"
      },
      "manrope": {
        "label": "Manrope",
        "category": "Refined Geometric",
        "preview": "High-performance marketing operations & autonomous scheduling"
      },
      "plus-jakarta": {
        "label": "Plus Jakarta Sans",
        "category": "Premium Executive",
        "preview": "Executive revenue signals and predictive intelligence · $45,280"
      },
      "space-grotesk": {
        "label": "Space Grotesk",
        "category": "Tech-Forward",
        "preview": "Real-time AI pipeline execution and multi-channel routing"
      },
      "ibm-plex": {
        "label": "IBM Plex Sans",
        "category": "Structured Editorial",
        "preview": "Global distribution network with zero-trust credentials"
      }
    }
  },
  "step9": {
    "eyebrow": "09",
    "titleStart": "Appearance &",
    "titleHighlight": "dashboard density.",
    "description": "Tune your color scheme and interface density before entering your live workspace.",
    "themeModeLabel": "Theme Mode",
    "themes": {
      "dark": {
        "label": "Dark Mode",
        "description": "Deep obsidian"
      },
      "light": {
        "label": "Light Mode",
        "description": "Crisp daylight"
      },
      "system": {
        "label": "System Sync",
        "description": "Follows OS preference"
      }
    },
    "densityLabel": "Dashboard Density",
    "densities": {
      "minimal": {
        "label": "Minimal",
        "badge": "Clean",
        "description": "Generous whitespace with high-level summaries"
      },
      "balanced": {
        "label": "Balanced",
        "badge": "Default",
        "description": "Optimal equilibrium of cards and rich data"
      },
      "detailed": {
        "label": "Detailed",
        "badge": "Power User",
        "description": "Dense telemetry tables and multi-metric grids"
      }
    },
    "readyTitle": "Your Workspace Is Ready",
    "readyDesc": "Everything will be configured and saved to your Supabase profile."
  },
  "navigation": {
    "back": "Back",
    "continue": "Continue",
    "enterWorkspace": "Enter your workspace",
    "settingUp": "Setting up...",
    "getStartedBadge": "Let's get you set up",
    "changeAnytimeReassurance": "You can change these settings anytime in workspace settings"
  }
},
  nav: {
    product: "Product",
    audience: "Made for",
    integrations: "Integrations",
    resources: "Resources",
    pricing: "Pricing",
    signIn: "Sign in",
    getStarted: "Get started",
    platform: "Platform",
    company: "Company",
    languageAndCurrency: "Language & Currency",
  },
  megaMenus: {
    productEyebrow: "PRODUCT",
    productLede: "Everything working together to grow your business.",
    productCta: "Explore the KoraSpace platform",
    audienceEyebrow: "MADE FOR",
    audienceLede: "Built around the way you actually work.",
    audienceCta: "See how KoraSpace fits your business",
    integrationsEyebrow: "INTEGRATIONS",
    integrationsLede: "Connect the tools your business already uses.",
    integrationsMore: "More integrations",
    integrationsCta: "Explore integrations",
    categories: {
      createTitle: "Create",
      createItems: ["AI Content", "Brand Voice", "Repurposing"],
      manageTitle: "Manage",
      manageItems: ["Publishing", "Calendar", "Social Accounts"],
      understandTitle: "Understand",
      understandItems: ["Analytics", "Trends", "Competitors"],
      growTitle: "Grow",
      growItems: ["Strategy", "Campaigns", "Experiments"],
      convertTitle: "Convert",
      convertItems: ["Lead Intelligence", "CRM", "Revenue"],
      automateTitle: "Automate",
      automateItems: ["AI Bots", "Smart Inbox", "Workflows"],
    },
    audiences: [
      {
        label: "Startups & founders",
        desc: "Build your audience without building a marketing team.",
      },
      {
        label: "Creators",
        desc: "Create, publish and grow your personal brand.",
      },
      {
        label: "Businesses",
        desc: "Turn marketing into a predictable growth engine.",
      },
      {
        label: "Agencies",
        desc: "Manage multiple brands and clients in one place.",
      },
      {
        label: "Marketing teams",
        desc: "Plan, collaborate and execute together seamlessly.",
      },
      {
        label: "Online businesses",
        desc: "Turn social attention into paying customers.",
      },
    ],
    resourceGroups: [
      {
        title: "Learn",
        items: [
          { label: "Blog" },
          { label: "Marketing Guides" },
          { label: "KoraSpace Academy" },
        ],
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
        items: [
          { label: "Developer Portal" },
          { label: "API" },
          { label: "Integrations", href: "#integrations" },
        ],
      },
    ],
  },
  hero: {
    badge: "Autonomous AI Marketing Agent for Modern Brands",
    title1: "Turn your brand voice into",
    titleHighlight: "signature posts & CRM leads",
    title2: "on autopilot.",
    subtitle:
      "Stop wasting 15+ hours weekly struggling with writers' block. KoraSpace deploys dual AI engines: a Creator Studio for signature voice content and a Marketing Operator for automated CRM lead conversion.",
    startTrial: "Start 14-day free trial",
    compareModes: "Compare Dual Modes",
    noCardRequired: "No credit card required",
    instantSetup: "Instant 2-minute setup",
    statCreators: "5,000+ creators & growth marketers",
    statPosts: "1.2M+ posts generated",
    statRoas: "4.2x average lead ROAS",
    supportedPlatforms: "Built to grow across Instagram, TikTok, X, LinkedIn, and Threads.",
  },
  heroLoop: {
    badge: "THE KORASPACE GROWTH LOOP",
    stages: [
      {
        label: "Your Brand",
        kicker: "Brand Brain",
        body: "KoraSpace learns your voice, products, positioning, and brand guidelines.",
        action: "View brand profile",
      },
      {
        label: "AI",
        kicker: "Intelligence",
        body: "Multiple AI engines turn your brand data into high-converting marketing decisions.",
        action: "See the engines",
      },
      {
        label: "Content",
        kicker: "Create",
        body: "Generate content tailored to your brand voice, audience, and social platform.",
        action: "Open composer",
      },
      {
        label: "Audience",
        kicker: "Reach",
        body: "Your content goes out where and when your audience is actively paying attention.",
        action: "View schedule",
      },
      {
        label: "Results",
        kicker: "Learn",
        body: "Your audience engages 34% more with founder-led, actionable educational content.",
        action: "Opportunity detected",
      },
      {
        label: "Next Move",
        kicker: "Kora Intelligence",
        body: "Turn your best-performing founder post into a high-converting 3-part campaign.",
        action: "Generate campaign",
      },
    ],
    canvas: {
      understandKicker: "Brand understood",
      understandBody: "Your audience responds best to practical founder-led content.",
      createKicker: "3 opportunities found",
      createPrompt: "Draft a founder story",
      createItems: ["Founder story", "Product breakdown", "Customer problem"],
      createAction: "Generate content",
      createPerformance: "Based on your recent performance",
      publishKicker: "Campaign ready",
      publishBody: "Scheduled across Instagram, LinkedIn and TikTok for peak audience activity.",
      learnKicker: "Engagement",
      learnBody: "This format is outperforming your channel average.",
      learnSignalKicker: "Audience signal detected",
      learnSignalBody: "Educational posts outperform promotional posts by 42%",
      nextMoveKicker: "Next move",
      nextMoveBody: "Turn your best-performing post into a 3-part campaign.",
      nextMoveAction: "Generate",
      stageLabels: ["Understand", "Create", "Publish", "Learn", "Next Move"],
    },
  },
  dashboardShowcase: {
    eyebrow: "Live Interactive Workspace Preview",
    title: "See KoraSpace in action:",
    subtitle:
      "Switch between Creator Mode and Marketer Mode to preview how KoraSpace adapts to your workflow.",
    creatorMode: "Creator Studio",
    marketerMode: "Marketing Operator",
    composerTitle: "AI Composing Pipeline",
    composerDesc: "8-step voice matching, draft scoring & reflections.",
    calendarTitle: "Visual 6-Platform Calendar",
    calendarDesc: "Drag-and-drop scheduling across Instagram, TikTok, LinkedIn, YouTube, X & Threads.",
    crmTitle: "Social CRM & Lead Triage",
    crmDesc: "Detect high-intent buying signals in DMs & comments.",
    pipelineScore: "KoraScore 88/100",
    engagementRate: "3.8% Engagement Rate",
    revenueAttributed: "$12,450 Pipeline Revenue",
    previewMode: "Mode",
    aiStudio: "AI Studio",
    visualCalendar: "Visual Calendar",
    viralTrends: "Viral Trends",
    repurpose: "Repurpose",
    audience: "Audience",
    brandKit: "Brand Kit",
    realTimeSync: "Real-time Sync",
    totalReach: "Total Reach",
    engagement: "Engagement",
    scheduled: "Scheduled",
    allSynced: "All synced",
    aiContentScore: "AI Content Score",
    optimalVoice: "Optimal voice",
    activeAiGeneration: "Active AI Generation • Signature Brand Voice",
    hookPreview: "Hook: 3 AI strategies modern creators are using to scale audience in 2026. Most creators focus on raw volume. The top 1% build repeatable audience loops. Here is the 4-step framework we used to 10x distribution while cutting editing time in half...",
    eightStepReflection: "8-step brand reflection passed",
    scheduleToPlatforms: "Schedule to 5 Platforms",
    unifiedIntelligenceCloud: "Unified Intelligence Cloud",
    fasterContentSpeed: "10× Faster Content Speed",
    fasterContentDesc: "From idea to 6-platform draft in seconds",
    managedPipelineRevenue: "₦8.4M+ Managed Pipeline Revenue",
    managedPipelineDesc: "Attributed social sales and conversions",
    higherLeadIntent: "4.2× Higher Lead Intent",
    higherLeadDesc: "Automated comment & DM lead classification",
    connectedNetworks: "6+ Connected Networks",
    connectedNetworksDesc: "Instagram, TikTok, LinkedIn, YouTube, X, Threads",
    agentOperator: "Agent Operator",
    campaigns: "Campaigns",
    crmLeads: "CRM & Leads",
    automations: "Automations",
    attribution: "Attribution",
    strategy: "Strategy",
  },
  authLayout: {
    commandCenter: "Your marketing & creator command center",
    titleStart: "Turn your audience",
    titleHighlight: "into momentum.",
    description: "Manage multi-channel campaigns, draft in your signature brand voice, automate CRM workflows, and track real revenue growth across your accounts.",
    feature1: "Multi-channel workflows",
    feature2: "AI-powered intelligence",
    feature3: "Real-time attribution",
    secureCloud: "Secure Cloud Workspace",
    workspaceCommand: "Workspace Command Center",
    overview: "Overview",
    create: "Create",
    campaignsNav: "Campaigns",
    analytics: "Analytics",
    crmNav: "CRM & Leads",
    brandKitNav: "Brand Kit",
    settings: "Settings",
    revenue: "Revenue",
    roas: "ROAS",
    leads: "Leads",
    growth: "Growth",
  },
  authPages: {
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to access your KoraSpace workspace and live campaigns.",
    signupTitle: "Create your account",
    signupSubtitle: "Start your autonomous growth journey today.",
    emailLabel: "Email address",
    passwordLabel: "Password",
    nameLabel: "Full name",
    loginButton: "Sign in",
    signupButton: "Create account",
    googleButton: "Continue with Google",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    forgotPassword: "Forgot password?",
    marketingSuite: "Marketing & Creator Suite",
  },
  problemSolver: {
    eyebrow: "The Old Way vs The KoraSpace Way",
    heading:
      "Stop wasting 15+ hours a week fighting writer's block, copying posts between apps, and losing high-intent leads in messy DMs.",
    paragraph:
      "Traditional schedulers only push posts. KoraSpace is an autonomous growth workspace with dual engines: a Creator Studio for signature voice content and a Marketing Operator for CRM lead conversion.",
    pillar1Title: "AI Brand Brain",
    pillar1Desc:
      "Learns your authentic voice, past top-performing hooks, and strict guidelines so posts never sound generic.",
    pillar2Title: "Visual 6-Platform Sync",
    pillar2Desc:
      "Schedule and drag-and-drop across Instagram, TikTok, LinkedIn, YouTube, X, and Threads in one calendar.",
    pillar3Title: "Social CRM & Revenue",
    pillar3Desc:
      "Detects buying signals in comments and DMs ('How much?'), converts leads, and attributes real revenue.",
    ctaButton: "Get Started Free",
    secondaryButton: "Compare Dual Modes",
  },
  dualModes: {
    eyebrow: "Two Distinct Operating Modes",
    titleLead: "Built for",
    titleCreators: "Creators",
    titleAnd: "&",
    titleMarketers: "Marketing Teams",
    subtitle:
      "Switch seamlessly between Creator Mode and Marketer Mode depending on whether you are crafting signature content or running an autonomous revenue campaign.",
    creatorStudioTitle: "Brand Voice & Audience Studio",
    creatorStudioDesc:
      "For solo creators, thought leaders, and influencers who need to publish consistent, high-impact content across 6+ platforms without burning out.",
    marketerStudioTitle: "Marketing Operator & Social CRM",
    marketerStudioDesc:
      "For marketing teams, agencies, and businesses looking to automate lead triage, campaign execution, and full-funnel revenue attribution.",
    launchCreator: "Launch Creator Studio",
    launchMarketer: "Launch Marketer Operator",
  },
  growthLoop: {
    eyebrow: "The Autonomous Growth Loop",
    title: "Social media marketing that continuously optimizes itself.",
    subtitle:
      "Buffer and Hootsuite make you do everything manually. KoraSpace connects understanding, creation, distribution, and revenue attribution in a single automated loop.",
    stage1Title: "Understand & Research",
    stage1Desc:
      "Scans your brand guidelines, past viral winners, and real-time social trends across your niche.",
    stage2Title: "Strategize & Compose",
    stage2Desc:
      "Executes an 8-step AI pipeline with tone-matching, draft scoring, and reflection before final output.",
    stage3Title: "Publish & Triage",
    stage3Desc:
      "Auto-schedules across 6+ networks and triages incoming comments & DMs with high-intent lead detection.",
    stage4Title: "Measure & Optimize",
    stage4Desc:
      "Attributes social clicks to real pipeline revenue and automatically feeds insights into future strategy.",
    feedsNext: "Feeds next stage",
  },
  featureRows: {
    composer: {
      badge: "AI Composing Pipeline",
      title: "Turn your brand voice into ready-to-publish posts",
      description:
        "Executes an 8-step AI pipeline: checks client niche -> reads past posts -> scans active trends -> drafts post & caption -> assigns hashtags -> double web reflection.",
    },
    calendar: {
      badge: "Visual Calendar 2.0",
      title: "Drag-and-drop your social growth strategy",
      description:
        "Visual planning surface to schedule, organize, and drag-and-drop posts across Instagram, TikTok, LinkedIn, YouTube, X, and Threads effortlessly.",
    },
    crm: {
      badge: "Social Inbox & CRM",
      title: "Classify leads & triage messages automatically",
      description:
        "Unified inbox that detects high-intent buying signals ('How much does this cost?'), tags leads, and logs dollar opportunities straight to CRM.",
    },
    agency: {
      badge: "Agency Workspaces",
      title: "Multi-seat team approval & client portals",
      description:
        "Manage multiple client workspaces with strict row-level security. Teammates manage accounts, review drafts, while you control billing.",
    },
  },
  features: {
    composerTitle: "AI Composing Pipeline",
    composerTagline: "Multi-Step Reflection Engine",
    composerDesc:
      "Executes an 8-step AI workflow: checks brand voice guidelines -> analyzes past viral posts -> scans real-time niche trends -> drafts post & caption -> assigns hashtag clusters -> double web reflections.",
    calendarTitle: "Visual Drag-and-Drop Calendar",
    calendarTagline: "Multi-Platform Scheduling",
    calendarDesc:
      "A fast, unified planning board to schedule, rearrange, and manage scheduled posts across Instagram, TikTok, LinkedIn, YouTube, X, and Threads effortlessly.",
    repurposerTitle: "Content Repurposer",
    repurposerTagline: "1 Asset to 6 Formats",
    repurposerDesc:
      "Transform a single YouTube video, podcast transcript, or article into LinkedIn carousels, X threads, Instagram captions, TikTok scripts, and newsletters with one click.",
    inboxTitle: "Social CRM & Lead Triage",
    inboxTagline: "High-Intent Signal Detection",
    inboxDesc:
      "Unified social inbox that classifies comments and DMs into Leads, Support, or Inquiries. Automatically flags buying questions ('How much is this?') and creates CRM opportunities.",
    agencyTitle: "Agency Workspaces & Client Portals",
    agencyTagline: "Multi-Seat Collaboration",
    agencyDesc:
      "Built for marketing agencies and growth teams. Manage multiple client workspaces with strict RLS permissions, shareable approval links, and white-label reporting.",
    attributionTitle: "Revenue & ROAS Attribution",
    attributionTagline: "Full-Funnel Analytics",
    attributionDesc:
      "Track the journey from social impressions to website visits, qualified CRM leads, and closed revenue. Identify high-ROI campaigns with verifiable conversion data.",
  },
  featureShowcase: [
    {
      id: "ai-composer",
      title: "AI Composing Pipeline",
      tagline: "Multi-Step Reflection Engine",
      description:
        "Executes an 8-step AI workflow: checks brand voice guidelines -> analyzes past viral posts -> scans real-time niche trends -> drafts post & caption -> assigns hashtag clusters -> double web reflections.",
      tone: "pink",
    },
    {
      id: "visual-calendar",
      title: "Visual Drag-and-Drop Calendar",
      tagline: "Multi-Platform Scheduling",
      description:
        "A fast, unified planning board to schedule, rearrange, and manage scheduled posts across Instagram, TikTok, LinkedIn, YouTube, X, and Threads effortlessly.",
      tone: "pink",
    },
    {
      id: "repurposer",
      title: "Content Repurposer",
      tagline: "1 Asset to 6 Formats",
      description:
        "Transform a single YouTube video, podcast transcript, or article into LinkedIn carousels, X threads, Instagram captions, TikTok scripts, and newsletters with one click.",
      tone: "pink",
    },
    {
      id: "inbox-crm",
      title: "Social CRM & Lead Triage",
      tagline: "High-Intent Signal Detection",
      description:
        "Unified social inbox that classifies comments and DMs into Leads, Support, or Inquiries. Automatically flags buying questions ('How much is this?') and creates CRM opportunities.",
      tone: "blue",
    },
    {
      id: "agency-workspaces",
      title: "Agency Workspaces & Client Portals",
      tagline: "Multi-Seat Collaboration",
      description:
        "Built for marketing agencies and growth teams. Manage multiple client workspaces with strict RLS permissions, shareable approval links, and white-label reporting.",
      tone: "blue",
    },
    {
      id: "growth-marketing",
      title: "Revenue & ROAS Attribution",
      tagline: "Full-Funnel Analytics",
      description:
        "Track the journey from social impressions to website visits, qualified CRM leads, and closed revenue. Identify high-ROI campaigns with verifiable conversion data.",
      tone: "blue",
    },
  ],
  brandBrain: {
    eyebrow: "AI Multi-Agent Architecture",
    title: "Powered by the Kora Brand Brain & 8-Agent Swarm",
    subtitle:
      "Instead of generic one-shot prompts, KoraSpace deploys a coordinated swarm of specialized agents connected to your persistent knowledge base.",
    brainTitle: "KoraSpace Brand Brain",
    brainDesc:
      "Upload your website URL, product briefs, brand guidelines, and top-performing past posts. The Brand Brain builds a persistent memory profile so every post sounds authentically like your brand.",
    brainCheck1: "Learns signature tone, vocabulary, and emoji rules",
    brainCheck2: "Enforces custom guardrails ('Never mention competitors')",
    brainCheck3: "Uses winning historical content as benchmark truth",
    swarmTitle: "8-Agent Autonomous Swarm",
    swarmAgents: [
      { name: "Research Agent", role: "Scans viral niche trends & web data" },
      { name: "Brand Voice Guard", role: "Guarantees authentic tone & formatting" },
      { name: "Content Studio Agent", role: "Drafts captions, carousels & scripts" },
      { name: "Strategy Agent", role: "Builds 30/60/90 day growth roadmaps" },
      { name: "Analytics Agent", role: "Tracks funnel metrics & revenue ROAS" },
      { name: "Competitor Spy Agent", role: "Monitors rival formats & engagement hooks" },
      { name: "Engagement Triage Agent", role: "Manages DMs & flags hot CRM leads" },
      { name: "Optimization Agent", role: "Calculates post scores & A/B performance" },
    ],
  },
  agentTools: {
    eyebrow: "Autonomous Toolkit",
    title: "Supercharge your social presence with dedicated AI tools",
    subtitle:
      "Everything you need to automate high-impact marketing workflows from ideation to revenue attribution.",
    list: [
      {
        title: "8-Step AI Composing Pipeline",
        desc: "Checks niche context, past posts, active trends, drafts content, assigns hashtag sets, and reflects before publishing.",
        badge: "Creator Engine",
        tone: "pink",
      },
      {
        title: "Post Score Predictor",
        desc: "AI scores hook strength and estimated engagement probability (1-100) before you hit publish.",
        badge: "Optimization",
        tone: "pink",
      },
      {
        title: "Social CRM & Ghost Mode™",
        desc: "Automated DM & comment monitor with humanized delays that detects buying signals and logs leads to CRM.",
        badge: "Automation",
        tone: "blue",
      },
      {
        title: "Competitor Video Spy",
        desc: "Tracks viral short-form videos in your niche and deconstructs their hooks, audio pacing, and CTAs.",
        badge: "Intelligence",
        tone: "blue",
      },
      {
        title: "Auto-Hashtag & Keyword Cluster",
        desc: "Generates platform-optimized hashtag clusters and keyword tags for maximum algorithmic distribution.",
        badge: "Reach",
        tone: "pink",
      },
      {
        title: "Multi-Platform Repurposer",
        desc: "Converts 1 video, audio file, or article into LinkedIn carousels, X threads, and reels in seconds.",
        badge: "Repurposing",
        tone: "pink",
      },
    ],
  },
  integrationsSection: {
    eyebrow: "Multi-Platform Ecosystem",
    titleLead: "Publish & triage across",
    titleHighlight: "all your channels",
    subtitle: "Official OAuth 2.0 API integrations for instant scheduling and two-way messaging.",
  },
  revenueAttribution: {
    eyebrow: "Revenue & Conversion Tracking",
    titleLead: "From social impressions to",
    titleHighlight: "verifiable pipeline revenue",
    subtitle:
      "Stop guessing the ROI of your social posts. Track the full journey from views to profile visits, CRM leads, and closed revenue.",
    funnelTitle: "Social-to-Revenue Funnel",
    funnelSubtitle: "Real-time attribution powered by UTM tracking",
    liveSync: "Live Sync",
    impressionsLabel: "50,000 Social Impressions",
    impressionsVal: "Top of Funnel",
    visitsLabel: "1,420 Profile Visits",
    visitsVal: "2.84% Conv.",
    clicksLabel: "310 Website Clicks",
    clicksVal: "UTM Verified",
    leadsLabel: "48 Qualified Leads",
    leadsVal: "Social CRM Pipeline",
    closedCustomers: "14 Customers Closed",
    revenueVal: "$12,450 Revenue",
    attributionModel: "Attribution Model: Multi-Touch",
    roas: "ROAS: 4.2x",
    koraScoreLabel: "Account Health Score",
    koraScoreTip: "Top 5% posting consistency this week. Schedule 2 more short videos to hit peak reach.",
    radarTitle: "Lead Opportunity Radar",
    radarHeading: "4 Hot Niche Opportunities Detected",
    radarDesc: "3 high-intent lead questions in Instagram DMs + 1 trending competitor breakout format in your industry.",
  },
  collaboration: {
    eyebrow: "Team & Agency Workspaces",
    title: "Collaborate seamlessly with multi-seat controls",
    subtitle:
      "Built for marketing agencies, brand teams, and growth operators managing multiple client brands under one roof.",
    list: [
      {
        title: "Client Workspace Portals",
        desc: "Isolated brand environments with strict row-level security. Give clients a clean view of their scheduled calendar and reports.",
      },
      {
        title: "1-Click Shareable Draft Approvals",
        desc: "Send review links to clients or stakeholders without forcing them to create an account or login.",
      },
      {
        title: "Role-Based Team Permissions",
        desc: "Assign roles (Admin, Editor, Reviewer, Client) with granular permissions over publishing, billing, and credentials.",
      },
      {
        title: "Audit Trail & Activity Log",
        desc: "Track every edit, approval, prompt update, and published post with complete timestamps and user attribution.",
      },
    ],
  },
  stories: {
    eyebrow: "Success Stories",
    title: "Loved by creators, founders, & growth teams",
    subtitle: "See how businesses scale their social presence and revenue with KoraSpace.",
    list: [
      {
        name: "Sarah Jenkins",
        role: "Tech Founder & Creator, Austin",
        avatar: "SJ",
        text: "I replaced Buffer and a freelance manager with KoraSpace. The AI operator handles our comment triage and schedules weekly content while I close enterprise deals.",
        highlight: "Saved 15 hrs / week",
        tone: "pink",
      },
      {
        name: "David Chen",
        role: "Digital Agency Lead, San Francisco",
        avatar: "DC",
        text: "Managing 8 client accounts used to require three junior managers. Now it is just me and KoraSpace. The client approval links make signoffs effortless.",
        highlight: "Manages 8 brands solo",
        tone: "blue",
      },
      {
        name: "Elena Rostova",
        role: "E-Commerce Founder, New York",
        avatar: "ER",
        text: "The Social CRM detected high-intent buyer questions in our Instagram comments and generated $4,800 in direct sales within 2 weeks of switching.",
        highlight: "$4,800 direct revenue",
        tone: "blue",
      },
      {
        name: "Marcus Vance",
        role: "Executive Brand Coach, Chicago",
        avatar: "MV",
        text: "Trend-to-Draft is like having a ghostwriter that never sleeps. It catches breaking news cycles and prepares three multi-format drafts before I wake up.",
        highlight: "Always on trend",
        tone: "pink",
      },
      {
        name: "Chloe Dupont",
        role: "Fashion Brand Director, London",
        avatar: "CD",
        text: "I was skeptical about AI capturing my brand voice. The Brand Brain learned our tone from past top posts so well that my followers could not tell the difference.",
        highlight: "Authentic voice matching",
        tone: "pink",
      },
      {
        name: "Alex Rivera",
        role: "B2B SaaS Growth Marketer, Miami",
        avatar: "AR",
        text: "Transparent pricing and seamless onboarding made adoption a no-brainer for our team. The multi-channel attribution is top notch.",
        highlight: "Clear ROI attribution",
        tone: "blue",
      },
    ],
  },
  pricing: {
    eyebrow: "Transparent Pricing",
    titleLead: "Simple plans.",
    titleHighlight: "Predictable value.",
    subtitle:
      "Billed in your local currency. Upgrade, downgrade, or cancel anytime. Every paid plan includes a 14-day free trial.",
    monthlyBilling: "Monthly Billing",
    annualBilling: "Annual Billing",
    discountBadge: "20% OFF",
    perMonth: "/mo",
    billedAnnually: "/mo (billed annually)",
                                    enterpriseTitle: "Enterprise & High-Volume Custom Workspaces",
    enterpriseDesc:
      "Need custom fine-tuned models, dedicated IPs, SLA guarantees, or 20+ team seats?",
    enterpriseButton: "Contact Enterprise Sales",
    plans: [
      {
            planKey: "free",
            name: "Free",
            desc: "For individuals getting started.",
            posts: "3 lifetime schedules",
            features: [
                  "3 integrations",
                  "50k lifetime AI tokens",
                  "0 collaborators",
                  "Analytics & Overview pages",
                  "Customer Support"
            ],
            cta: "Start Free"
      },
      {
            planKey: "pro",
            name: "Pro",
            desc: "For growing creators.",
            posts: "5 schedules / week",
            features: [
                  "7 integrations",
                  "1.6M AI tokens / month",
                  "3 collaborators",
                  "5 max bots",
                  "All pages (No Marketer page)"
            ],
            cta: "Get Pro",
            highlight: true,
            badge: "Popular"
      },
      {
            planKey: "advanced",
            name: "Advanced",
            desc: "For power users.",
            posts: "15 lifetime schedules",
            features: [
                  "10 integrations",
                  "3.5M AI tokens / month",
                  "Hashtag Manager",
                  "7 collaborators",
                  "15 managed bots",
                  "Marketer page included"
            ],
            cta: "Get Advanced"
      },
      {
            planKey: "team",
            name: "Teams",
            desc: "For large agencies.",
            posts: "Unlimited schedules",
            features: [
                  "Unlimited integrations",
                  "7.2M AI tokens / month",
                  "Unlimited collaborators",
                  "Unlimited bots",
                  "All features included"
            ],
            cta: "Contact Sales"
      }
],
  },
  faq: {
    eyebrow: "Frequently Asked Questions",
    title: "Got questions? We've got answers.",
    subtitle:
      "Everything you need to know about KoraSpace, dual operating modes, AI safety, and pricing.",
    q1: "What is the difference between Creator Mode and Marketer Mode?",
    a1: "Creator Mode is built for creators, solo founders, and influencers focusing on brand voice learning, AI post composing, multi-format repurposing, and visual drag-and-drop scheduling across 6+ social networks. Marketer Mode is designed for growth operators and marketing agencies who need campaign execution, social CRM lead triage (converting comments & DMs to deals), autonomous agent operators, and closed-loop revenue attribution.",
    q2: "How does the Brand Brain ensure posts sound like me?",
    a2: "Simply input your website URL, brand guidelines, product briefs, or top past posts. The KoraSpace Brand Brain builds a persistent memory profile with vocabulary rules, tone settings, and custom guardrails so every generated post sounds authentic.",
    q3: "Which social media platforms are supported?",
    a3: "KoraSpace connects directly to Instagram, TikTok, LinkedIn, YouTube, X (Twitter), Facebook, Threads, WhatsApp, Telegram, and more via official authorized OAuth 2.0 APIs.",
    q4: "How does Ghost Mode™ lead triage work?",
    a4: "Ghost Mode™ monitors your comments and direct messages in real time. Using NLP and randomized human-like delays, it detects buying questions and logs qualified leads directly into your CRM Kanban board.",
    q5: "Can I use KoraSpace for multi-client agencies or teams?",
    a5: "Yes! The Agency & Teams tier includes dedicated client workspace portals, multi-seat role permissions with row-level security, shareable draft approval links, and white-label analytics reports.",
    q6: "What payment methods are supported?",
    a6: "We accept all major credit/debit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and localized regional payment providers.",
  },
  cta: {
    eyebrow: "14-Day Free Trial - No Credit Card Required",
    titleLead: "Your autonomous AI marketing team",
    titleHighlight: "starts today.",
    subtitle:
      "Join thousands of creators, founders, and marketing operators automating content creation, scheduling, CRM triage, and revenue growth.",
    startTrial: "Get Started Free",
    signIn: "Sign In to Workspace",
    feature1: "Instant 2-minute onboarding",
    feature2: "Supports 6+ social networks",
  },
  footer: {
    brandDesc:
      "Autonomous AI marketing operating system built for modern creators, startups, and marketing agencies.",
    productHeading: "Product",
    platformHeading: "Platform",
    legalHeading: "Legal",
    supportHeading: "Support",
    directContact: "Direct Contact",
    rightsReserved: "KoraSpace by Techla. All rights reserved.",
    builtLocation: "Global AI Marketing Engine",
    links: {
      product: [
        { label: "AI Composing Pipeline", href: "#engines" },
        { label: "Visual Calendar 2.0", href: "#engines" },
        { label: "Brand Brain", href: "#brain" },
        { label: "Autonomous Growth Loop", href: "#how" },
        { label: "Pricing & Plans", href: "#pricing" },
      ],
      platform: [
        { label: "Instagram Integration", href: "#integrations" },
        { label: "TikTok Auto-Scheduler", href: "#integrations" },
        { label: "LinkedIn & X Publisher", href: "#integrations" },
        { label: "YouTube Repurposer", href: "#integrations" },
        { label: "WhatsApp & Telegram CRM", href: "#integrations" },
      ],
      legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Data Protection", href: "/privacy" },
        { label: "Cookie Policy", href: "/privacy" },
      ],
      support: [
        { label: "Documentation", href: "#" },
        { label: "Help Center", href: "#" },
        { label: "Community", href: "#" },
        { label: "System Status", href: "#" },
      ],
    },
  },
  common: {
    exploreFeature: "Explore Feature",
    launchStudio: "Launch Studio",
    viewPricing: "View Pricing",
    loading: "Loading...",
    secureBadge: "Secure Onboarding",
  },
};
