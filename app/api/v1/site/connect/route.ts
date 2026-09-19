import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { randomBytes } from "node:crypto";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sites = await prisma.siteConnection.findMany({
      where: { user_id: session.user.id },
      include: {
        _count: {
          select: { events: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ sites });
  } catch (error) {
    console.error("[Site Connect GET Error]:", error);
    return NextResponse.json({ error: "Failed to fetch connected sites" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { site_name, site_url } = body;

    if (!site_name || !site_url) {
      return NextResponse.json({ error: "site_name and site_url are required" }, { status: 400 });
    }

    // Clean URL
    let cleanUrl = site_url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const apiKey = `kora_site_${randomBytes(16).toString("hex")}`;

    const newSite = await prisma.siteConnection.create({
      data: {
        user_id: session.user.id,
        site_name: site_name.trim(),
        site_url: cleanUrl,
        api_key: apiKey,
        verified: false,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://koraspace.site";
    const snippet = `<script defer src="${appUrl}/koraspace-tracker.js" data-site-id="${apiKey}"></script>`;

    return NextResponse.json({
      site: newSite,
      snippet,
      instruction: "Paste this script into the <head> or <body> tag of your website. Your Koraspace AI agents will immediately begin learning from your visitors' actions.",
    });
  } catch (error) {
    console.error("[Site Connect POST Error]:", error);
    return NextResponse.json({ error: "Failed to create site connection" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("id");

    if (!siteId) {
      return NextResponse.json({ error: "Missing site id" }, { status: 400 });
    }

    await prisma.siteConnection.deleteMany({
      where: {
        id: siteId,
        user_id: session.user.id,
      },
    });

    return NextResponse.json({ ok: true, deleted: siteId });
  } catch (error) {
    console.error("[Site Connect DELETE Error]:", error);
    return NextResponse.json({ error: "Failed to delete site connection" }, { status: 500 });
  }
}
