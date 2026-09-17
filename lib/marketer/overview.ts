import { createClient } from "@/lib/supabase/server";
import type {
  MarketerOverview,
  OverviewRange,
  ClientHealth,
  TrendPoint,
  CampaignPerformance,
  ActivityItem,
  UpcomingItem,
  MarketingOpportunity,
} from "./types";

interface GetMarketerOverviewParams {
  userId: string;
  range?: OverviewRange;
}

function calcPctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  const change = ((current - previous) / previous) * 100;
  return Number.isFinite(change) ? Math.round(change * 10) / 10 : 0;
}

export async function getMarketerOverview({
  userId,
  range = "30d",
}: GetMarketerOverviewParams): Promise<MarketerOverview> {
  const supabase = await createClient();

  // -- Period Windows ------------------------------------------
  const now = new Date();
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;

  const currentEnd = new Date(now);
  const currentStart = new Date(now);
  currentStart.setDate(currentEnd.getDate() - days);

  const previousEnd = new Date(currentStart);
  const previousStart = new Date(currentStart);
  previousStart.setDate(previousEnd.getDate() - days);

  const currentStartISO = currentStart.toISOString();
  const currentEndISO = currentEnd.toISOString();
  const previousStartISO = previousStart.toISOString();
  const previousEndISO = previousEnd.toISOString();

  const currentStartDate = currentStartISO.slice(0, 10);
  const currentEndDate = currentEndISO.slice(0, 10);
  const previousStartDate = previousStartISO.slice(0, 10);
  const previousEndDate = previousEndISO.slice(0, 10);

  // -- Workspaces ----------------------------------------------
  const [{ data: workspaces }, { data: userProfile }] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .eq("user_id", userId),
    supabase
      .from("profiles")
      .select("full_name, persona, plan")
      .eq("id", userId)
      .single(),
  ]);

  const workspaceMap: Record<string, { name: string; role: string }> = {};

  (workspaces || []).forEach((w: any) => {
    workspaceMap[w.workspace_id] = {
      name: "Client Workspace",
      role: w.role || "member",
    };
  });

  if (!workspaceMap[userId]) {
    workspaceMap[userId] = {
      name: userProfile?.full_name
        ? `${userProfile.full_name} (Direct)`
        : "Primary Account",
      role: "owner",
    };
  }

  const workspaceIds = Object.keys(workspaceMap);

  // -- Parallel DB Queries -------------------------------------
  const [
    { data: rawCampaigns },
    { data: dailyMetrics },
    { data: dbActivity },
    { data: dbTasks },
    { data: dbOpportunities },
    { data: prevSnapshots },
  ] = await Promise.all([
    // Current period campaigns
    supabase
      .from("social_campaigns")
      .select(
        "id, user_id, name, platform, status, budget, spend, revenue, conversions, impressions, clicks, roas, ctr, cpc, start_date, end_date, created_at"
      )
      .in("user_id", workspaceIds),

    // Campaign daily metrics for trend chart
    supabase
      .from("campaign_daily_metrics")
      .select("date, workspace_id, spend, impressions, clicks, conversions, revenue")
      .in("workspace_id", workspaceIds)
      .gte("date", currentStartDate)
      .lte("date", currentEndDate)
      .order("date", { ascending: true }),

    // Recent workspace activity
    supabase
      .from("workspace_activity")
      .select("id, workspace_id, type, title, description, created_at, actor_name")
      .in("workspace_id", workspaceIds)
      .order("created_at", { ascending: false })
      .limit(10),

    // Upcoming tasks
    supabase
      .from("marketing_tasks")
      .select("id, workspace_id, title, description, type, priority, due_at, status")
      .in("workspace_id", workspaceIds)
      .neq("status", "completed")
      .neq("status", "cancelled")
      .order("due_at", { ascending: true })
      .limit(8),

    // AI-generated opportunities
    supabase
      .from("marketing_opportunities")
      .select("id, workspace_id, category, title, description, impact, action_label, action_href")
      .in("workspace_id", workspaceIds)
      .eq("dismissed", false)
      .eq("applied", false)
      .order("created_at", { ascending: false })
      .limit(6),

    // Previous period snapshots for real delta calculation
    supabase
      .from("campaign_period_snapshots")
      .select("campaign_id, workspace_id, spend, revenue, impressions, clicks, conversions, roas")
      .in("workspace_id", workspaceIds)
      .gte("period_start", previousStartDate)
      .lte("period_end", previousEndDate),
  ]);

  // -- Process Campaigns ---------------------------------------
  const campaigns = (rawCampaigns || []).map((c: any) => {
    const spend = Number(c.spend) || 0;
    const revenue = Number(c.revenue) || 0;
    const impressions = Number(c.impressions) || 0;
    const clicks = Number(c.clicks) || 0;
    const conversions = Number(c.conversions) || 0;
    const roas = spend > 0 && revenue > 0 ? revenue / spend : Number(c.roas) || 0;
    const ctr = Number(c.ctr) || (impressions > 0 ? (clicks / impressions) * 100 : 0);
    const cpc = Number(c.cpc) || (clicks > 0 ? spend / clicks : 0);
    const cpa = conversions > 0 ? spend / conversions : 0;

    return {
      id: c.id as string,
      workspaceId: c.user_id as string,
      workspaceName: workspaceMap[c.user_id as string]?.name || "Client Account",
      name: (c.name as string) || "Campaign",
      platform: (c.platform as string) || "instagram",
      status: (c.status as string) || "active",
      spend,
      revenue,
      roas: Math.round(roas * 100) / 100,
      conversions,
      impressions,
      clicks,
      ctr: Math.round(ctr * 100) / 100,
      cpc: Math.round(cpc),
      cpa: Math.round(cpa),
      changePct: 0, // will be computed per-campaign below from snapshots
      createdAt: c.created_at as string,
    };
  });

  // -- Previous Period Totals (from real snapshots) ------------
  const prevSnapshotList = prevSnapshots || [];

  const prevTotals = prevSnapshotList.reduce(
    (acc: { spend: number; revenue: number; impressions: number; clicks: number; conversions: number }, s: any) => ({
      spend: acc.spend + (Number(s.spend) || 0),
      revenue: acc.revenue + (Number(s.revenue) || 0),
      impressions: acc.impressions + (Number(s.impressions) || 0),
      clicks: acc.clicks + (Number(s.clicks) || 0),
      conversions: acc.conversions + (Number(s.conversions) || 0),
    }),
    { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 }
  );

  // Build prev snapshot lookup per campaign
  const prevByCampaign = new Map<string, { spend: number; revenue: number; roas: number }>();
  prevSnapshotList.forEach((s: any) => {
    if (s.campaign_id) {
      prevByCampaign.set(s.campaign_id as string, {
        spend: Number(s.spend) || 0,
        revenue: Number(s.revenue) || 0,
        roas: Number(s.roas) || 0,
      });
    }
  });

  // Annotate changePct on each campaign using real snapshot
  const annotatedCampaigns = campaigns.map((c: any) => {
    const prev = prevByCampaign.get(c.id);
    const prevRevenue = prev?.revenue ?? 0;
    const changePct = prevRevenue > 0 ? calcPctChange(c.revenue, prevRevenue) : 0;
    return { ...c, changePct };
  });

  // -- Aggregate Totals ----------------------------------------
  const totalSpend = annotatedCampaigns.reduce((s: number, c: any) => s + c.spend, 0);
  const totalRevenue = annotatedCampaigns.reduce((s: number, c: any) => s + c.revenue, 0);
  const totalConversions = annotatedCampaigns.reduce((s: number, c: any) => s + c.conversions, 0);
  const totalImpressions = annotatedCampaigns.reduce((s: number, c: any) => s + c.impressions, 0);
  const totalClicks = annotatedCampaigns.reduce((s: number, c: any) => s + c.clicks, 0);
  const activeCampaigns = annotatedCampaigns.filter((c: any) => c.status === "active").length;
  const prevActiveCampaigns = prevSnapshotList.length; // rough proxy

  const weightedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const portfolioCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const portfolioCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const portfolioCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;

  const prevRoas = prevTotals.spend > 0 ? prevTotals.revenue / prevTotals.spend : 0;

  const changes = {
    spendPct: calcPctChange(totalSpend, prevTotals.spend),
    revenuePct: calcPctChange(totalRevenue, prevTotals.revenue),
    roasPct: calcPctChange(weightedRoas, prevRoas),
    conversionsPct: calcPctChange(totalConversions, prevTotals.conversions),
    activeCampaignsPct: calcPctChange(activeCampaigns, prevActiveCampaigns),
    impressionsPct: calcPctChange(totalImpressions, prevTotals.impressions),
  };

  // -- Client Health -------------------------------------------
  const clientHealth: ClientHealth[] = workspaceIds.map((wId) => {
    const info = workspaceMap[wId];
    const clientCampaigns = annotatedCampaigns.filter((c: any) => c.workspaceId === wId);
    const clientPrevSnapshots = prevSnapshotList.filter((s: any) => s.workspace_id === wId);

    const clientSpend = clientCampaigns.reduce((s: number, c: any) => s + c.spend, 0);
    const clientRevenue = clientCampaigns.reduce((s: number, c: any) => s + c.revenue, 0);
    const clientConversions = clientCampaigns.reduce((s: number, c: any) => s + c.conversions, 0);
    const clientActive = clientCampaigns.filter((c: any) => c.status === "active").length;
    const clientRoas = clientSpend > 0 ? clientRevenue / clientSpend : 0;

    const prevClientSpend = clientPrevSnapshots.reduce((s: number, p: any) => s + (Number(p.spend) || 0), 0);
    const prevClientRevenue = clientPrevSnapshots.reduce((s: number, p: any) => s + (Number(p.revenue) || 0), 0);
    const prevClientRoas = prevClientSpend > 0 ? prevClientRevenue / prevClientSpend : 0;

    let status: "healthy" | "attention" | "critical" = "healthy";
    if (clientRoas >= 2.0 && clientActive > 0) {
      status = "healthy";
    } else if (clientRoas >= 1.2 || (clientActive > 0 && clientSpend > 0)) {
      status = "attention";
    } else {
      status = "critical";
    }

    return {
      workspaceId: wId,
      name: info.name,
      role: info.role,
      status,
      spend: clientSpend,
      revenue: clientRevenue,
      roas: Math.round(clientRoas * 100) / 100,
      activeCampaigns: clientActive,
      conversions: clientConversions,
      spendChange: calcPctChange(clientSpend, prevClientSpend),
      revenueChange: calcPctChange(clientRevenue, prevClientRevenue),
      roasChange: calcPctChange(clientRoas, prevClientRoas),
      lastActivityAt: clientCampaigns[0]?.createdAt || null,
    };
  });

  // -- Spend Trend from Real Daily Metrics --------------------
  const metricsByDate = new Map<
    string,
    { spend: number; revenue: number; impressions: number; clicks: number; conversions: number }
  >();

  (dailyMetrics || []).forEach((m: any) => {
    const key = m.date as string;
    const existing = metricsByDate.get(key) || {
      spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0,
    };
    metricsByDate.set(key, {
      spend: existing.spend + (Number(m.spend) || 0),
      revenue: existing.revenue + (Number(m.revenue) || 0),
      impressions: existing.impressions + (Number(m.impressions) || 0),
      clicks: existing.clicks + (Number(m.clicks) || 0),
      conversions: existing.conversions + (Number(m.conversions) || 0),
    });
  });

  // Build date range buckets
  const numPoints = range === "7d" ? 7 : range === "90d" ? 12 : 10;
  const spendTrend: TrendPoint[] = Array.from({ length: numPoints }, (_, i) => {
    const pointDate = new Date(currentStart);
    pointDate.setDate(pointDate.getDate() + Math.round((i * days) / numPoints));
    const dateStr = pointDate.toISOString().slice(0, 10);
    const monthDay = pointDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    const bucket = metricsByDate.get(dateStr) || {
      spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0,
    };

    const pointRoas =
      bucket.spend > 0 && bucket.revenue > 0
        ? Math.round((bucket.revenue / bucket.spend) * 10) / 10
        : Math.round(weightedRoas * 10) / 10;

    return {
      date: dateStr,
      label: monthDay,
      spend: bucket.spend,
      revenue: bucket.revenue,
      roas: pointRoas,
      conversions: bucket.conversions,
      impressions: bucket.impressions,
    };
  });

  // -- Top Campaigns -------------------------------------------
  const topCampaigns: CampaignPerformance[] = [...annotatedCampaigns]
    .sort((a, b) => b.roas * b.spend - a.roas * a.spend)
    .slice(0, 5);

  // -- Recent Activity (real DB only, no fallbacks) ------------
  const recentActivity: ActivityItem[] = (dbActivity || []).map((a: any) => ({
    id: a.id as string,
    workspaceId: a.workspace_id as string,
    workspaceName: workspaceMap[a.workspace_id as string]?.name || "Portfolio",
    type: a.type as string,
    title: a.title as string,
    description: (a.description as string | null) ?? null,
    createdAt: a.created_at as string,
  }));

  // -- Upcoming Tasks (real DB only, no fallbacks) -------------
  const upcoming: UpcomingItem[] = (dbTasks || []).map((t: any) => ({
    id: t.id as string,
    workspaceId: t.workspace_id as string,
    workspaceName: workspaceMap[t.workspace_id as string]?.name || "Portfolio",
    title: t.title as string,
    description: (t.description as string | null) ?? null,
    type: t.type as string,
    priority: t.priority as "low" | "medium" | "high" | "urgent",
    dueAt: t.due_at as string,
    status: t.status as string,
  }));

  // -- Opportunities (real DB only) ----------------------------
  const opportunities: MarketingOpportunity[] = (dbOpportunities || []).map(
    (o: any) => ({
      id: o.id as string,
      workspaceId: o.workspace_id as string,
      workspaceName: workspaceMap[o.workspace_id as string]?.name || "Portfolio",
      category: o.category as MarketingOpportunity["category"],
      title: o.title as string,
      description: o.description as string,
      impact: o.impact as "high" | "medium" | "low",
      actionLabel: o.action_label as string,
      actionHref: (o.action_href as string | undefined) ?? undefined,
    })
  );

  return {
    range,
    period: {
      start: currentStartISO,
      end: currentEndISO,
      previousStart: previousStartISO,
      previousEnd: previousEndISO,
    },
    summary: {
      clients: workspaceIds.length,
      activeCampaigns,
      spend: totalSpend,
      revenue: totalRevenue,
      roas: Math.round(weightedRoas * 100) / 100,
      conversions: totalConversions,
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: Math.round(portfolioCtr * 100) / 100,
      cpc: Math.round(portfolioCpc),
      cpa: Math.round(portfolioCpa),
    },
    changes,
    clientHealth,
    spendTrend,
    topCampaigns,
    recentActivity,
    upcoming,
    opportunities,
  };
}
