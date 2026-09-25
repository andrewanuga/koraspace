"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  RotateCw,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { registerUser, resendVerificationEmail, verifyEmailOtp } from "./actions";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import {
  signupSchema,
  EMAIL_REGEX,
  PASSWORD_NUMBER_REGEX,
  PASSWORD_SPECIAL_CHAR_REGEX,
} from "@/lib/validations/auth";

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => PASSWORD_NUMBER_REGEX.test(p) },
  {
    label: "Contains a special character (!@#$%^&*)",
    test: (p: string) => PASSWORD_SPECIAL_CHAR_REGEX.test(p),
  },
];

const inputCls =
  "h-12 w-full rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#ff0a8a]/60 focus:bg-white/[0.055] focus:ring-4 focus:ring-[#ff0a8a]/10";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");

  // OTP State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendCountdown]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side Zod and Regex input validation & sanitization
    const validation = signupSchema.safeParse({ name, email, password });
    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Please check your input.";
      toastError("Validation Error", firstError);
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const res = await registerUser(validation.data.email, validation.data.password, validation.data.name);

      if (res.error) {
        toastError("Couldn't create account", res.error);
        setLoading(false);
        return;
      }

      toastSuccess("Account created", "We sent a 6-digit verification code to your email.");
      setStep("otp");
      setResendCountdown(30);
      setLoading(false);

      // Focus first OTP box
      setTimeout(() => {
        otpInputs.current[0]?.focus();
      }, 100);
    } catch (err) {
      console.error(err);
      toastError("Signup failed", "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto advance
    if (digit && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    if (digit && index === 5) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6) {
        submitOtp(fullOtp);
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

    if (pasted.length === 6) {
      submitOtp(pasted);
    } else {
      otpInputs.current[pasted.length]?.focus();
    }
  };

  const submitOtp = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || otp.join("");
    if (fullCode.length !== 6) {
      toastError("Incomplete Code", "Please enter all 6 digits.");
      return;
    }

    if (otpVerifying) return;
    setOtpVerifying(true);

    try {
      const res = await verifyEmailOtp(email, fullCode);
      if (res.error) {
        toastError("Verification failed", res.error);
        setOtpVerifying(false);
        return;
      }

      setOtpSuccess(true);
      toastSuccess("Email Verified!", "Welcome to Koraspace.");
      setTimeout(() => {
        router.push("/login?verified=1");
      }, 1500);
    } catch (err) {
      toastError("Error", "An unexpected error occurred. Please try again.");
      setOtpVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resending || resendCountdown > 0 || !email) return;
    setResending(true);
    try {
      const res = await resendVerificationEmail(email);
      if (res.error) {
        toastError("Couldn't resend", res.error);
      } else {
        toastSuccess("New code sent", "Please check your inbox.");
        setResendCountdown(30);
      }
    } catch (err) {
      toastError("Failed to resend", "Please try again shortly.");
    } finally {
      setResending(false);
    }
  };

  // =========================================================================
  // STEP 2: OTP VERIFICATION VIEW
  // =========================================================================
  if (step === "otp") {
    return (
      <div className="w-full max-w-[440px]">
        <div className="rounded-2xl border border-white/[0.09] bg-[#181818] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.40)] sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff0a8a]/25 bg-[#ff0a8a]/[0.10]">
            {otpSuccess ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            ) : (
              <MailCheck className="h-8 w-8 text-[#ff0a8a]" />
            )}
          </div>

          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.06] px-3 py-1 text-[11px] font-medium text-[#ff7fba]">
            <Sparkles className="h-3.5 w-3.5 text-[#ff0a8a]" />
            <span>{otpSuccess ? "Account Activated" : "Security Verification"}</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            {otpSuccess ? "Email Verified!" : "Enter 6-Digit PIN"}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-white/60">
            {otpSuccess ? (
              "Redirecting you to sign in..."
            ) : (
              <>
                We sent a 6-digit verification code to{" "}
                <span className="font-semibold text-white">{email}</span>.
              </>
            )}
          </p>

          {!otpSuccess && (
            <div className="mt-8 space-y-6">
              {/* 6 Digit Input Group */}
              <div className="flex justify-center gap-2 sm:gap-2.5">
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
                    className="h-13 w-11 rounded-xl border border-white/[0.12] bg-white/[0.04] text-center font-mono text-xl font-bold text-white outline-none transition-all focus:border-[#ff0a8a] focus:bg-white/[0.08] focus:ring-4 focus:ring-[#ff0a8a]/20 sm:h-14 sm:w-13 sm:text-2xl"
                  />
                ))}
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={() => submitOtp()}
                disabled={otpVerifying || otp.join("").length !== 6}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff0a8a] text-[13px] font-semibold text-white transition-all hover:bg-[#ff299b] hover:shadow-[0_12px_35px_rgba(255,10,138,0.22)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {otpVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              {/* Resend Action */}
              <div className="flex items-center justify-between border-t border-white/[0.07] pt-4 text-xs">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="inline-flex items-center gap-1 text-white/40 transition-colors hover:text-white"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Change email</span>
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || resendCountdown > 0}
                  className="font-medium text-[#ff4da6] transition-colors hover:text-[#ff7fba] disabled:cursor-not-allowed disabled:text-white/30"
                >
                  {resending ? (
                    "Sending code..."
                  ) : resendCountdown > 0 ? (
                    `Resend code in ${resendCountdown}s`
                  ) : (
                    "Resend code"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEP 1: SIGNUP FORM VIEW
  // =========================================================================
  return (
    <div className="w-full max-w-[440px]">
      {/* Signup header */}
      <div className="mb-7">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.06] px-3 py-1 text-[11px] font-medium text-[#ff7fba]">
          <Sparkles className="h-3.5 w-3.5 text-[#ff0a8a]" />
          <span>{t.authPages.marketingSuite}</span>
        </div>

        <h1 className="font-display text-[30px] font-semibold tracking-[-0.035em] text-white sm:text-[34px]">
          {t.authPages.signupTitle}
        </h1>

        <p className="mt-2 text-[14px] leading-relaxed text-white/45">
          {t.authPages.signupSubtitle}
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-white/[0.09] bg-[#181818] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.40)] sm:p-8">
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[12px] font-medium text-white/70">
              {t.authPages.nameLabel}
            </Label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[12px] font-medium text-white/70">
              {t.authPages.emailLabel}
            </Label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[12px] font-medium text-white/70">
              {t.authPages.passwordLabel}
            </Label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${inputCls} pr-12`}
              />

              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((curr) => !curr)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.06] hover:text-white/80"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Live checklist */}
            {password.length > 0 && (
              <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-1.5">
                {PASSWORD_REQUIREMENTS.map((req, i) => {
                  const passed = req.test(password);
                  return (
                    <div key={i} className="flex items-center gap-2 text-[11.5px]">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full transition-all ${
                          passed
                            ? "bg-[#34d399] text-black"
                            : "bg-white/[0.08] text-white/30"
                        }`}
                      >
                        {passed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span
                        className={
                          passed ? "font-medium text-[#34d399]" : "text-white/40"
                        }
                      >
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff0a8a] text-[13px] font-semibold text-white transition-all hover:bg-[#ff299b] hover:shadow-[0_12px_35px_rgba(255,10,138,0.22)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating workspace...</span>
                </>
              ) : (
                <>
                  <span>{t.authPages.signupButton}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Terms notice */}
        <p className="mt-5 text-center text-[11px] leading-relaxed text-white/35">
          By continuing, you agree to KoraSpace&apos;s{" "}
          <Link href="/terms" className="text-white/60 hover:text-white underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-white/60 hover:text-white underline">
            Privacy Policy
          </Link>.
        </p>
      </div>

      {/* Login link */}
      <p className="mt-6 text-center text-[13px] text-white/40">
        {t.authPages.haveAccount}{" "}
        <Link
          href="/login"
          className="font-semibold text-[#ff4da6] transition-colors hover:text-[#ff7fba]"
        >
          {t.authPages.loginButton}
        </Link>
      </p>
    </div>
  );
}
