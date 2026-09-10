import { createClient } from "@/lib/supabase/server";

export type StrategyPlanItem = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

export type ContentPillar = {
  id: string;
  name: string;
  percentage: number;
  description: string;
};

export type PostingFrequency = {
  platform: string;
  postsPerWeek: number;
};

export type GrowthExperiment = {
  id: string;
  title: string;
  status: "planned" | "in_progress" | "winning" | "paused";
  description: string;
  expectedImpact: string;
};

export type PlatformStrategy = {
  platform: string;
  priority: "high" | "medium" | "low";
  postsPerWeek: number;
  reason: string;
};

export type Strategy = {
  id: string | null;

  businessGoal: string;
  targetGrowth: number;
  mainKpi: string;
  timeframe: string;

  plan30: StrategyPlanItem[];
  plan60: StrategyPlanItem[];
  plan90: StrategyPlanItem[];

  contentPillars: ContentPillar[];
  postingFrequency: PostingFrequency[];
  growthExperiments: GrowthExperiment[];

  audience: string[];
  platformStrategy: PlatformStrategy[];

  status: "draft" | "active" | "archived";

  updatedAt: string | null;
};

type Campaign = {
  id: string;
  user_id: string;
  platform: string | null;
  status: string | null;
  spend: number | null;
  revenue: number | null;
  conversions: number | null;
  impressions: number | null;
  clicks: number | null;
};

export type StrategyContext = {
  workspaceId: string;

  metrics: {
    spend: number;
    revenue: number;
    conversions: number;
    impressions: number;
    clicks: number;
    roas: number;
    activeCampaigns: number;
  };

  platforms: {
    platform: string;
    spend: number;
    conversions: number;
    roas: number;
  }[];

  strategy: Strategy | null;
};

export function emptyStrategy(): Strategy {
  return {
    id: null,
    businessGoal: "Increase revenue",
    targetGrowth: 40,
    mainKpi: "New leads",
    timeframe: "90",

    plan30: [
      {
        id: "30-positioning",
        title: "Optimize brand positioning",
        description: "Clarify the core offer, audience and strongest differentiator.",
        completed: false,
      },
      {
        id: "30-content",
        title: "Launch 2 new content series",
        description: "Create repeatable formats around highest-value audience problems.",
        completed: false,
      },
      {
        id: "30-experiments",
        title: "Test 3 campaign concepts",
        description: "Run controlled creative and audience tests before scaling.",
        completed: false,
      },
      {
        id: "30-email",
        title: "Build the nurture funnel",
        description: "Turn current lead conversions into an automated follow-up sequence.",
        completed: false,
      },
    ],
    plan60: [
      {
        id: "60-scale",
        title: "Scale winning campaigns",
        description: "Increase investment behind campaigns that consistently outperform.",
        completed: false,
      },
      {
        id: "60-paid",
        title: "Launch paid campaign expansion",
        description: "Expand the strongest audience and creative combinations.",
        completed: false,
      },
      {
        id: "60-creators",
        title: "Partner with 2 creators",
        description: "Use creator-led distribution to expand reach and trust.",
        completed: false,
      },
      {
        id: "60-leads",
        title: "Reach the next lead milestone",
        description: "Optimize acquisition around the highest-converting channels.",
        completed: false,
      },
    ],
    plan90: [
      {
        id: "90-spend",
        title: "Increase ad spend on winners",
        description: "Shift budget toward proven campaigns while protecting efficiency.",
        completed: false,
      },
      {
        id: "90-product",
        title: "Launch the next growth campaign",
        description: "Use learnings from the first 60 days to build a larger campaign.",
        completed: false,
      },
      {
        id: "90-funnel",
        title: "Optimize conversion funnel",
        description: "Remove friction between content engagement and conversion.",
        completed: false,
      },
      {
        id: "90-scale",
        title: "Reach the next growth milestone",
        description: "Consolidate the strongest acquisition channels and scale them.",
        completed: false,
      },
    ],

    contentPillars: [
      {
        id: "education",
        name: "Educational",
        percentage: 40,
        description: "Teach practical concepts and solve audience problems.",
      },
      {
        id: "product",
        name: "Product Updates",
        percentage: 20,
        description: "Show what you offer and why it matters.",
      },
      {
        id: "behind-scenes",
        name: "Behind the Scenes",
        percentage: 15,
        description: "Build trust through process and personality.",
      },
      {
        id: "customer",
        name: "Customer Success",
        percentage: 15,
        description: "Use proof, results and customer stories.",
      },
      {
        id: "thought-leadership",
        name: "Thought Leadership",
        percentage: 10,
        description: "Build authority around your strongest expertise.",
      },
    ],
    postingFrequency: [
      { platform: "Instagram", postsPerWeek: 5 },
      { platform: "TikTok", postsPerWeek: 4 },
      { platform: "X", postsPerWeek: 4 },
      { platform: "LinkedIn", postsPerWeek: 3 },
      { platform: "YouTube", postsPerWeek: 2 },
    ],
    growthExperiments: [
      {
        id: "ai-content",
        title: "AI-Powered Content Series",
        status: "winning",
        description: "Create a recurring series using AI-assisted content production.",
        expectedImpact: "+12% engagement",
      },
      {
        id: "creator-partnership",
        title: "Creator Partnership Program",
        status: "in_progress",
        description: "Test partnerships with niche creators who reach target audience.",
        expectedImpact: "+8% reach",
      },
      {
        id: "video-first",
        title: "Video-First Strategy",
        status: "planned",
        description: "Increase short-form video output and compare retention against static.",
        expectedImpact: "+15% reach",
      },
    ],

    audience: [
      "High-intent prospects",
      "Existing customers",
      "Industry decision makers",
      "Problem-aware audiences",
    ],
    platformStrategy: [
      {
        platform: "Instagram",
        priority: "high",
        postsPerWeek: 5,
        reason: "Prioritize the strongest available channel for visual distribution and testing.",
      },
      {
        platform: "LinkedIn",
        priority: "high",
        postsPerWeek: 3,
        reason: "Use educational and authority-led content to capture high-intent buyers.",
      },
      {
        platform: "TikTok",
        priority: "medium",
        postsPerWeek: 4,
        reason: "Use short-form experiments to discover scalable creative angles.",
      },
      {
        platform: "X",
        priority: "medium",
        postsPerWeek: 4,
        reason: "Use conversation-driven content for awareness and audience research.",
      },
    ],

    status: "draft",
    updatedAt: null,
  };
}

