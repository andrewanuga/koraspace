/**
 * REST API: /api/ai/observability
 *
 * Exposes real-time AI operations telemetry, latency percentiles,
 * agent success rates, tool execution metrics, and estimated costs.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspace";
import { AITelemetry } from "@/lib/ai/core/telemetry";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope"); // "workspace" or "global"

    // If global scope requested, verify admin
    let metricsWorkspaceId = workspace.workspaceId;
    if (scope === "global") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", workspace.workspaceId)
        .single();

      if (profile?.is_admin) {
        metricsWorkspaceId = undefined as any;
      }
    }

    const metrics = AITelemetry.getObservabilityMetrics(metricsWorkspaceId);

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error("[GET /api/ai/observability] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve telemetry metrics" },
      { status: 500 }
    );
  }
}
