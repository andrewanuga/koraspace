import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,0.92fr)] xl:grid-cols-[minmax(0,1.15fr)_minmax(500px,0.85fr)]">
        {/* =========================================================
            LEFT — PRODUCT / BRAND EXPERIENCE (Desktop)
        ========================================================= */}
        <aside className="relative hidden min-h-screen overflow-hidden border-r border-white/[0.07] bg-[#121212] lg:flex">
          {/* Subtle geometric lines */}
          <div className="pointer-events-none absolute left-[-120px] top-[15%] h-[260px] w-[260px] rounded-full border border-[#ff0a8a]/10" />
          <div className="pointer-events-none absolute bottom-[10%] right-[4%] h-[180px] w-[180px] rounded-full border border-[#3b82f6]/10" />

          <div className="relative z-10 flex w-full flex-col justify-between px-10 py-10 xl:px-14">
            {/* Top brand header */}
            <div className="flex items-center">
              <Link href="/" className="group flex items-center gap-3">
                <KoraLogo />
                <div>
                  <div className="text-[15px] font-semibold tracking-[-0.02em] text-white group-hover:text-white/90">
                    KoraSpace
                  </div>
                  <div className="text-[10.5px] text-white/40">
                    Marketing & Creator Intelligence
                  </div>
                </div>
              </Link>
            </div>

            {/* Main copy + Product Preview */}
            <div className="my-auto py-8">
              <div className="w-full max-w-[640px]">
                {/* Badge */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.06] px-3.5 py-1.5">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
                  <Sparkles className="h-3.5 w-3.5 text-[#ff0a8a]" />
                  <span className="text-[11px] font-medium text-[#ff7fba]">
                    Your marketing & creator command center
                  </span>
                </div>

                {/* Hero Title */}
                <h1 className="font-display text-[44px] font-semibold leading-[1.04] tracking-[-0.04em] text-white xl:text-[54px]">
                  Turn your audience
                  <span className="block text-[#ff0a8a]">
                    into momentum.
                  </span>
                </h1>

                {/* Description */}
                <p className="mt-5 max-w-[540px] text-[14.5px] leading-relaxed text-white/50">
                  Manage multi-channel campaigns, draft in your signature brand voice,
                  automate CRM workflows, and track real revenue growth across your accounts.
                </p>

                {/* Product preview card */}
                <div className="mt-8 max-w-[580px]">
                  <ProductPreview />
                </div>

                {/* Trust / feature checklist */}
                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[11.5px] text-white/40">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#ff0a8a]" />
                    <span>Multi-channel workflows</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#ff0a8a]" />
                    <span>AI-powered intelligence</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#ff0a8a]" />
                    <span>Real-time attribution</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom meta row */}
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-5 text-[10.5px] text-white/30">
              <span className="uppercase tracking-[0.16em]">
                KoraSpace OS
              </span>

              <div className="flex items-center gap-4">
                <span>Secure Cloud Workspace</span>
                <span>•</span>
                <span>Creator & Marketer Edition</span>
              </div>
            </div>
          </div>
        </aside>

        {/* =========================================================
            RIGHT — AUTH FORM CONTAINER
        ========================================================= */}
        <main className="relative flex min-h-screen flex-1 flex-col justify-between">
          {/* Top navigation row */}
          <div className="flex items-center justify-between px-6 pt-6 sm:px-10">
            {/* Mobile Brand */}
            <Link href="/" className="flex items-center gap-2.5 lg:hidden">
              <KoraLogo />
              <span className="text-sm font-semibold tracking-[-0.02em] text-white">
                KoraSpace
              </span>
            </Link>

            {/* Back link & Language Switcher */}
            <div className="ml-auto flex items-center gap-3">
              <LanguageSwitcher variant="compact" />
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[12px] font-medium text-white/50 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to site</span>
              </Link>
            </div>
          </div>

          {/* Form wrapper */}
          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
            {children}
          </div>

          {/* Mobile footer */}
          <div className="px-6 pb-6 text-center text-[11px] text-white/25 lg:hidden">
            <span>© {new Date().getFullYear()} KoraSpace. All rights reserved.</span>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ===============================================================
   BRAND LOGO