function mapStrategy(row: any): Strategy {
  return {
    id: row.id,

    businessGoal: row.business_goal || "Increase revenue",
    targetGrowth: Number(row.target_growth || 0),
    mainKpi: row.main_kpi || "New leads",
    timeframe: row.timeframe || "90",

    plan30: row.plan_30 || [],
    plan60: row.plan_60 || [],
    plan90: row.plan_90 || [],

    contentPillars: row.content_pillars || [],
    postingFrequency: row.posting_frequency || [],
    growthExperiments: row.growth_experiments || [],

    audience: row.audience || [],
    platformStrategy: row.platform_strategy || [],

    status: row.status || "draft",

    updatedAt: row.updated_at || null,
  };
}

async function getAccessibleWorkspaceIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data: memberships, error } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching workspace memberships:", error);
  }

  const ids = new Set<string>();
  ids.add(userId);

  for (const membership of memberships || []) {
    if (membership.workspace_id) {
      ids.add(membership.workspace_id);
    }
  }

  return Array.from(ids);
}

export async function getStrategyContext(
  userId: string,
  workspaceId?: string
): Promise<StrategyContext> {
  const supabase = await createClient();

  const workspaceIds = await getAccessibleWorkspaceIds(supabase, userId);

  const selectedWorkspaceId =
    workspaceId && workspaceIds.includes(workspaceId)
      ? workspaceId
      : workspaceIds[0];

  if (!selectedWorkspaceId) {
    return {
      workspaceId: userId,
      metrics: {
        spend: 0,
        revenue: 0,
        conversions: 0,
        impressions: 0,
        clicks: 0,
        roas: 0,
        activeCampaigns: 0,
      },
      platforms: [],
      strategy: emptyStrategy(),
    };
  }

  const targetWorkspaceIds =
    selectedWorkspaceId === userId
      ? workspaceIds
      : [selectedWorkspaceId];

  const { data: campaigns, error: campaignError } = await supabase
    .from("social_campaigns")
    .select(
      `
        id,
        user_id,
        platform,
        status,
        spend,
        revenue,
        conversions,
        impressions,
        clicks
      `
    )
    .in("user_id", targetWorkspaceIds);

  if (campaignError) {
    console.error("Error querying campaigns for strategy:", campaignError);
  }

  const rows = (campaigns || []) as Campaign[];

  const spend = rows.reduce(
    (sum, campaign) => sum + Number(campaign.spend || 0),
    0
  );

  const revenue = rows.reduce(
    (sum, campaign) => sum + Number(campaign.revenue || 0),
    0
  );

  const conversions = rows.reduce(
    (sum, campaign) => sum + Number(campaign.conversions || 0),
    0
  );

  const impressions = rows.reduce(
    (sum, campaign) => sum + Number(campaign.impressions || 0),
    0
  );

  const clicks = rows.reduce(
    (sum, campaign) => sum + Number(campaign.clicks || 0),
    0
  );

  const activeCampaigns = rows.filter(
    (campaign) =>
      campaign.status === "active" ||
      campaign.status === "running"
  ).length;

  const roas = spend > 0 ? revenue / spend : 0;

  const platformMap = new Map<
    string,
    {
      spend: number;
      revenue: number;
      conversions: number;
    }
  >();

  for (const campaign of rows) {
    const platform = campaign.platform || "Other";

    const current = platformMap.get(platform) || {
      spend: 0,
      revenue: 0,
      conversions: 0,
    };

    current.spend += Number(campaign.spend || 0);
    current.revenue += Number(campaign.revenue || 0);
    current.conversions += Number(campaign.conversions || 0);

    platformMap.set(platform, current);
  }

  const platforms = Array.from(platformMap.entries()).map(
    ([platform, value]) => ({
      platform,
      spend: value.spend,
      conversions: value.conversions,
      roas:
        value.spend > 0
          ? value.revenue / value.spend
          : 0,
    })
  );

  // Fetch active strategy from DB
  const { data: strategyRow, error: strategyError } = await supabase
    .from("marketing_strategies")
    .select("*")
    .eq("workspace_id", selectedWorkspaceId)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (strategyError) {
    console.error("Error reading marketing_strategies:", strategyError);
  }

  return {
    workspaceId: selectedWorkspaceId,

    metrics: {
      spend,
      revenue,
      conversions,
      impressions,
      clicks,
      roas,
      activeCampaigns,
    },

    platforms,

    strategy: strategyRow
      ? mapStrategy(strategyRow)
      : emptyStrategy(),
  };
}

