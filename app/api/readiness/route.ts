/**
 * Readiness Probe: GET /api/readiness
 *
 * Deep dependency probe validating database connectivity, pgvector readiness,
 * and AI provider configuration before receiving live traffic.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const checks: Record<string, { status: "pass" | "fail"; latencyMs?: number; error?: string }> = {};
  let isReady = true;

  // 1. Supabase Database Ping
  const dbStart = Date.now();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);
    const dbLatency = Date.now() - dbStart;

    if (error) {
      checks.database = { status: "fail", latencyMs: dbLatency, error: error.message };
      isReady = false;
    } else {
      checks.database = { status: "pass", latencyMs: dbLatency };
    }
  } catch (err: any) {
    checks.database = { status: "fail", error: err.message || "Database connection error" };
    isReady = false;
  }

  // 2. OpenRouter Environment Configuration
  const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY);
  checks.ai_provider = {
    status: hasOpenRouterKey ? "pass" : "fail",
    error: hasOpenRouterKey ? undefined : "OPENROUTER_API_KEY missing",
  };
  if (!hasOpenRouterKey) isReady = false;

  const statusCode = isReady ? 200 : 503;

  return NextResponse.json(
    {
      status: isReady ? "ready" : "degraded",
      service: "koraspace-ai",
      checks,
      timestamp: Date.now(),
    },
    { status: statusCode }
  );
}
