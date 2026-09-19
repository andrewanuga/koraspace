import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { site_id, event_type, path, referrer, metadata } = body;

    if (!site_id || typeof site_id !== "string") {
      return NextResponse.json({ error: "Missing site_id" }, { status: 400, headers: corsHeaders });
    }

    // Lookup site connection by api_key or by primary id
    const site = await prisma.siteConnection.findFirst({
      where: {
        OR: [{ api_key: site_id }, { id: site_id }],
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Invalid or unverified site_id" }, { status: 404, headers: corsHeaders });
    }

    const userAgent = req.headers.get("user-agent") || undefined;

    // Record the event
    await prisma.siteEvent.create({
      data: {
        site_id: site.id,
        event_type: String(event_type || "pageview"),
        path: path ? String(path).slice(0, 500) : null,
        referrer: referrer ? String(referrer).slice(0, 500) : null,
        user_agent: userAgent ? userAgent.slice(0, 300) : null,
        metadata: metadata && typeof metadata === "object" ? metadata : {},
      },
    });

    // Automatically verify connection on first incoming heartbeat
    if (!site.verified) {
      await prisma.siteConnection.update({
        where: { id: site.id },
        data: { verified: true },
      });
    }

    return NextResponse.json({ ok: true, site: site.site_name }, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("[Track API Ingestion Error]:", err);
    return NextResponse.json({ error: "Internal tracking error" }, { status: 500, headers: corsHeaders });
  }
}
