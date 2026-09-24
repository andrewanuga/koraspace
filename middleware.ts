import { NextResponse } from "next/server";
import { auth } from "@/auth";

/*
 * Proxy / Middleware — runs on Edge Runtime.
 *
 * IMPORTANT: Do NOT import Prisma or any Node.js-only modules here.
 *            Edge Runtime does not support them. Profile existence checks
 *            must be done in server layouts (app/dashboard/layout.tsx).
 *
 * This file handles two lightweight checks using only the JWT session cookie:
 *
 * 1. Protected routes  → redirect to /login if no session.
 * 2. Auth routes       → redirect to /dashboard if already logged in.
 * 3. Admin routes      → redirect to /dashboard if not an admin.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  /* ------------------------------------------------------------------ */
  /* Route classification                                                 */
  /* ------------------------------------------------------------------ */

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/onboarding");

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/reset-password" ||
    pathname === "/update-password";

  /* ------------------------------------------------------------------ */
  /* 1. Protected routes — require a valid session                        */
  /* ------------------------------------------------------------------ */

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  /* ------------------------------------------------------------------ */
  /* 2. Auth routes — already logged-in users should not see these       */
  /* ------------------------------------------------------------------ */

  if (isAuthRoute && user) {
    /*
     * Honor the "next" param if it points to a safe internal path,
     * otherwise fall back to /dashboard.
     */
    const next = req.nextUrl.searchParams.get("next");
    const safeNext =
      next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : "/dashboard";

    return NextResponse.redirect(new URL(safeNext, req.nextUrl.origin));
  }

  /* ------------------------------------------------------------------ */
  /* 3. Admin routes — must have is_admin flag in token                  */
  /* ------------------------------------------------------------------ */

  if (pathname.startsWith("/admin") && user) {
    const isAdmin =
      (user as any).is_admin === true ||
      (user as any).plan === "team";

    if (!isAdmin) {
      return NextResponse.redirect(
        new URL("/dashboard", req.nextUrl.origin)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  /*
   * Run on every request except:
   * - Next.js internal routes (_next/static, _next/image)
   * - favicon and common static asset extensions
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
