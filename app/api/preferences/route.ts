import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
import { getUserPreferences, upsertUserPreferences } from "@/lib/preferences/server";
import type { AnalyticsStyle, FontFamily, ThemeMode, DashboardDensity } from "@/lib/preferences/types";

const VALID_ANALYTICS_STYLES: AnalyticsStyle[] = [
  "auto",
  "line",
  "bar",
  "area",
  "donut",
  "scatter",
  "funnel",
  "radar",
];

const VALID_FONT_FAMILIES: FontFamily[] = [
  "inter",
  "geist",
  "dm-sans",
  "manrope",
  "plus-jakarta",
  "space-grotesk",
  "ibm-plex",
];

const VALID_THEME_MODES: ThemeMode[] = ["dark", "light", "system"];

const VALID_DENSITIES: DashboardDensity[] = ["minimal", "balanced", "detailed"];

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const guard = await checkRequest(req, requestKey(req, user.id), 60);
    if (guard) return guard;

    const preferences = await getUserPreferences(user.id);

    return NextResponse.json({
      ok: true,
      preferences,
    });
  } catch (err: any) {
    console.error("GET /api/preferences error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load preferences" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const guard = await checkRequest(req, requestKey(req, user.id), 20);
    if (guard) return guard;

    const body = await req.json();

    const partial: {
      analytics_style?: AnalyticsStyle;
      font_family?: FontFamily;
      theme_mode?: ThemeMode;
      dashboard_density?: DashboardDensity;
    } = {};

    if (body.analytics_style !== undefined) {
      if (!VALID_ANALYTICS_STYLES.includes(body.analytics_style)) {
        return NextResponse.json(
          { error: `Invalid analytics_style. Must be one of: ${VALID_ANALYTICS_STYLES.join(", ")}` },
          { status: 400 }
        );
      }
      partial.analytics_style = body.analytics_style;
    }

    if (body.font_family !== undefined) {
      if (!VALID_FONT_FAMILIES.includes(body.font_family)) {
        return NextResponse.json(
          { error: `Invalid font_family. Must be one of: ${VALID_FONT_FAMILIES.join(", ")}` },
          { status: 400 }
        );
      }
      partial.font_family = body.font_family;
    }

    if (body.theme_mode !== undefined) {
      if (!VALID_THEME_MODES.includes(body.theme_mode)) {
        return NextResponse.json(
          { error: `Invalid theme_mode. Must be one of: ${VALID_THEME_MODES.join(", ")}` },
          { status: 400 }
        );
      }
      partial.theme_mode = body.theme_mode;
    }

    if (body.dashboard_density !== undefined) {
      if (!VALID_DENSITIES.includes(body.dashboard_density)) {
        return NextResponse.json(
          { error: `Invalid dashboard_density. Must be one of: ${VALID_DENSITIES.join(", ")}` },
          { status: 400 }
        );
      }
      partial.dashboard_density = body.dashboard_density;
    }

    const preferences = await upsertUserPreferences(user.id, partial);

    return NextResponse.json({
      ok: true,
      preferences,
    });
  } catch (err: any) {
    console.error("PATCH /api/preferences error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update preferences" },
      { status: 500 }
    );
  }
}
