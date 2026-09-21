"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { registerUser } from "./actions";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  {
    label: "Contains a special character (!@#$%^&*)",
    test: (p: string) => /[!@#$%^&*]/.test(p),
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
  const [success, setSuccess] = useState(false);

  const { error: toastError, success: toastSuccess } = useToast();
  const { t } = useLanguage();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const isPasswordValid = PASSWORD_REQUIREMENTS.every((req) =>
      req.test(password)
    );
    if (!isPasswordValid) {
      toastError(
        "Weak password",
        "Please meet all password requirements before continuing."
      );
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const res = await registerUser(email, password, name);

      if (res.error) {
        toastError("Couldn't create account", res.error);
        setLoading(false);
        return;
      }

      toastSuccess("Account created", "You can now sign in.");
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toastError("Signup failed", "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-[440px] text-center">
        <div className="rounded-2xl border border-white/[0.09] bg-[#181818] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.40)] sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff0a8a]/25 bg-[#ff0a8a]/[0.10]">
            <MailCheck className="h-8 w-8 text-[#ff0a8a]" />
          </div>

          <h2 className="font-display text-2xl font-semibold text-white">
            Workspace Created!
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Your Koraspace account is ready and an activation email was sent to{" "}
            <span className="font-semibold text-white">{email}</span>. You can now sign in immediately to launch your workspace.
          </p>

          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff0a8a] px-6 text-xs font-semibold text-white transition-all hover:bg-[#ff299b] hover:shadow-[0_8px_25px_rgba(255,10,138,0.20)]"
            >
              <span>Sign in to your workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
