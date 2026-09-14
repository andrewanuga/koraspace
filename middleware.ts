import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ── Constants ───────────────────────────────────────────────────────────────
const SESSION_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

/** Routes that require a logged-in user. */
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding", "/admin"];

/** Routes that logged-in users should not revisit (e.g. login page). */
const AUTH_PREFIXES = ["/login", "/signup", "/auth"];

/** Skip middleware for static assets and Next.js internals. */
function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/_health") ||
    /\.(ico|png|jpg|jpeg|svg|webp|gif|woff2?|ttf|eot|css|js\.map)$/.test(pathname)
  );
}

// ── In-memory IP blocklist cache (refreshed at most every 60s) ──────────────
let cachedBlockedIps = new Set<string>();
let cacheRefreshedAt = 0;

async function getBlockedIps(): Promise<Set<string>> {
  const now = Date.now();
  if (now - cacheRefreshedAt < 60_000) return cachedBlockedIps;
  cacheRefreshedAt = now;
  try {
    const { createClient: createSupabaseAdmin } = await import(
      "@supabase/supabase-js"
    );
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !url) return cachedBlockedIps;
    const admin = createSupabaseAdmin(url, serviceKey, {
      auth: { persistSession: false },
    });
    const { data } = await admin
      .from("blocked_ips")
      .select("ip, expires_at");
    const next = new Set<string>();
    (data ?? []).forEach(
      (r: { ip: string; expires_at: string | null }) => {
        if (!r.expires_at || new Date(r.expires_at).getTime() > now)
          next.add(r.ip);
      }
    );
    cachedBlockedIps = next;
  } catch {
    /* keep previous list */
  }
  return cachedBlockedIps;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-client-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function buildCsp(nonce: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const isDev = process.env.NODE_ENV === "development";

  return [
    `default-src 'self'`,
    // Scripts: allow self, nonce-gated, strict-dynamic; dev allows eval for React HMR
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""} https://js.paystack.co`,
    // Styles: self + inline, plus the two font stylesheet hosts the layout links.
    //
    // Deliberately NO nonce here. Per CSP, a nonce in style-src makes
    // 'unsafe-inline' inert — so the previous value blocked every inline style
    // attribute on the site (the browser reported ~276 refusals per page load),
    // the hero's background gradient among them: it ships as a style attribute
    // in the server HTML, was refused, and the hero lost its colour. A nonce on
    // script-src is what actually carries weight; style injection is not a
    // comparable risk, and React and framer-motion both require inline styles.
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com`,
    // Images: allow self, blob, data, and the third-party avatar CDNs
    `img-src 'self' blob: data: ${supabaseUrl} https://lh3.googleusercontent.com https://pbs.twimg.com https://media.licdn.com`,
    // Fonts: self + the CDNs those two stylesheets pull their font files from.
    // Without these the linked faces (General Sans, Inter et al) are requested
    // and then refused, silently falling back to system fonts.
    `font-src 'self' https://fonts.gstatic.com https://cdn.fontshare.com`,
    // Connect: self + Supabase + OpenRouter AI API + Paystack
    `connect-src 'self' ${supabaseUrl} https://openrouter.ai https://api.paystack.co wss://*.supabase.co`,
    // Media: self only
    `media-src 'self' blob:`,
    // Frames: deny all embedding
    `frame-ancestors 'none'`,
    // Forms: only submit to self
    `form-action 'self'`,
    // No plugins
    `object-src 'none'`,
    // Only allow https: base URIs
    `base-uri 'self'`,
    // Force HTTPS for any mixed content
    `upgrade-insecure-requests`,
  ]
    .join("; ")
    .replace(/\s+/g, " ");
}

// ── Middleware ──────────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets entirely.
  if (isStaticAsset(pathname)) return NextResponse.next();

  // 2. IP block check (skip for public static pages).
  const clientIp = getClientIp(request);
  if (clientIp !== "unknown") {
    const blocked = await getBlockedIps();
    if (blocked.has(clientIp)) {
      return new NextResponse("Access denied.", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }

  // 3. Generate a per-request CSP nonce.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // 4. Build the Supabase SSR client (refresh + read session from cookies).
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  // Attach the nonce so server components can read it.
  response.headers.set("x-nonce", nonce);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });
          });
        },
      },
    }
  );

  // Refresh auth token (keeps the session alive on valid requests).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 5. 3-day session age enforcement.
  //    Supabase JWTs carry an `iat` (issued-at) claim. We read it from the
  //    session object to check how old this token is; if > 3 days old we sign
  //    out and redirect to the login page.
  if (user) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const iatMs = (session.user.created_at
        ? new Date(session.user.created_at).getTime()
        : 0);
      // Use access_token JWT iat claim for accurate session age.
      try {
        const payload = JSON.parse(
          Buffer.from(session.access_token.split(".")[1], "base64url").toString()
        ) as { iat?: number };
        if (payload.iat) {
          const sessionAgeMs = Date.now() - payload.iat * 1000;
          if (sessionAgeMs > SESSION_MAX_AGE_MS) {
            // Session too old — sign out and redirect.
            await supabase.auth.signOut();
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("reason", "session_expired");
            const expiredResponse = NextResponse.redirect(loginUrl);
            // Clear the auth cookies.
            response.cookies.getAll().forEach((c) => {
              if (c.name.startsWith("sb-")) {
                expiredResponse.cookies.delete(c.name);
              }
            });
            return expiredResponse;
          }
        }
      } catch {
        /* If JWT decode fails, allow session to continue; Supabase's own
           token expiry will handle it. */
      }
      void iatMs; // suppress unused-var lint
    }
  }

  // 6. Route protection.
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    // Unauthenticated user hitting a protected route → send to login.
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    // Already-logged-in user hitting auth pages → send to dashboard.
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 7. Admin route extra guard.
  if (pathname.startsWith("/admin") && user) {
    // Admin check is done in app/admin/layout.tsx server component — the
    // middleware just ensures the user is authenticated; role check happens
    // at the layout level with the full DB read.
  }

  // 8. Attach CSP to the response.
  response.headers.set(
    "Content-Security-Policy",
    buildCsp(nonce)
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
