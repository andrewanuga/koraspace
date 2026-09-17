export type OverviewRange = "7d" | "30d" | "90d";

export interface ClientHealth {
  workspaceId: string;
  name: string;
  role: string;
  status: "healthy" | "attention" | "critical";
  spend: number;
  revenue: number;
  roas: number;
  activeCampaigns: number;
  conversions: number;
  spendChange: number;
  revenueChange: number;
  roasChange: number;
  lastActivityAt: string | null;
}

export interface TrendPoint {
  date: string;
  label: string;
  spend: number;
  revenue: number;
  roas: number;
  conversions: number;
  impressions: number;
}

export interface CampaignPerformance {
  id: string;
  workspaceId: string;
  workspaceName: string;
  name: string;
  platform: string;
  status: string;
  spend: number;
  revenue: number;
  roas: number;
  conversions: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpa: number;
  changePct: number;
}

export interface ActivityItem {
  id: string;
  workspaceId: string;
  workspaceName: string;
  type: string;
  title: string;
  description: string | null;
  createdAt: string;
}

export interface UpcomingItem {
  id: string;
  workspaceId: string;
  workspaceName: string;
  title: string;
  description: string | null;
  type: string;
  priority: "low" | "medium" | "high" | "urgent";
  dueAt: string;
  status: string;
}

export interface MarketingOpportunity {
  id: string;
  workspaceId?: string;
  workspaceName?: string;
  category: "scale" | "budget" | "creative" | "roas" | "strategy";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  actionLabel: string;
  actionHref?: string;
}

export interface MarketerOverview {
  range: OverviewRange;
  period: {
    start: string;
    end: string;
    previousStart: string;
    previousEnd: string;
  };
  summary: {
    clients: number;
    activeCampaigns: number;
    spend: number;
    revenue: number;
    roas: number;
    conversions: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpa: number;
  };
  changes: {
    spendPct: number;
    revenuePct: number;
    roasPct: number;
    conversionsPct: number;
    activeCampaignsPct: number;
    impressionsPct: number;
  };
  clientHealth: ClientHealth[];
  spendTrend: TrendPoint[];
  topCampaigns: CampaignPerformance[];
  recentActivity: ActivityItem[];
  upcoming: UpcomingItem[];
  opportunities: MarketingOpportunity[];
}
