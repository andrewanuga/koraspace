"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Check,
  MailCheck,
  Sparkles,
  BarChart3,
  Users,
  CalendarDays,
  ShieldCheck,
  Zap,
  Command,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const PASSWORD_REQUIREMENTS = [
  {
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    label: "Contains a number",
    test: (p: string) => /\d/.test(p),
  },
  {
    label: "Contains a special character",
    test: (p: string) => /[!@#$%^&*]/.test(p),
  },
];

const inputCls =
  "flex h-12 w-full rounded-xl border border-white/[0.10] bg-white/[0.035] px-3.5 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-[#ff0a8a]/60 focus:bg-white/[0.055] focus:outline-none focus:ring-4 focus:ring-[#ff0a8a]/10";

const features = [
  {
    icon: Sparkles,
    title: "AI-powered content",
    description: "Turn ideas into high-performing content faster.",
  },
  {
    icon: BarChart3,
    title: "One command center",
    description: "Plan, publish and measure your entire strategy.",
  },
  {
    icon: Users,
    title: "Creator + marketer",
    description: "Build your brand or manage growth from one workspace.",
  },
];

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { error: toastError, success: toastSuccess } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        toastError("Couldn't create account", authError.message);
        setLoading(false);
        return;
      }

      toastSuccess(
        "Account created",
        "Check your email to confirm your account."
      );

      setSuccess(true);
    } catch {
      toastError(
        "Something went wrong",
        "We couldn't create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        toastError("Google sign-in failed", authError.message);
        setLoading(false);
      }
    } catch {
      toastError(
        "Something went wrong",
        "We couldn't continue with Google."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">

        {/* ============================================================
            LEFT — BRAND / PRODUCT PANEL
        ============================================================ */}

        <aside className="relative hidden overflow-hidden border-r border-white/[0.08] lg:flex">
          <div className="relative flex w-full flex-col px-10 py-9 xl:px-14">

            {/* Brand */}
            <Link
              href="/"
              className="group inline-flex w-fit items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff0a8a] shadow-[0_12px_40px_-14px_rgba(255,10,138,0.9)]">
                <span className="text-lg font-black tracking-[-0.08em] text-white">
                  K
                </span>
              </div>

              <div>
                <div className="font-display text-[17px] font-semibold tracking-[-0.03em]">
                  koraspace
                </div>
                <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
                  Growth workspace
                </div>
              </div>
            </Link>

            {/* Main message */}
            <div className="my-auto max-w-[600px] py-14">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.07] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff0a8a] shadow-[0_0_10px_rgba(255,10,138,0.8)]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ff63b4]">
                  Your growth workspace
                </span>
              </div>

              <h2 className="font-display text-[clamp(3rem,4.8vw,5rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-white">
                Build your
                <br />

                <span className="text-[#ff0a8a]">
                  space to grow.
                </span>
              </h2>

              <p className="mt-7 max-w-[500px] text-[15px] leading-7 text-white/50">
                Koraspace brings content, audience growth, campaigns,
                analytics and AI into one focused workspace built for
                creators and modern marketing teams.
              </p>

              {/* Feature list */}
              <div className="mt-10 space-y-3">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3.5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035]">
                        <Icon className="h-4 w-4 text-[#ff0a8a]" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white/90">
                          {feature.title}
                        </div>

                        <div className="mt-0.5 text-xs text-white/35">
                          {feature.description}
                        </div>
                      </div>

                      <ArrowRight className="ml-auto h-4 w-4 text-white/15 transition-transform group-hover:translate-x-0.5 group-hover:text-white/35" />
                    </div>
                  );
                })}
              </div>

              {/* Mini workspace preview */}
              <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#181818] shadow-2xl">

                {/* Fake window header */}
                <div className="flex h-10 items-center border-b border-white/[0.07] px-4">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-white/10" />
                    <span className="h-2 w-2 rounded-full bg-white/10" />
                    <span className="h-2 w-2 rounded-full bg-white/10" />
                  </div>

                  <div className="mx-auto flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-1">
                    <Command className="h-3 w-3 text-white/25" />
                    <span className="text-[9px] text-white/25">
                      koraspace / overview
                    </span>
                  </div>

                  <div className="w-12" />
                </div>

                {/* Fake dashboard */}
                <div className="grid grid-cols-[90px_1fr]">
                  <div className="border-r border-white/[0.06] p-3">
                    <div className="mb-5 h-5 w-5 rounded-md bg-[#ff0a8a]/20" />

                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className={`mb-3 h-2.5 rounded-full ${
                          item === 1
                            ? "w-12 bg-[#ff0a8a]/70"
                            : "w-10 bg-white/[0.07]"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-2.5 w-24 rounded-full bg-white/15" />
                        <div className="mt-2 h-2 w-16 rounded-full bg-white/[0.06]" />
                      </div>

                      <div className="h-7 w-20 rounded-lg bg-[#ff0a8a]" />
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                        >
                          <div className="h-1.5 w-10 rounded-full bg-white/10" />
                          <div className="mt-3 h-3 w-14 rounded-full bg-white/20" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 h-24 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <div className="flex h-full items-end gap-1">
                        {[35, 50, 38, 65, 48, 72, 58, 82, 68, 90].map(
                          (height, index) => (
                            <div
                              key={index}
                              className="flex-1 rounded-sm bg-[#ff0a8a]/30"
                              style={{ height: `${height}%` }}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom trust row */}
            <div className="flex items-center justify-between border-t border-white/[0.07] pt-6">
              <div className="flex items-center gap-2 text-xs text-white/30">
                <ShieldCheck className="h-4 w-4 text-[#55bfff]" />
                Secure workspace
              </div>

              <div className="flex items-center gap-2 text-xs text-white/25">
                <Zap className="h-3.5 w-3.5 text-[#55bfff]" />
                Built for modern teams
              </div>
            </div>
          </div>
        </aside>

        {/* ============================================================
            RIGHT — SIGNUP
        ============================================================ */}

        <main className="relative flex min-h-screen flex-col">

          {/* Mobile brand */}
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff0a8a]">
                <span className="font-black tracking-[-0.08em] text-white">
                  K
                </span>
              </div>

              <span className="font-display text-base font-semibold">
                koraspace
              </span>
            </Link>

            <Link
              href="/login"
              className="text-xs font-medium text-white/45 transition-colors hover:text-white"
            >
              Sign in
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
            <div className="w-full max-w-[470px]">

              {!success ? (
                <>
                  {/* Header */}
                  <div className="mb-8">
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.08] lg:hidden">
                      <Sparkles className="h-4 w-4 text-[#ff0a8a]" />
                    </div>

                    <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
                      Create your workspace
                    </div>

                    <h1 className="font-display text-[34px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[38px]">
                      Start building
                      <br />
                      <span className="text-white/45">
                        your Koraspace.
                      </span>
                    </h1>

                    <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
                      Create your account and get access to your
                      personalized growth workspace.
                    </p>
                  </div>

                  {/* Form surface */}
                  <div className="rounded-3xl border border-white/[0.08] bg-[#171717] p-6 shadow-[0_30px_100px_-50px_rgba(0,0,0,0.9)] sm:p-8">

                    {/* Optional Google button */}
                    {/*
                    <button
                      type="button"
                      onClick={handleGoogleSignup}
                      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/[0.10] bg-white/[0.035] text-sm font-medium text-white transition-all hover:border-white/[0.16] hover:bg-white/[0.06]"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        ...
                      </svg>
                      Continue with Google
                    </button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/[0.07]" />
                      </div>

                      <div className="relative flex justify-center">
                        <span className="bg-[#171717] px-3 text-[10px] uppercase tracking-widest text-white/25">
                          or continue with email
                        </span>
                      </div>
                    </div>
                    */}

                    <form
                      onSubmit={handleSignup}
                      className="space-y-5"
                    >
                      {/* Name */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-xs font-medium text-white/65"
                        >
                          Full name
                        </Label>

                        <input
                          id="name"
                          type="text"
                          placeholder="Your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          autoComplete="name"
                          className={inputCls}
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-xs font-medium text-white/65"
                        >
                          Email address
                        </Label>

                        <input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className={inputCls}
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="password"
                            className="text-xs font-medium text-white/65"
                          >
                            Password
                          </Label>

                          <span className="text-[10px] text-white/25">
                            Keep it secure
                          </span>
                        </div>

                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) =>
                              setPassword(e.target.value)
                            }
                            required
                            autoComplete="new-password"
                            className={`${inputCls} pr-11`}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword((value) => !value)
                            }
                            aria-label={
                              showPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white/70"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {/* Password requirements */}
                        {password && (
                          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">
                              Password strength
                            </div>

                            <div className="space-y-2">
                              {PASSWORD_REQUIREMENTS.map(
                                (req) => {
                                  const ok = req.test(password);

                                  return (
                                    <div
                                      key={req.label}
                                      className="flex items-center gap-2"
                                    >
                                      <div
                                        className={`flex h-4 w-4 items-center justify-center rounded-full transition-all ${
                                          ok
                                            ? "bg-[#ff0a8a]"
                                            : "border border-white/[0.14] bg-white/[0.035]"
                                        }`}
                                      >
                                        {ok && (
                                          <Check className="h-2.5 w-2.5 text-white" />
                                        )}
                                      </div>

                                      <span
                                        className={`text-[11px] transition-colors ${
                                          ok
                                            ? "text-white/65"
                                            : "text-white/30"
                                        }`}
                                      >
                                        {req.label}
                                      </span>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#ff0a8a] text-sm font-semibold text-white shadow-[0_14px_35px_-14px_rgba(255,10,138,0.8)] transition-all duration-200 hover:bg-[#ff2b9c] hover:shadow-[0_18px_40px_-14px_rgba(255,10,138,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Create account
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Terms */}
                    <p className="mt-5 text-center text-[11px] leading-5 text-white/30">
                      By creating an account, you agree to our{" "}
                      <Link
                        href="/terms"
                        className="text-white/55 underline decoration-white/15 underline-offset-2 transition-colors hover:text-[#ff63b4]"
                      >
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-white/55 underline decoration-white/15 underline-offset-2 transition-colors hover:text-[#ff63b4]"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>

                  {/* Desktop sign in */}
                  <div className="mt-7 hidden items-center justify-center gap-2 text-sm lg:flex">
                    <span className="text-white/30">
                      Already have an account?
                    </span>

                    <Link
                      href="/login"
                      className="font-medium text-[#ff63b4] transition-colors hover:text-[#ff8bc8]"
                    >
                      Sign in
                    </Link>
                  </div>

                  {/* Security */}
                  <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.13em] text-white/20">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#55bfff]/60" />
                    Secure authentication
                  </div>
                </>
              ) : (
                /* ========================================================
                   SUCCESS STATE
                ======================================================== */

                <div className="rounded-3xl border border-white/[0.08] bg-[#171717] p-7 text-center shadow-[0_30px_100px_-50px_rgba(0,0,0,0.9)] sm:p-10">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.08]">
                    <MailCheck className="h-7 w-7 text-[#ff0a8a]" />
                  </div>

                  <div className="mt-7">
                    <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ff63b4]">
                      Almost there
                    </div>

                    <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-white">
                      Check your email
                    </h1>

                    <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/40">
                      We sent a confirmation link to{" "}
                      <span className="font-medium text-white/75">
                        {email}
                      </span>
                      .
                    </p>
                  </div>

                  {/* Email status */}
                  <div className="mt-7 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#55bfff]/[0.08]">
                        <MailCheck className="h-4 w-4 text-[#55bfff]" />
                      </div>

                      <div>
                        <div className="text-xs font-medium text-white/70">
                          Confirmation email sent
                        </div>

                        <div className="mt-1 text-[11px] leading-5 text-white/30">
                          Open the email and click the confirmation
                          link to activate your Koraspace account.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff0a8a] text-sm font-semibold text-white transition-colors hover:bg-[#ff2b9c]"
                    >
                      Continue to sign in
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/"
                      className="flex h-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-sm font-medium text-white/55 transition-colors hover:bg-white/[0.05] hover:text-white"
                    >
                      Back to Koraspace
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop footer */}
          <div className="hidden items-center justify-center border-t border-white/[0.06] px-8 py-5 lg:flex">
            <div className="flex items-center gap-5 text-[10px] text-white/20">
              <span>© {new Date().getFullYear()} Koraspace</span>

              <span className="h-1 w-1 rounded-full bg-white/10" />

              <Link
                href="/privacy"
                className="transition-colors hover:text-white/45"
              >
                Privacy
              </Link>

              <Link
                href="/terms"
                className="transition-colors hover:text-white/45"
              >
                Terms
              </Link>

              <span className="h-1 w-1 rounded-full bg-white/10" />

              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#55bfff]" />
                Systems operational
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}