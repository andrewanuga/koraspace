// Lightweight in-memory protection for a single server instance:
// fixed-window rate limiting, repeat-offender auto-blocking, and a cached
// view of admin-blocked IPs. For multi-instance/production scale, back this
// with Redis (or put a CDN/WAF like Cloudflare in front).
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Window = { count: number; reset: number };

const hits = new Map<string, Window>();          // key -> window
const violations = new Map<string, Window>();     // ip -> rolling violation count
const autoBlocked = new Map<string, number>();    // ip -> expiry ts

// Admin-defined blocks, cached from the DB.
let dbBlocked = new Set<string>();
let dbBlockedAt = 0;

export interface RateResult { ok: boolean; remaining: number; retryAfter: number }

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  const w = hits.get(key);
  if (!w || w.reset <= now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  w.count++;
  if (w.count > limit) return { ok: false, remaining: 0, retryAfter: Math.ceil((w.reset - now) / 1000) };
  return { ok: true, remaining: limit - w.count, retryAfter: 0 };
}

/** Record a limit violation; auto-block the IP after too many within the window. */
export function noteViolation(ip: string, threshold = 6, windowMs = 10 * 60_000, blockMs = 60 * 60_000): boolean {
  const now = Date.now();
  const v = violations.get(ip);
  if (!v || v.reset <= now) { violations.set(ip, { count: 1, reset: now + windowMs }); return false; }
  v.count++;
  if (v.count >= threshold) {
    autoBlocked.set(ip, now + blockMs);
    // Persist + log (best-effort, non-blocking).
    void persistBlock(ip);
    return true;
  }
  return false;
}

export function isBlocked(ip: string): boolean {
  const exp = autoBlocked.get(ip);
  if (exp && exp > Date.now()) return true;
  if (exp) autoBlocked.delete(ip);
  return dbBlocked.has(ip);
}

/** Refresh the admin blocklist from the DB at most every 60s. */
export async function refreshBlocklist(): Promise<void> {
  const now = Date.now();
  if (now - dbBlockedAt < 60_000) return;
  dbBlockedAt = now;
  try {
    const admin = createAdminClient();
    if (!admin) return;
    const { data } = await admin.from("blocked_ips").select("ip, expires_at");
    const next = new Set<string>();
    (data ?? []).forEach((r: { ip: string; expires_at: string | null }) => {
      if (!r.expires_at || new Date(r.expires_at).getTime() > now) next.add(r.ip);
    });
    dbBlocked = next;
  } catch { /* keep the last good set */ }
}

async function persistBlock(ip: string) {
  try {
    const admin = createAdminClient();
    if (!admin) return;
    await admin.from("blocked_ips").upsert(
      { ip, reason: "Auto-blocked: repeated rate-limit violations", auto: true, expires_at: new Date(Date.now() + 60 * 60_000).toISOString() },
      { onConflict: "ip" }
    );
    await admin.from("security_events").insert({ type: "ip_blocked", ip, severity: "critical", detail: "Auto-blocked after repeated rate limiting" });
  } catch { /* ignore */ }
}

/** Fire-and-forget security event log. */
export function logSecurityEvent(evt: { type: string; ip?: string; path?: string; severity?: "info" | "warning" | "critical"; detail?: string; email?: string; user_id?: string }) {
  try {
    const admin = createAdminClient();
    if (!admin) return;
    void admin.from("security_events").insert({ severity: "info", ...evt });
  } catch { /* ignore */ }
}

// -- Convenience helpers for API routes -------------------------------------

/** Build a rate limit key from a user ID (preferred) or IP address. */
export function requestKey(req: NextRequest, userId?: string): string {
  if (userId) return `user:${userId}`;
  const ip =
    req.headers.get("x-client-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return `ip:${ip}`;
}

/** Extract raw client IP from a NextRequest. */
export function reqIp(req: NextRequest): string {
  return (
    req.headers.get("x-client-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * One-call security guard for API routes.
 *
 * @param req      - Incoming NextRequest
 * @param key      - Rate limit key (use requestKey() to build one)
 * @param limit    - Max requests allowed in the window
 * @param windowMs - Window duration in ms (default: 60 000 = 1 min)
 * @returns NextResponse (403/429) if the request should be rejected, else null.
 *
 * Usage:
 *   const guard = await checkRequest(req, requestKey(req, userId), 30);
 *   if (guard) return guard;
 */
export async function checkRequest(
  req: NextRequest,
  key: string,
  limit: number,
  windowMs = 60_000
): Promise<NextResponse | null> {
  const ip = reqIp(req);
  const path = req.nextUrl.pathname;

  // Refresh and check admin blocklist.
  await refreshBlocklist();
  if (isBlocked(ip)) {
    logSecurityEvent({ type: "blocked_ip_request", ip, path, severity: "warning", detail: "Request from blocked IP" });
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  // Apply rate limit.
  const result = rateLimit(key, limit, windowMs);
  if (!result.ok) {
    const wasAutoBlocked = noteViolation(ip);
    logSecurityEvent({
      type: wasAutoBlocked ? "ip_auto_blocked" : "rate_limit_exceeded",
      ip,
      path,
      severity: wasAutoBlocked ? "critical" : "warning",
      detail: `Rate limit exceeded on ${path}`,
    });
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.retryAfter),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null; // Request is allowed.
}
