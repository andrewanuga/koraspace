import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to continue." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      persona,
      username,
      goals,
      platforms,
      contentFormats,
      niche,
      postingCadence,
      audienceRange,
      targetAudience,
      businessType,
      industry,
      automationLevel,
    } = body;

    const cleanUsername = (username || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

    if (!cleanUsername || cleanUsername.length < 2) {
      return NextResponse.json(
        { error: "Username must be at least 2 characters long (letters, numbers, and underscores only)." },
        { status: 400 }
      );
    }

    let db = supabase;
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        db = createAdminClient();
      }
    } catch {
      db = supabase;
    }

    // Check if username is already taken by another user
    const { data: existingUser } = await db
      .from("profiles")
      .select("id")
      .eq("username", cleanUsername)
      .neq("id", user.id)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: `The username @${cleanUsername} is already taken. Please choose another.` },
        { status: 409 }
      );
    }

    const fullPayload = {
      id: user.id,
      persona: persona || "creator",
      username: cleanUsername,
      onboarding_goals: Array.isArray(goals) ? goals : [],
      social_platforms: Array.isArray(platforms) ? platforms : [],
      content_formats: Array.isArray(contentFormats) ? contentFormats : [],
      niche: niche ? niche.trim() : null,
      posts_per_week: typeof postingCadence === "number" ? postingCadence : 3,
      audience_range: persona === "creator" ? audienceRange || null : null,
      target_audience: (persona === "creator" || persona === "client") && targetAudience ? targetAudience.trim() : null,
      business_type: (persona === "client" || persona === "marketer") ? businessType || null : null,
      industry: persona === "marketer" && industry ? industry.trim() : null,
      automation_level: automationLevel || "suggestions",
      onboarded: true,
      onboarded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Attempt upsert with all personalization columns
    const { error: upsertError } = await db
      .from("profiles")
      .upsert(fullPayload, { onConflict: "id" });

    if (upsertError) {
      console.warn("Full onboarding upsert failed, attempting safe core fallback:", upsertError.message);

      // Graceful fallback to core columns if database schema hasn't been migrated with extra columns
      const corePayload = {
        id: user.id,
        persona: persona || "creator",
        username: cleanUsername,
        niche: niche ? niche.trim() : null,
        posts_per_week: typeof postingCadence === "number" ? postingCadence : 3,
        audience_range: persona === "creator" ? audienceRange || null : null,
        business_type: (persona === "client" || persona === "marketer") ? businessType || null : null,
        onboarded: true,
        onboarded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: fallbackError } = await db
        .from("profiles")
        .upsert(corePayload, { onConflict: "id" });

      if (fallbackError) {
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
