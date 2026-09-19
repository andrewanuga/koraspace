import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sites = await prisma.siteConnection.findMany({
      where: { user_id: session.user.id },
      include: {
        events: {
          orderBy: { created_at: "desc" },
          take: 200,
        },
      },
    });

    if (!sites || sites.length === 0) {
      return NextResponse.json({
        connected_sites: 0,
        total_events: 0,
        top_pages: [],
        top_referrers: [],
        summary: "No external sites connected yet.",
      });
    }

    const allEvents = sites.flatMap((s) => s.events);
    const totalEvents = allEvents.length;

    // Aggregate pageviews by path
    const pageCounts: Record<string, number> = {};
    const referrerCounts: Record<string, number> = {};
    const eventTypeCounts: Record<string, number> = {};

    for (const event of allEvents) {
      if (event.path) {
        pageCounts[event.path] = (pageCounts[event.path] || 0) + 1;
      }
      if (event.referrer) {
        try {
          const refHost = new URL(event.referrer).hostname;
          referrerCounts[refHost] = (referrerCounts[refHost] || 0) + 1;
        } catch {
          referrerCounts[event.referrer] = (referrerCounts[event.referrer] || 0) + 1;
        }
      }
      eventTypeCounts[event.event_type] = (eventTypeCounts[event.event_type] || 0) + 1;
    }

    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, views]) => ({ path, views }));

    const topReferrers = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([referrer, count]) => ({ referrer, count }));

    const summaryParts: string[] = [
      `${sites.length} connected external site(s) with ${totalEvents} recorded events.`,
    ];
    if (topPages.length > 0) {
      summaryParts.push(
        `Most visited pages: ${topPages.map((p) => `${p.path} (${p.views} views)`).join(", ")}.`
      );
    }
    if (topReferrers.length > 0) {
      summaryParts.push(
        `Top acquisition channels: ${topReferrers.map((r) => `${r.referrer} (${r.count})`).join(", ")}.`
      );
    }

    return NextResponse.json({
      connected_sites: sites.length,
      sites: sites.map((s) => ({ id: s.id, name: s.site_name, url: s.site_url, verified: s.verified })),
      total_events: totalEvents,
      top_pages: topPages,
      top_referrers: topReferrers,
      event_breakdown: eventTypeCounts,
      summary: summaryParts.join(" "),
    });
  } catch (error) {
    console.error("[Site Analytics API Error]:", error);
    return NextResponse.json({ error: "Failed to load site analytics" }, { status: 500 });
  }
}