=============================================================== */

function KoraLogo() {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff0a8a] shadow-[0_6px_20px_rgba(255,10,138,0.22)]">
      <div className="absolute h-3.5 w-3.5 rounded-[4px] border-[1.5px] border-white" />
      <div className="absolute h-1.5 w-1.5 rounded-full bg-white" />
      <div className="absolute right-[6px] top-[6px] h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
    </div>
  );
}

/* ===============================================================
   PRODUCT PREVIEW MOCKUP
=============================================================== */

function ProductPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#171717] shadow-[0_25px_70px_rgba(0,0,0,0.45)]">
      {/* Window header */}
      <div className="flex h-10 items-center justify-between border-b border-white/[0.07] px-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
          <span className="text-[8.5px] font-medium text-white/40">
            Workspace Command Center
          </span>
        </div>

        <div className="h-4 w-4 rounded-full border border-white/10 bg-white/[0.04]" />
      </div>

      <div className="grid grid-cols-[105px_1fr]">
        {/* Mini sidebar */}
        <div className="border-r border-white/[0.06] p-2.5">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-4 w-4 rounded-md bg-[#ff0a8a]" />
            <div className="h-2 w-10 rounded-full bg-white/20" />
          </div>

          <div className="space-y-1">
            <MiniNav active label="Overview" />
            <MiniNav label="Create" />
            <MiniNav label="Campaigns" />
            <MiniNav label="Analytics" />
            <MiniNav label="CRM & Leads" />
          </div>

          <div className="mt-5 border-t border-white/[0.06] pt-2">
            <MiniNav label="Brand Kit" />
            <MiniNav label="Settings" />
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="min-w-0 p-3.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="h-2 w-24 rounded-full bg-white/25" />
              <div className="mt-1.5 h-1.5 w-36 rounded-full bg-white/[0.08]" />
            </div>

            <div className="h-5 w-16 rounded-lg bg-[#ff0a8a]/20" />
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat
              label="Revenue"
              value="₦8.4M"
              accent="pink"
            />
            <MiniStat
              label="ROAS"
              value="3.42×"
              accent="blue"
            />
            <MiniStat
              label="Leads"
              value="1,284"
              accent="green"
            />
          </div>

          {/* Mini chart bar strip */}
          <div className="mt-3 rounded-xl border border-white/[0.07] bg-[#131313] p-2.5">
            <div className="flex items-center justify-between">
              <div className="h-1.5 w-16 rounded-full bg-white/20" />
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
                <span className="text-[7.5px] text-white/30">Growth</span>
              </div>
            </div>

            <div className="mt-3 flex h-[60px] items-end gap-1.5">
              {[28, 42, 35, 52, 48, 64, 58, 76, 68, 85, 74, 92].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-[2px] transition-all"
                    style={{
                      height: `${height}%`,
                      background:
                        index >= 9
                          ? "#ff0a8a"
                          : "rgba(255, 255, 255, 0.08)",
                    }}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniNav({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex h-6 items-center rounded-md px-2 text-[7.5px] font-medium ${
        active
          ? "border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.10] text-[#ff7fba]"
          : "text-white/30"
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-sm ${
          active ? "bg-[#ff0a8a]" : "bg-white/15"
        }`}
      />
      {label}
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "pink" | "blue" | "green";
}) {
  const accentClass =
    accent === "pink"
      ? "text-[#ff4da6]"
      : accent === "blue"
      ? "text-[#60a5fa]"
      : "text-[#34d399]";

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#131313] p-2">
      <div className="text-[7px] text-white/30">{label}</div>
      <div className={`mt-1 text-[12px] font-bold ${accentClass}`}>
        {value}
      </div>
    </div>
  );
}