function makePlanItems(
  phase: 30 | 60 | 90,
  metrics: StrategyContext["metrics"]
): StrategyPlanItem[] {
  if (phase === 30) {
    return [
      {
        id: "30-positioning",
        title: "Optimize brand positioning",
        description:
          "Clarify the core offer, audience and strongest differentiator across channels.",
        completed: false,
      },
      {
        id: "30-content",
        title: "Launch 2 new content series",
        description:
          "Create repeatable weekly formats around the highest-value audience problems.",
        completed: false,
      },
      {
        id: "30-experiments",
        title: "Test 3 campaign concepts",
        description:
          "Run controlled creative and audience tests before committing heavy ad spend.",
        completed: false,
      },
      {
        id: "30-email",
        title: "Build the nurture funnel",
        description:
          `Turn ${metrics.conversions || 0} current conversions into an automated multi-step follow-up journey.`,
        completed: false,
      },
    ];
  }

  if (phase === 60) {
    return [
      {
        id: "60-scale",
        title: "Scale winning campaigns",
        description:
          "Increase budget allocation behind campaigns that consistently beat target ROAS.",
        completed: false,
      },
      {
        id: "60-paid",
        title: "Launch paid campaign expansion",
        description:
          "Expand the strongest performing audience and creative combinations.",
        completed: false,
      },
      {
        id: "60-creators",
        title: "Partner with 2 creators",
        description:
          "Leverage creator-led distribution to expand social reach and brand trust.",
        completed: false,
      },
      {
        id: "60-leads",
        title: "Reach the next lead milestone",
        description:
          "Optimize customer acquisition around top-performing lead conversion channels.",
        completed: false,
      },
    ];
  }

  return [
    {
      id: "90-spend",
      title: "Increase ad spend on winners",
      description:
        "Shift portfolio budget toward proven high-ROAS campaigns while protecting cost per lead.",
      completed: false,
    },
    {
      id: "90-product",
      title: "Launch the next growth campaign",
      description:
        "Use learnings and creative assets from the first 60 days to launch a broader campaign.",
      completed: false,
    },
    {
      id: "90-funnel",
      title: "Optimize conversion funnel",
      description:
        "Eliminate friction between social content engagement, landing pages, and conversion.",
      completed: false,
    },
    {
      id: "90-scale",
      title: "Reach the next growth milestone",
      description:
        "Consolidate the strongest acquisition channels and scale portfolio revenue.",
      completed: false,
    },
  ];
}

