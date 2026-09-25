"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MailCheck,
  RotateCw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { verifyEmailToken, resendVerificationEmail } from "@/app/(auth)/signup/actions";
import { emailOnlySchema } from "@/lib/validations/auth";

const inputCls =
  "h-12 w-full rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#ff0a8a]/60 focus:bg-white/[0.055] focus:ring-4 focus:ring-[#ff0a8a]/10";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const queryEmail = searchParams.get("email") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">(
    token ? "loading" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [emailInput, setEmailInput] = useState(queryEmail);
  const [resending, setResending] = useState(false);
  const [resendSuccessMsg, setResendSuccessMsg] = useState("");

  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    if (!token) {
      setStatus("idle");
      return;
    }

    let isMounted = true;

    async function doVerify() {
      try {
        const res = await verifyEmailToken(token as string);
        if (!isMounted) return;

        if (res.error) {
          setStatus("error");
          setErrorMessage(res.error);
          if (res.email) {
            setEmailInput(res.email);
          }
        } else {
          setStatus("success");
          if (res.email) {
            setEmailInput(res.email);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage("An unexpected error occurred during verification.");
      }
    }

    doVerify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const validation = emailOnlySchema.safeParse({ email: emailInput });
    if (!validation.success) {
      toastError("Invalid email", validation.error.errors[0]?.message || "Please enter a valid email address.");
      return;
    }

    if (resending) return;
    setResending(true);
    setResendSuccessMsg("");

    try {
      const res = await resendVerificationEmail(validation.data.email);
      if (res.error) {
        toastError("Couldn't send link", res.error);
      } else {
        toastSuccess("Verification link sent", "Check your inbox for the fresh activation link.");
        setResendSuccessMsg("A new verification link was sent to your email.");
      }
    } catch (err) {
      toastError("Failed to send", "Please try again in a few moments.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-[460px]">
      {/* 1. VERIFYING STATE */}
      {status === "loading" && (
        <div className="rounded-2xl border border-white/[0.09] bg-[#181818] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.40)] sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff0a8a]/25 bg-[#ff0a8a]/[0.10]">
            <Loader2 className="h-8 w-8 animate-spin text-[#ff0a8a]" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-white">
            Verifying your email...
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            Please wait while we confirm your email address and activate your Koraspace workspace.
          </p>
        </div>
      )}

      {/* 2. SUCCESS STATE */}
      {status === "success" && (
        <div className="rounded-2xl border border-white/[0.09] bg-[#181818] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.40)] sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.10]">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>

          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1 text-[11px] font-medium text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Email Verified</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            Account Activated!
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Your email has been confirmed. Your Koraspace workspace is active and ready for AI-powered multi-platform management.
          </p>

          <div className="mt-8">
            <Link
              href="/login?verified=1"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff0a8a] px-6 text-sm font-semibold text-white transition-all hover:bg-[#ff299b] hover:shadow-[0_8px_25px_rgba(255,10,138,0.25)]"
            >
              <span>Sign In to Your Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. ERROR OR EXPIRED STATE */}
      {status === "error" && (
        <div className="rounded-2xl border border-white/[0.09] bg-[#181818] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.40)] sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/[0.10]">
            <AlertCircle className="h-8 w-8 text-amber-400" />
          </div>

          <h2 className="font-display text-2xl font-semibold text-white">
            Verification Link Issue
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-white/55">
            {errorMessage ||
              "This verification link is invalid, expired, or has already been used."}
          </p>

          {/* Resend Form */}
          <form onSubmit={handleResend} className="mt-6 space-y-3 text-left">
            <Label htmlFor="resend-email" className="text-[12px] font-medium text-white/70">
              Enter your email to get a new link
            </Label>
            <input
              id="resend-email"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              required
              className={inputCls}
            />

            <button
              type="submit"
              disabled={resending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#ff0a8a] text-xs font-semibold text-white transition-all hover:bg-[#ff299b] disabled:opacity-60"
            >
              {resending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Sending fresh link...</span>
                </>
              ) : (
                <>
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>
          </form>

          {resendSuccessMsg && (
            <p className="mt-3 text-xs text-emerald-400">{resendSuccessMsg}</p>
          )}

          <div className="mt-6 border-t border-white/[0.08] pt-4">
            <Link
              href="/login"
              className="text-xs font-medium text-white/45 transition-colors hover:text-white"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      )}

      {/* 4. IDLE STATE (Landing directly to verify or resend) */}
      {status === "idle" && (
        <div className="rounded-2xl border border-white/[0.09] bg-[#181818] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.40)] sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff0a8a]/25 bg-[#ff0a8a]/[0.10]">
            <MailCheck className="h-8 w-8 text-[#ff0a8a]" />
          </div>

          <div className="text-center">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.06] px-3 py-1 text-[11px] font-medium text-[#ff7fba]">
              <Sparkles className="h-3.5 w-3.5 text-[#ff0a8a]" />
              <span>Email Verification</span>
            </div>

            <h2 className="font-display text-2xl font-semibold text-white">
              Verify your email
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-white/55">
              Check your inbox for an activation email from Koraspace. Click the link inside to verify your account.
            </p>
          </div>

          <form onSubmit={handleResend} className="mt-7 space-y-3">
            <Label htmlFor="idle-email" className="text-[12px] font-medium text-white/70">
              Didn&apos;t get the email? Request another:
            </Label>
            <input
              id="idle-email"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@company.com"
              required
              className={inputCls}
            />

            <button
              type="submit"
              disabled={resending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white/[0.06] border border-white/[0.12] text-xs font-semibold text-white transition-all hover:bg-white/[0.10] disabled:opacity-60"
            >
              {resending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Sending link...</span>
                </>
              ) : (
                <>
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>
          </form>

          {resendSuccessMsg && (
            <p className="mt-3 text-center text-xs text-emerald-400">{resendSuccessMsg}</p>
          )}

          <div className="mt-8 border-t border-white/[0.08] pt-5 text-center">
            <Link
              href="/login"
              className="text-xs font-medium text-white/45 transition-colors hover:text-white"
            >
              Already verified? <span className="text-[#ff4da6]">Sign in</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-40 w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#ff0a8a]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
