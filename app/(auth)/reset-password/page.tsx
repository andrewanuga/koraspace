"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "flex h-12 w-full rounded-xl border border-white/[0.10] bg-white/[0.035] px-3.5 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus:border-[#ff0a8a]/60 focus:bg-white/[0.055] focus:outline-none focus:ring-4 focus:ring-[#ff0a8a]/10";

const recoverySteps = [
  {
    number: "01",
    title: "Enter your email",
    description: "Tell us which account you want to recover.",
  },
  {
    number: "02",
    title: "Check your inbox",
    description: "We'll send a secure password reset link.",
  },
  {
    number: "03",
    title: "Create a new password",
    description: "Choose a new password and get back to work.",
  },
];

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { error: toastError, success: toastSuccess } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toastError("Failed to send reset link", error.message);
        return;
      }

      toastSuccess(
        "Reset link sent",
        "Check your email for instructions."
      );

      setSuccess(true);
    } catch {
      toastError(
        "Something went wrong",
        "We couldn't send the reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">

        {/* ============================================================
            LEFT — RECOVERY / BRAND PANEL
        ============================================================ */}

        <aside className="relative hidden overflow-hidden border-r border-white/[0.08] lg:flex">
          <div className="flex w-full flex-col px-10 py-9 xl:px-14">

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

            {/* Main content */}
            <div className="my-auto max-w-[560px] py-14">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#55bfff]/20 bg-[#55bfff]/[0.06] px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#55bfff]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78caff]">
                  Secure account recovery
                </span>
              </div>

              <h2 className="font-display text-[clamp(3rem,4.8vw,5rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-white">
                Get back to
                <br />
                your{" "}
                <span className="text-[#ff0a8a]">
                  workspace.
                </span>
              </h2>

              <p className="mt-7 max-w-[490px] text-[15px] leading-7 text-white/45">
                Forgot your password? No problem. We'll help you
                securely regain access to your Koraspace workspace
                in just a few steps.
              </p>

              {/* Recovery steps */}
              <div className="mt-10 space-y-3">
                {recoverySteps.map((step, index) => (
                  <div
                    key={step.number}
                    className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-4 transition-colors hover:border-white/[0.11] hover:bg-white/[0.035]"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[10px] font-semibold ${
                        index === 0
                          ? "border-[#ff0a8a]/25 bg-[#ff0a8a]/[0.08] text-[#ff63b4]"
                          : "border-white/[0.08] bg-white/[0.025] text-white/30"
                      }`}
                    >
                      {step.number}
                    </div>

                    <div className="pt-0.5">
                      <div className="text-sm font-medium text-white/85">
                        {step.title}
                      </div>

                      <div className="mt-1 text-xs leading-5 text-white/30">
                        {step.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security panel */}
              <div className="mt-8 rounded-2xl border border-white/[0.07] bg-[#181818] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#55bfff]/[0.07]">
                    <KeyRound className="h-4 w-4 text-[#55bfff]" />
                  </div>

                  <div>
                    <div className="text-xs font-medium text-white/70">
                      Your account stays protected
                    </div>

                    <p className="mt-1 text-[11px] leading-5 text-white/30">
                      Password recovery links are sent directly to
                      your verified email address.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom status */}
            <div className="flex items-center justify-between border-t border-white/[0.07] pt-6">
              <div className="flex items-center gap-2 text-xs text-white/30">
                <span className="h-1.5 w-1.5 rounded-full bg-[#55bfff]" />
                Secure authentication
              </div>

              <div className="flex items-center gap-2 text-xs text-white/25">
                <Sparkles className="h-3.5 w-3.5 text-[#ff0a8a]/70" />
                Koraspace
              </div>
            </div>
          </div>
        </aside>

        {/* ============================================================
            RIGHT — RESET FORM
        ============================================================ */}

        <main className="relative flex min-h-screen flex-col">

          {/* Mobile header */}
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5 lg:hidden">
            <Link
              href="/"
              className="flex items-center gap-2.5"
            >
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
                      <KeyRound className="h-4 w-4 text-[#ff0a8a]" />
                    </div>

                    <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
                      Account recovery
                    </div>

                    <h1 className="font-display text-[34px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[38px]">
                      Reset your
                      <br />
                      <span className="text-white/45">
                        password.
                      </span>
                    </h1>

                    <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
                      Enter the email associated with your account
                      and we'll send you a secure reset link.
                    </p>
                  </div>

                  {/* Form */}
                  <div className="rounded-3xl border border-white/[0.08] bg-[#171717] p-6 shadow-[0_30px_100px_-50px_rgba(0,0,0,0.9)] sm:p-8">

                    <form
                      onSubmit={handleReset}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-xs font-medium text-white/65"
                        >
                          Email address
                        </Label>

                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

                          <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) =>
                              setEmail(e.target.value)
                            }
                            required
                            autoComplete="email"
                            className={`${inputCls} pl-10`}
                          />
                        </div>
                      </div>

                      {/* Helpful note */}
                      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#55bfff]/70" />

                          <p className="text-[11px] leading-5 text-white/30">
                            For your security, the reset link will
                            only be sent to the email associated
                            with your Koraspace account.
                          </p>
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff0a8a] text-sm font-semibold text-white shadow-[0_14px_35px_-14px_rgba(255,10,138,0.8)] transition-all duration-200 hover:bg-[#ff2b9c] hover:shadow-[0_18px_40px_-14px_rgba(255,10,138,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Send reset link
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Return to login */}
                  <div className="mt-7 text-center text-sm">
                    <span className="text-white/30">
                      Remember your password?
                    </span>{" "}
                    <Link
                      href="/login"
                      className="font-medium text-[#ff63b4] transition-colors hover:text-[#ff8bc8]"
                    >
                      Sign in
                    </Link>
                  </div>

                  {/* Security footer */}
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

                  {/* Success icon */}
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.08]">
                    <CheckCircle2 className="h-7 w-7 text-[#ff0a8a]" />
                  </div>

                  <div className="mt-7">
                    <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ff63b4]">
                      Email sent
                    </div>

                    <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-white">
                      Check your inbox
                    </h1>

                    <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/40">
                      We sent a password reset link to{" "}
                      <span className="font-medium text-white/75">
                        {email}
                      </span>
                      .
                    </p>
                  </div>

                  {/* Email card */}
                  <div className="mt-7 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#55bfff]/[0.08]">
                        <Mail className="h-4 w-4 text-[#55bfff]" />
                      </div>

                      <div>
                        <div className="text-xs font-medium text-white/70">
                          Password reset email sent
                        </div>

                        <p className="mt-1 text-[11px] leading-5 text-white/30">
                          Open the email and follow the link to
                          create a new password.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-7 space-y-3">
                    <Link
                      href="/login"
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff0a8a] text-sm font-semibold text-white transition-colors hover:bg-[#ff2b9c]"
                    >
                      Return to sign in
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setSuccess(false);
                        setEmail("");
                      }}
                      className="flex h-11 w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-sm font-medium text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white"
                    >
                      Use a different email
                    </button>
                  </div>

                  <p className="mt-6 text-[10px] leading-5 text-white/20">
                    Didn't receive the email? Check your spam folder
                    or try again with the correct email address.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop footer */}
          <div className="hidden items-center justify-center border-t border-white/[0.06] px-8 py-5 lg:flex">
            <div className="flex items-center gap-5 text-[10px] text-white/20">
              <span>
                © {new Date().getFullYear()} Koraspace
              </span>

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