import { NextRequest, NextResponse } from "next/server";
import { logSecurityEvent } from "@/lib/security/ratelimit";

/**
 * POST /api/social/send-dm
 *
 * ZERO-TRUST SECURITY ENFORCEMENT MANDATE 1:
 * Hard Scope Blacklist: Explicitly blocks and rejects any operation requesting direct message (DM)
 * access, private inbox reading, password management, or account administrative control.
 *
 * Access is strictly scoped to:
 * - Write: Scheduled content publishing and media uploads.
 * - Read: Public metrics, post performance, and general analytics.
 */
export async function POST(req: NextRequest) {
  logSecurityEvent({
    type: "blocked_scope_execution",
    severity: "critical",
    path: req.nextUrl.pathname,
    detail: "Direct message (DM) operation blocked under Zero-Trust Least-Privilege mandate.",
  });

  return NextResponse.json(
    {
      error: "Access Denied: Direct message (DM) operations and inbox access are strictly prohibited under Koraspace Zero-Trust Least-Privilege security architecture.",
      code: "FORBIDDEN_SCOPE_OPERATION",
    },
    { status: 403 }
  );
}
