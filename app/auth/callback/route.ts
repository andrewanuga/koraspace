import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function getSafeRedirect(target: string | null | undefined, fallback = "/dashboard"): string {
  if (!target) return fallback;
  if (
    target.startsWith("/") &&
    !target.startsWith("//") &&
    !target.startsWith("/\\") &&
    !target.includes(":") &&
    !target.includes("\\")
  ) {
    return target;
  }
  return fallback;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const safeNext = getSafeRedirect(rawNext, "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
