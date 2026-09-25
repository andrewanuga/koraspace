"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { verifyEmailOtp, verifyEmailToken, resendVerificationEmail } from "@/app/(auth)/signup/actions";
import { emailOnlySchema } from "@/lib/validations/auth";

const inputCls =
  "h-12 w-full rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#ff0a8a]/60 focus:bg-white/[0.055] focus:ring-4 focus:ring-[#ff0a8a]/10";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const queryOtp = searchParams.get("otp");
  const queryEmail = searchParams.get("email") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">(
    token || (queryEmail && queryOtp) ? "loading" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [emailInput, setEmailInput] = useState(queryEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Auto-verify if parameters are present in URL
  useEffect(() => {
    let isMounted = true;

    async function autoVerify() {
      if (queryEmail && queryOtp) {
        try {
          const res = await verifyEmailOtp(queryEmail, queryOtp);
          if (!isMounted) return;
          if (res.error) {
            setStatus("error");
            setErrorMessage(res.error);
          } else {
            setStatus("success");
          }
        } catch {
          if (!isMounted) return;
          setStatus("error");
          setErrorMessage("Failed to verify code.");
        }
        return;
      }

      if (token) {
        try {
          const res = await verifyEmailToken(token);
          if (!isMounted) return;
          if (res.error) {
            setStatus("error");
            setErrorMessage(res.error);
            if (res.email) setEmailInput(res.email);
          } else {
            setStatus("success");
          }
        } catch {
          if (!isMounted) return;
          setStatus("error");
          setErrorMessage("Failed to verify link.");
        }
      }
    }

    if (token || (queryEmail && queryOtp)) {
      autoVerify();
    }

    return () => {
      isMounted = false;
    };
  }, [token, queryEmail, queryOtp]);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    if (digit && index === 5) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6 && emailInput.trim()) {
        handleManualSubmit(fullOtp);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);

    if (pasted.length === 6 && emailInput.trim()) {
      handleManualSubmit(pasted);
    } else {
      otpInputs.current[pasted.length]?.focus();
    }
  };

  const handleManualSubmit = async (codeToVerify?: string) => {
    const cleanEmail = emailInput.trim();
    const fullCode = codeToVerify || otp.join("");

    if (!cleanEmail) {
      toastError("Missing email", "Please enter your email address.");
      return;
    }

    if (fullCode.length !== 6) {
      toastError("Incomplete PIN", "Please enter all 6 digits of your verification code.");
      return;
    }

    setOtpVerifying(true);
    try {
      const res = await verifyEmailOtp(cleanEmail, fullCode);
      if (res.error) {
        toastError("Verification failed", res.error);
        setOtpVerifying(false);
        return;
      }

      setStatus("success");
      toastSuccess("Email Verified!", "Welcome to Koraspace.");
    } catch {
      toastError("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResend = async () => {
    const validation = emailOnlySchema.safeParse({ email: emailInput });
    if (!validation.success) {
      toastError("Invalid email", validation.error.errors[0]?.message || "Please enter a valid email address.");
      return;
    }

    if (resending || resendCountdown > 0) return;
    setResending(true);

    try {
      const res = await resendVerificationEmail(validation.data.email);
      if (res.error) {
        toastError("Couldn't send code", res.error);
      } else {
        toastSuccess("New code sent", "Check your inbox for the fresh 6-digit verification code.");
        setResendCountdown(30);
      }
    } catch {
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
            Verifying your code...
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            Please wait while we confirm your email and activate your Koraspace workspace.
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
            Your email has been confirmed. Your Koraspace workspace is active and ready for AI-powered social management.
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

      {/* 3. ERROR OR MANUAL ENTRY STATE */}
      {(status === "idle" || status === "error") && (
        <div className="rounded-2xl border border-white/[0.09] bg-[#181818] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.40)] sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff0a8a]/25 bg-[#ff0a8a]/[0.10]">
            {status === "error" ? (
              <AlertCircle className="h-8 w-8 text-amber-400" />
            ) : (
              <MailCheck className="h-8 w-8 text-[#ff0a8a]" />
            )}
          </div>

          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.06] px-3 py-1 text-[11px] font-medium text-[#ff7fba]">
            <Sparkles className="h-3.5 w-3.5 text-[#ff0a8a]" />
            <span>Email Verification</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-white">
            Enter 6-Digit PIN
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-white/55">
            {errorMessage ? (
              <span className="text-amber-300 font-medium">{errorMessage}</span>
            ) : (
              "Enter the 6-digit verification code sent to your email."
            )}
          </p>

          <div className="mt-7 space-y-5 text-left">
            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="verify-email" className="text-[12px] font-medium text-white/70">
                Your registered email
              </Label>
              <input
                id="verify-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputCls}
              />
            </div>

            {/* 6 Digit Inputs */}
            <div className="space-y-1.5 text-center">
              <Label className="text-[12px] font-medium text-white/70 block text-left">
                Verification Code
              </Label>
              <div className="flex justify-center gap-2 sm:gap-2.5 pt-1">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="h-12 w-10 rounded-xl border border-white/[0.12] bg-white/[0.04] text-center font-mono text-lg font-bold text-white outline-none transition-all focus:border-[#ff0a8a] focus:bg-white/[0.08] focus:ring-4 focus:ring-[#ff0a8a]/20 sm:h-13 sm:w-12 sm:text-xl"
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={() => handleManualSubmit()}
              disabled={otpVerifying || otp.join("").length !== 6 || !emailInput.trim()}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff0a8a] text-[13px] font-semibold text-white transition-all hover:bg-[#ff299b] hover:shadow-[0_12px_35px_rgba(255,10,138,0.22)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {otpVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying code...</span>
                </>
              ) : (
                <>
                  <span>Verify Code & Activate</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            {/* Resend button */}
            <div className="flex items-center justify-between border-t border-white/[0.07] pt-4 text-xs">
              <Link
                href="/login"
                className="text-white/40 transition-colors hover:text-white"
              >
                Back to Sign In
              </Link>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending || resendCountdown > 0 || !emailInput.trim()}
                className="font-medium text-[#ff4da6] transition-colors hover:text-[#ff7fba] disabled:cursor-not-allowed disabled:text-white/30"
              >
                {resending ? (
                  "Sending code..."
                ) : resendCountdown > 0 ? (
                  `Resend in ${resendCountdown}s`
                ) : (
                  "Resend 6-digit code"
                )}
              </button>
            </div>
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