export function generateStrategy(
  context: StrategyContext
): Strategy {
  const { metrics, platforms } = context;

  const sortedPlatforms = [...platforms].sort(
    (a, b) => b.roas - a.roas
  );

  const strongestPlatform =
    sortedPlatforms[0]?.platform || "Instagram";

  const contentPillars: ContentPillar[] = [
    {
      id: "education",
      name: "Educational",
      percentage: 40,
      description: "Teach practical concepts, frameworks, and solve audience pain points.",
    },
    {
      id: "product",
      name: "Product Updates",
      percentage: 20,
      description: "Demonstrate features, use cases, and tangible business benefits.",
    },
    {
      id: "behind-scenes",
      name: "Behind the Scenes",
      percentage: 15,
      description: "Build deep authentic trust through company process and culture.",
    },
    {
      id: "customer",
      name: "Customer Success",
      percentage: 15,
      description: "Leverage social proof, real case studies, and customer transformation stories.",
    },
    {
      id: "thought-leadership",
      name: "Thought Leadership",
      percentage: 10,
      description: "Establish industry authority through opinionated points of view and trends.",
    },
  ];

  const postingFrequency: PostingFrequency[] = [
    {
      platform: strongestPlatform,
      postsPerWeek: 5,
    },
    {
      platform: "TikTok",
      postsPerWeek: 4,
    },
    {
      platform: "X",
      postsPerWeek: 4,
    },
    {
      platform: "LinkedIn",
      postsPerWeek: 3,
    },
    {
      platform: "YouTube",
      postsPerWeek: 2,
    },
  ];

  const platformStrategy: PlatformStrategy[] = [
    {
      platform: strongestPlatform,
      priority: "high",
      postsPerWeek: 5,
      reason:
        "Top performing channel by return metrics. Prioritize for core distribution and new campaign testing.",
    },
    {
      platform: "LinkedIn",
      priority: "high",
      postsPerWeek: 3,
      reason:
        "Capture high-intent B2B decision makers through educational breakdowns and leadership content.",
    },
    {
      platform: "TikTok",
      priority: "medium",
      postsPerWeek: 4,
      reason:
        "Leverage short-form algorithmic discovery to rapidly test creative hooks and reach net-new prospects.",
    },
    {
      platform: "X",
      priority: "medium",
      postsPerWeek: 4,
      reason:
        "Engage in active industry dialogue, market testing, and real-time audience feedback.",
    },
  ];

  const experiments: GrowthExperiment[] = [
    {
      id: "ai-content",
      title: "AI-Powered Content Series",
      status: "winning",
      description:
        "Produce high-frequency niche carousel breakdowns using AI-assisted research and templates.",
      expectedImpact: "+12% engagement",
    },
    {
      id: "creator-partnership",
      title: "Creator Partnership Program",
      status: "in_progress",
      description:
        "Partner with verified niche creators to co-author content and tap into established audiences.",
      expectedImpact: "+8% reach",
    },
    {
      id: "video-first",
      title: "Video-First Strategy",
      status: "planned",
      description:
        "Transition top-performing written posts into short-form video reels and compare retention.",
      expectedImpact: "+15% reach",
    },
  ];

  const audience = [
    "High-intent prospects looking for immediate solutions",
    "Existing customers ready for upsells & renewals",
    "Industry decision makers & growth leaders",
    "Problem-aware audiences seeking actionable blueprints",
  ];

  return {
    id: null,

    businessGoal: "Increase revenue",
    targetGrowth: 40,
    mainKpi: "New leads",
    timeframe: "90",

    plan30: makePlanItems(30, metrics),
    plan60: makePlanItems(60, metrics),
    plan90: makePlanItems(90, metrics),

    contentPillars,
    postingFrequency,
    growthExperiments: experiments,

    audience,
    platformStrategy,

    status: "active",
    updatedAt: new Date().toISOString(),
  };
}

export async function saveStrategy(
  userId: string,
  strategy: Strategy,
  workspaceId: string
) {
  const supabase = await createClient();

  const workspaceIds = await getAccessibleWorkspaceIds(supabase, userId);

  if (!workspaceIds.includes(workspaceId)) {
    throw new Error("You do not have access to this workspace.");
  }

  // Deactivate any existing active strategies for this workspace first
  await supabase
    .from("marketing_strategies")
    .update({ status: "archived" })
    .eq("workspace_id", workspaceId)
    .eq("status", "active");

  const { data, error } = await supabase
    .from("marketing_strategies")
    .insert({
      workspace_id: workspaceId,
      created_by: userId,

      business_goal: strategy.businessGoal,
      target_growth: strategy.targetGrowth,
      main_kpi: strategy.mainKpi,
      timeframe: strategy.timeframe,

      content_pillars: strategy.contentPillars,
      posting_frequency: strategy.postingFrequency,
      growth_experiments: strategy.growthExperiments,

      plan_30: strategy.plan30,
      plan_60: strategy.plan60,
      plan_90: strategy.plan90,

      audience: strategy.audience,
      platform_strategy: strategy.platformStrategy,

      status: "active",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapStrategy(data);
}
