import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
import { onboardingSchema } from "@/lib/security/schemas";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to continue." },
        { status: 401 }
      );
    }

    // Rate limit: 5 onboarding submissions/min per user.
    const guard = await checkRequest(req, requestKey(req, user.id), 5);
    if (guard) return guard;


    const body = await req.json();

    // Validate with schema.
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", issues: parsed.error.issues.map((i) => `${i.path}: ${i.message}`) },
        { status: 400 }
      );
    }

    const {
      persona,
      username,
      goals,
      platforms,
      contentFormats,
      niche,
      industry,
      audienceRange,
      postingCadence,
      automationLevel,
    } = parsed.data;

    // Preserve extra unvalidated fields from body for DB upsert.
    const { targetAudience, businessType } = (body as Record<string, unknown>);

    const cleanUsername = username;

    if (!cleanUsername || cleanUsername.length < 2) {
      return NextResponse.json(
        { error: "Username must be at least 2 characters long (letters, numbers, and underscores only)." },
        { status: 400 }
      );
    }

    // Check if username is already taken by another user
    const existingUser = await prisma.profile.findFirst({
      where: {
        username: cleanUsername,
        id: { not: user.id }
      },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: `The username @${cleanUsername} is already taken. Please choose another.` },
        { status: 409 }
      );
    }

    const fullPayload = {
      persona: persona || "creator",
      username: cleanUsername,
      onboarding_goals: Array.isArray(goals) ? goals : [],
      social_platforms: Array.isArray(platforms) ? platforms : [],
      content_formats: Array.isArray(contentFormats) ? contentFormats : [],
      niche: niche ? niche.trim() : null,
      posts_per_week: typeof postingCadence === "number" ? postingCadence : 3,
      audience_range: persona === "creator" ? audienceRange || null : null,
      target_audience: (persona as string) === "creator" || (persona as string) === "client" ? (typeof targetAudience === "string" ? targetAudience.trim() : null) : null,
      business_type: (persona as string) === "client" || persona === "marketer" ? businessType || null : null,
      industry: persona === "marketer" && industry ? industry.trim() : null,
      automation_level: automationLevel || "suggestions",
      onboarded: true,
      onboarded_at: new Date(),
    };

    // Attempt update with all personalization columns
    try {
      await prisma.profile.update({
        where: { id: user.id },
        data: fullPayload
      });
    } catch (upsertError: any) {
      console.warn("Full onboarding update failed, attempting safe core fallback:", upsertError.message);

      // Graceful fallback to core columns
      const corePayload = {
        persona: persona || "creator",
        username: cleanUsername,
        niche: niche ? niche.trim() : null,
        posts_per_week: typeof postingCadence === "number" ? postingCadence : 3,
        audience_range: persona === "creator" ? audienceRange || null : null,
        business_type: (persona as string) === "client" || persona === "marketer" ? businessType || null : null,
        onboarded: true,
        onboarded_at: new Date(),
      };

      try {
        await prisma.profile.update({
          where: { id: user.id },
          data: corePayload
        });
      } catch (fallbackError: any) {
        console.error("Onboarding core fallback error:", fallbackError);
        return NextResponse.json(
          { error: fallbackError.message || "Failed to save workspace profile." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      persona: fullPayload.persona,
      username: cleanUsername,
    });
  } catch (err: any) {
    console.error("Onboarding API error:", err);
    return NextResponse.json(
      { error: err?.message || "An unexpected error occurred during onboarding." },
      { status: 500 }
    );
  }
}

