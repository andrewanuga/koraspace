"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "h-12 w-full rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#ff0a8a]/60 focus:bg-white/[0.055] focus:ring-4 focus:ring-[#ff0a8a]/10";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { error: toastError } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("suspended") === "1") {
      toastError(
        "Account suspended",
        "Contact support if you think this is a mistake."
      );

      window.history.replaceState({}, "", "/login");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) {
        toastError("Couldn't sign in", authError.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);

      toastError(
        "Something went wrong",
        "Please try again in a moment."
      );

      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)]">
        {/* =========================================================
            LEFT — PRODUCT / BRAND EXPERIENCE
        ========================================================= */}
        <section className="relative hidden min-h-screen overflow-hidden border-r border-white/[0.07] lg:flex">
          {/* Subtle solid accent geometry */}
          <div className="pointer-events-none absolute left-[-140px] top-[15%] h-[280px] w-[280px] rounded-full border border-[#ff0a8a]/10" />

          <div className="pointer-events-none absolute bottom-[12%] right-[5%] h-[180px] w-[180px] rounded-full border border-[#2f80ff]/10" />

          <div className="relative z-10 flex w-full flex-col px-12 py-10 xl:px-16">
            {/* Brand */}
            <div className="flex items-center">
              <KoraLogo />

              <div className="ml-3">
                <div className="text-[15px] font-semibold tracking-[-0.02em]">
                  KoraSpace
                </div>
                <div className="text-[10px] text-white/35">
                  Marketing intelligence
                </div>
              </div>
            </div>

            {/* Main copy */}
            <div className="flex flex-1 items-center">
              <div className="w-full max-w-[680px]">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.06] px-3 py-1.5">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
                  <Sparkles className="h-3.5 w-3.5 text-[#ff0a8a]" />
                  <span className="text-[11px] font-medium text-[#ff7fba]">
                    Your marketing command center
                  </span>
                </div>

                <h1 className="max-w-[650px] font-display text-[48px] font-semibold leading-[1.02] tracking-[-0.045em] text-white xl:text-[58px]">
                  Turn your marketing
                  <span className="block text-[#ff0a8a]">
                    into momentum.
                  </span>
                </h1>

                <p className="mt-6 max-w-[570px] text-[15px] leading-7 text-white/45">
                  Manage campaigns, understand your audience, coordinate
                  content, and turn scattered marketing activity into one
                  intelligent workspace.
                </p>

                {/* Product preview */}
                <div className="mt-10 max-w-[620px]">
                  <ProductPreview />
                </div>

                {/* Bottom trust row */}
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-white/30">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#ff0a8a]" />
                    Campaign management
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#ff0a8a]" />
                    AI-powered intelligence
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#ff0a8a]" />
                    Multi-channel workflows
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/20">
                KoraSpace OS
              </span>

              <div className="flex items-center gap-5 text-[10px] text-white/25">
                <span>Secure workspace</span>
                <span>•</span>
                <span>Built for modern marketers</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            RIGHT — LOGIN
        ========================================================= */}
        <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
          {/* Mobile brand */}
          <div className="absolute left-5 top-7 flex items-center sm:left-8 lg:hidden">
            <KoraLogo />

            <span className="ml-2.5 text-sm font-semibold tracking-[-0.02em]">
              KoraSpace
            </span>
          </div>

          <div className="w-full max-w-[440px]">
            {/* Login header */}
            <div className="mb-8">
              <div className="mb-5 hidden items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#ff0a8a] sm:flex lg:hidden">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
                Marketing workspace
              </div>

              <h2 className="font-display text-[32px] font-semibold tracking-[-0.035em] text-white sm:text-[36px]">
                Welcome back
              </h2>

              <p className="mt-2.5 text-[14px] leading-6 text-white/40">
                Sign in to continue to your KoraSpace workspace.
              </p>
            </div>

            {/* Login panel */}
            <div className="rounded-2xl border border-white/[0.09] bg-[#181818] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-[12px] font-medium text-white/65"
                  >
                    Email address
                  </Label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputCls}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-[12px] font-medium text-white/65"
                    >
                      Password
                    </Label>

                    <Link
                      href="/reset-password"
                      className="text-[11px] font-medium text-[#ff4da6] transition-colors hover:text-[#ff7fba]"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`${inputCls} pr-12`}
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white/70"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff0a8a] text-[13px] font-semibold text-white transition-all hover:bg-[#ff299b] hover:shadow-[0_12px_35px_rgba(255,10,138,0.20)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Security / workspace hint */}
              <div className="mt-6 flex items-start gap-3 border-t border-white/[0.07] pt-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2f80ff]/15 bg-[#2f80ff]/[0.06]">
                  <Zap className="h-3.5 w-3.5 text-[#4f94ff]" />
                </div>

                <div>
                  <p className="text-[11px] font-medium text-white/60">
                    Your workspace is waiting.
                  </p>

                  <p className="mt-0.5 text-[10px] leading-5 text-white/30">
                    Access campaigns, analytics, content workflows, and
                    your connected marketing tools from one place.
                  </p>
                </div>
              </div>
            </div>

            {/* Signup */}
            <p className="mt-7 text-center text-[13px] text-white/35">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-[#ff4da6] transition-colors hover:text-[#ff7fba]"
              >
                Create your workspace
              </Link>
            </p>

            {/* Mobile feature row */}
            <div className="mt-10 grid grid-cols-3 gap-2 lg:hidden">
              <MobileFeature
                icon={BarChart3}
                label="Analytics"
              />

              <MobileFeature
                icon={Users}
                label="Audience"
              />

              <MobileFeature
                icon={TrendingUp}
                label="Growth"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ===============================================================
   BRAND LOGO
=============================================================== */

function KoraLogo() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff0a8a] shadow-[0_8px_25px_rgba(255,10,138,0.18)]">
      <div className="absolute h-4 w-4 rounded-[5px] border-[1.5px] border-white" />

      <div className="absolute h-1.5 w-1.5 rounded-full bg-white" />

      <div className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#2f80ff]" />
    </div>
  );
}

