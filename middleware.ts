import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            })
          );
        },
      },
    }
  );

  // Refresh auth session and check authentication state
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes that strictly require authentication
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/onboarding");

  // Auth routes (redirect already authenticated users to /dashboard)
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/reset-password";

  // 1. If trying to access a protected route without a valid user session -> Redirect to /login
  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If logged in and visiting login/signup -> Redirect to /dashboard
  if (isAuthRoute && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.searchParams.delete("next");
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Admin sub-route protection: check admin privileges
  if (pathname.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, plan")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.is_admin || profile?.plan === "team";
    if (!isAdmin) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static image/font assets (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico, .woff, .woff2)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
