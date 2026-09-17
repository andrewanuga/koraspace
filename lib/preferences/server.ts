import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_PREFERENCES, type UserPreferences } from "./types";

/**
 * Fetch preferences for a given user.
 * Falls back to DEFAULT_PREFERENCES if not set or if table not yet migrated.
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  if (!userId) return DEFAULT_PREFERENCES;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_preferences")
      .select("user_id, analytics_style, font_family, theme_mode, dashboard_density, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return { ...DEFAULT_PREFERENCES, user_id: userId };
    }

    return {
      user_id: data.user_id,
      analytics_style: data.analytics_style || DEFAULT_PREFERENCES.analytics_style,
      font_family: data.font_family || DEFAULT_PREFERENCES.font_family,
      theme_mode: data.theme_mode || DEFAULT_PREFERENCES.theme_mode,
      dashboard_density: data.dashboard_density || DEFAULT_PREFERENCES.dashboard_density,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.warn("Error loading user preferences, using defaults:", err);
    return { ...DEFAULT_PREFERENCES, user_id: userId };
  }
}

/**
 * Upsert preferences for a given user.
 */
export async function upsertUserPreferences(
  userId: string,
  partial: Partial<UserPreferences>
): Promise<UserPreferences> {
  if (!userId) {
    throw new Error("User ID is required to save preferences");
  }

  const payload: Partial<UserPreferences> = {
    user_id: userId,
  };

  if (partial.analytics_style) payload.analytics_style = partial.analytics_style;
  if (partial.font_family) payload.font_family = partial.font_family;
  if (partial.theme_mode) payload.theme_mode = partial.theme_mode;
  if (partial.dashboard_density) payload.dashboard_density = partial.dashboard_density;

  let db = await createClient();
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      db = createAdminClient();
    }
  } catch {
    // fallback to user scoped supabase client
  }

  const { data, error } = await db
    .from("user_preferences")
    .upsert(payload, { onConflict: "user_id" })
    .select("user_id, analytics_style, font_family, theme_mode, dashboard_density, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    user_id: data.user_id,
    analytics_style: data.analytics_style,
    font_family: data.font_family,
    theme_mode: data.theme_mode,
    dashboard_density: data.dashboard_density,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}
