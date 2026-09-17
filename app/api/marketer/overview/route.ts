import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getMarketerOverview } from "@/lib/marketer/overview";
import type { OverviewRange } from "@/lib/marketer/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
      const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range") || "30d";
    const range: OverviewRange = (rangeParam === "7d" || rangeParam === "90d") ? rangeParam : "30d";

    const overview = await getMarketerOverview({
      userId: user.id,
      range,
    });

    return NextResponse.json(overview);
  } catch (error: any) {
    console.error("Error in /api/marketer/overview:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
