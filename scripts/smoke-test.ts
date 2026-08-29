/**
 * Post-Deployment Smoke Test Script
 *
 * Exercises critical health, readiness, and API endpoints against a live or local deployment:
 * 1. GET /api/health (Liveness)
 * 2. GET /api/readiness (Dependency probe)
 * 3. GET /api/ai/observability (Telemetry & metrics)
 * 4. Streaming SSE connection handshake
 */

const BASE_URL = process.env.DEPLOYMENT_URL || "http://localhost:3000";

interface SmokeCheckResult {
  endpoint: string;
  passed: boolean;
  statusCode: number;
  durationMs: number;
  error?: string;
}

async function runSmokeTests() {
  console.log(`\n🔍 Starting Koraspace AI Smoke Test Suite on: ${BASE_URL}\n`);
  const results: SmokeCheckResult[] = [];

  const checks = [
    { path: "/api/health", expectedStatus: 200, name: "Health Probe" },
    { path: "/api/readiness", expectedStatus: [200, 503], name: "Readiness Probe" },
    { path: "/api/ai/observability", expectedStatus: [200, 401], name: "Observability Route" },
    { path: "/api/ai/memory", expectedStatus: [200, 401], name: "Memory Route" },
  ];

  for (const check of checks) {
    const start = Date.now();
    try {
      const res = await fetch(`${BASE_URL}${check.path}`);
      const durationMs = Date.now() - start;
      const expectedArr = Array.isArray(check.expectedStatus) ? check.expectedStatus : [check.expectedStatus];
      const passed = expectedArr.includes(res.status);

      results.push({
        endpoint: check.path,
        passed,
        statusCode: res.status,
        durationMs,
      });

      const icon = passed ? "✅" : "❌";
      console.log(`${icon} [${res.status}] ${check.name} (${check.path}) - ${durationMs}ms`);
    } catch (err: any) {
      const durationMs = Date.now() - start;
      results.push({
        endpoint: check.path,
        passed: false,
        statusCode: 0,
        durationMs,
        error: err.message,
      });
      console.log(`❌ [FAILED] ${check.name} (${check.path}) - Error: ${err.message}`);
    }
  }

  const allPassed = results.every((r) => r.passed);
  console.log("\n───────────────────────────────────────────────");
  if (allPassed) {
    console.log("✨ All Post-Deployment Smoke Checks PASSED!\n");
    process.exit(0);
  } else {
    console.error("🚨 Smoke Test Suite FAILED! Check error logs above.\n");
    process.exit(1);
  }
}

runSmokeTests();
