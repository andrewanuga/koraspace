import { NextResponse } from "next/server";
import { RECOMMENDED_MODELS, TIER_META } from "@/lib/ai/models";

/**
 * GET /api/ai/models
 *
 * Returns available AI models for the model picker.
 */
export async function GET() {
  try {
    const recommended = RECOMMENDED_MODELS.map((r) => ({
      ...r,
      pricing: null,
      available: true,
    }));

    return NextResponse.json({
      recommended,
      all: recommended,
      tiers: TIER_META,
    });
  } catch (err) {
    console.error("[/api/ai/models]", err);
    return NextResponse.json({
      recommended: RECOMMENDED_MODELS.map((r) => ({
        ...r,
        pricing: null,
        available: true,
      })),
      all: [],
      tiers: TIER_META,
    });
  }
}