/* ===============================================================
   PRODUCT PREVIEW
=============================================================== */

function ProductPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#171717] shadow-[0_25px_70px_rgba(0,0,0,0.40)]">
      {/* Window header */}
      <div className="flex h-11 items-center justify-between border-b border-white/[0.07] px-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
          <span className="text-[8px] text-white/35">
            Marketing Command Center
          </span>
        </div>

        <div className="h-5 w-5 rounded-full border border-white/10 bg-white/[0.04]" />
      </div>

      <div className="grid grid-cols-[115px_1fr]">
        {/* Mini sidebar */}
        <div className="border-r border-white/[0.06] p-3">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-[#ff0a8a]" />
            <div className="h-2 w-12 rounded-full bg-white/15" />
          </div>

          <div className="space-y-1.5">
            <MiniNav active label="Overview" />
            <MiniNav label="Strategy" />
            <MiniNav label="Campaigns" />
            <MiniNav label="Analytics" />
            <MiniNav label="Audience" />
          </div>

          <div className="mt-7 border-t border-white/[0.06] pt-3">
            <MiniNav label="Integrations" />
            <MiniNav label="Settings" />
          </div>
        </div>

        {/* Dashboard */}
        <div className="min-w-0 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="h-2 w-28 rounded-full bg-white/20" />
              <div className="mt-2 h-1.5 w-40 rounded-full bg-white/[0.07]" />
            </div>

            <div className="h-6 w-20 rounded-lg bg-[#ff0a8a]/15" />
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-3 gap-2">
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

          {/* Chart */}
          <div className="mt-3 rounded-xl border border-white/[0.07] bg-[#141414] p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-1.5 w-20 rounded-full bg-white/15" />
                <div className="mt-1.5 h-1 w-12 rounded-full bg-white/[0.06]" />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
                <span className="text-[7px] text-white/25">
                  Performance
                </span>
              </div>
            </div>

            <div className="mt-4 flex h-[82px] items-end gap-1.5">
              {[24, 35, 29, 44, 40, 54, 48, 67, 58, 72, 64, 79].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-[3px] bg-white/[0.07]"
                    style={{ height: `${height}%` }}
                  />
                )
              )}
            </div>

            <div className="mt-2 h-px w-full bg-white/[0.05]" />
          </div>

          {/* Bottom row */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/[0.07] bg-[#141414] p-3">
              <div className="flex items-center justify-between">
                <div className="h-1.5 w-20 rounded-full bg-white/10" />
                <span className="h-4 w-4 rounded-md bg-[#ff0a8a]/10" />
              </div>

              <div className="mt-3 space-y-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2"
                  >
                    <span className="h-5 w-5 rounded-md bg-white/[0.06]" />
                    <span className="h-1.5 flex-1 rounded-full bg-white/[0.07]" />
                    <span className="h-1.5 w-6 rounded-full bg-[#ff0a8a]/20" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-[#141414] p-3">
              <div className="h-1.5 w-16 rounded-full bg-white/10" />

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="h-2.5 w-14 rounded-full bg-white/15" />
                  <div className="mt-1.5 h-1 w-20 rounded-full bg-white/[0.06]" />
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2f80ff]/20 bg-[#2f80ff]/[0.07]">
                  <TrendingUp className="h-4 w-4 text-[#4f94ff]" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-[#ff0a8a]/15" />
                <span className="h-1.5 w-5 rounded-full bg-white/[0.06]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   MINI NAV
=============================================================== */

function MiniNav({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={[
        "flex h-7 items-center rounded-md px-2 text-[8px]",
        active
          ? "border border-[#ff0a8a]/15 bg-[#ff0a8a]/[0.09] text-[#ff69ae]"
          : "text-white/25",
      ].join(" ")}
    >
      <span
        className={[
          "mr-2 h-1.5 w-1.5 rounded-sm",
          active ? "bg-[#ff0a8a]" : "bg-white/10",
        ].join(" ")}
      />

      {label}
    </div>
  );
}

/* ===============================================================
   MINI STAT
=============================================================== */

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
      ? "text-[#4f94ff]"
      : "text-[#35d399]";

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#141414] p-2.5">
      <div className="text-[7px] text-white/25">{label}</div>

      <div
        className={`mt-1.5 text-[13px] font-semibold ${accentClass}`}
      >
        {value}
      </div>

      <div className="mt-1 h-1 w-8 rounded-full bg-white/[0.06]" />
    </div>
  );
}

/* ===============================================================
   MOBILE FEATURES
=============================================================== */

function MobileFeature({
  icon: Icon,
  label,
}: {
  icon: typeof BarChart3;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-white/[0.07] bg-white/[0.025] px-2 py-3">
      <Icon className="h-4 w-4 text-[#ff4da6]" />

      <span className="mt-1.5 text-[9px] text-white/35">
        {label}
      </span>
    </div>
  );
}