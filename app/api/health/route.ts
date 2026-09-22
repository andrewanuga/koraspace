/**
 * Liveness Probe: GET /api/health
 *
 * Lightweight health check returning process uptime, memory consumption,
 * and system timestamp for load balancers and orchestrators.
 */

import { NextResponse } from "next/server";

const startTime = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage ? process.memoryUsage() : null;

  return NextResponse.json(
    {
      status: "healthy",
      service: "koraspace-ai",
      uptimeSeconds,
      timestamp: Date.now(),
      memory: memoryUsage
        ? {
            rssMb: Math.round(memoryUsage.rss / (1024 * 1024)),
            heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
          }
        : undefined,
    },
    { status: 200 }
  );
}
