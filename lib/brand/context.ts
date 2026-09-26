import { prisma } from "@/lib/db";
import type {
  BrandProfile,
  BrandContext,
} from "./types";

/**
 * Builds unified brand context for AI agents across KoraSpace
 * (Create, Ideas, Repurpose, Ghost, Chat).
 */
export async function buildBrandContext(userId: string): Promise<BrandContext> {
  try {
    const [profile, memories] = await Promise.all([
      prisma.brandProfile.findUnique({
        where: { user_id: userId },
      }).catch(() => null),
      prisma.brandMemory.findMany({
        where: { user_id: userId, enabled: true },
        orderBy: { importance: "desc" },
        take: 15,
      }).catch(() => []),
    ]);

    return {
      profile: (profile as unknown as BrandProfile) ?? null,
      preferences: [],
      styles: [],
      memories: (memories ?? []).map((m) => ({ title: m.title, content: m.content })),
      knowledge: [],
    };
  } catch {
    return {
      profile: null,
      preferences: [],
      styles: [],
      memories: [],
      knowledge: [],
    };
  }
}
