import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata = {
  title: "Set up your workspace — Koraspace",
};

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, username, onboarded, persona"
    )
    .eq("id", user.id)
    .single();

  if (profile?.onboarded) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-5 py-6 sm:px-8 lg:px-10">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm transition-transform duration-200 group-hover:scale-105">
              <img
                src="/logo.png"
                alt="KoraSpace Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <div className="font-display text-[16px] font-bold tracking-tight text-white">
                Kora<span className="text-[#ff0a8a]">Space</span>
              </div>
              <div className="hidden text-[9px] font-mono uppercase tracking-[0.14em] text-white/30 sm:block">
                Workspace Setup
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-mono uppercase tracking-[0.12em] text-white/40 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34d399] animate-pulse" />
              Secure Onboarding
            </div>

            <Link
              href="/"
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              Exit
            </Link>
          </div>
        </header>

        {/* Main */}
        <div className="flex flex-1 items-center justify-center py-12 lg:py-16">
          <OnboardingFlow
            initialName={profile?.full_name ?? undefined}
            initialUsername={profile?.username ?? undefined}
          />
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-center border-t border-white/[0.05] pt-5">
          <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.13em] text-white/15">
            <span>
              © {new Date().getFullYear()} Koraspace
            </span>

            <span className="h-1 w-1 rounded-full bg-white/10" />

            <Link
              href="/privacy"
              className="transition-colors hover:text-white/40"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-white/40"
            >
              Terms
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}