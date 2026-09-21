import { prisma } from "@/lib/db";
import { DEFAULT_PREFERENCES, type UserPreferences } from "./types";

/**
 * Fetch preferences for a given user.
 * Falls back to DEFAULT_PREFERENCES if not set or if table not yet migrated.
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  if (!userId) return DEFAULT_PREFERENCES;

  try {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT user_id, analytics_style, font_family, theme_mode, dashboard_density, created_at, updated_at
      FROM "user_preferences"
      WHERE "user_id"::text = ${userId}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return { ...DEFAULT_PREFERENCES, user_id: userId };
    }

    const data = rows[0];
    return {
      user_id: data.user_id,
      analytics_style: data.analytics_style || DEFAULT_PREFERENCES.analytics_style,
      font_family: data.font_family || DEFAULT_PREFERENCES.font_family,
      theme_mode: data.theme_mode || DEFAULT_PREFERENCES.theme_mode,
      dashboard_density: data.dashboard_density || DEFAULT_PREFERENCES.dashboard_density,
      created_at: data.created_at ? new Date(data.created_at).toISOString() : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at).toISOString() : undefined,
    };
  } catch (err) {
    console.warn("Error loading user preferences from DB, using defaults:", err);
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

  const current = await getUserPreferences(userId);
  const analytics_style = partial.analytics_style ?? current.analytics_style ?? DEFAULT_PREFERENCES.analytics_style;
  const font_family = partial.font_family ?? current.font_family ?? DEFAULT_PREFERENCES.font_family;
  const theme_mode = partial.theme_mode ?? current.theme_mode ?? DEFAULT_PREFERENCES.theme_mode;
  const dashboard_density = partial.dashboard_density ?? current.dashboard_density ?? DEFAULT_PREFERENCES.dashboard_density;

  try {
    await prisma.$executeRaw`
      INSERT INTO "user_preferences" (user_id, analytics_style, font_family, theme_mode, dashboard_density, updated_at)
      VALUES (
        ${userId}::uuid,
        ${analytics_style},
        ${font_family},
        ${theme_mode},
        ${dashboard_density},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        analytics_style = EXCLUDED.analytics_style,
        font_family = EXCLUDED.font_family,
        theme_mode = EXCLUDED.theme_mode,
        dashboard_density = EXCLUDED.dashboard_density,
        updated_at = NOW()
    `;

    return await getUserPreferences(userId);
  } catch (err: any) {
    console.error("Error upserting user preferences in database:", err);
    throw new Error(err.message || "Failed to save user preferences");
  }
}
