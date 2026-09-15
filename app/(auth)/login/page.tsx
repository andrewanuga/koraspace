"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  Loader2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const inputCls =
  "h-12 w-full rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#ff0a8a]/60 focus:bg-white/[0.055] focus:ring-4 focus:ring-[#ff0a8a]/10";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { error: toastError } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (searchParams.get("suspended") === "1") {
      toastError(
        "Account suspended",
        "Contact support if you think this is a mistake."
      );
      window.history.replaceState({}, "", "/login");
    }

    if (searchParams.get("error") === "auth_error") {
      toastError(
        "Authentication error",
        "Could not verify your credentials. Please sign in again."
      );
      window.history.replaceState({}, "", "/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

      const nextParam = searchParams.get("next");
      const safeNext =
        nextParam &&
        nextParam.startsWith("/") &&
        !nextParam.startsWith("//") &&
        !nextParam.startsWith("/\\") &&
        !nextParam.includes(":") &&
        !nextParam.includes("\\")
          ? nextParam
          : "/dashboard";

      router.push(safeNext);
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
    <div className="w-full max-w-[440px]">
      {/* Login header */}
      <div className="mb-7">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.06] px-3 py-1 text-[11px] font-medium text-[#ff7fba]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
          <span>{t.authPages.marketingSuite}</span>
        </div>

        <h2 className="font-display text-[30px] font-semibold tracking-[-0.035em] text-white sm:text-[34px]">
          {t.authPages.loginTitle}
        </h2>

        <p className="mt-2 text-[14px] leading-relaxed text-white/45">
          {t.authPages.loginSubtitle}
        </p>
      </div>

      {/* Login card */}
      <div className="rounded-2xl border border-white/[0.09] bg-[#181818] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.40)] sm:p-8">
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-[12px] font-medium text-white/70"
            >
              {t.authPages.emailLabel}
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
                className="text-[12px] font-medium text-white/70"
              >
                {t.authPages.passwordLabel}
              </Label>

              <Link
                href="/reset-password"
                className="text-[11.5px] font-medium text-[#ff4da6] transition-colors hover:text-[#ff7fba]"
              >
                {t.authPages.forgotPassword}
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
                  showPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.06] hover:text-white/80"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff0a8a] text-[13px] font-semibold text-white transition-all hover:bg-[#ff299b] hover:shadow-[0_12px_35px_rgba(255,10,138,0.22)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>{t.authPages.loginButton}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Security / workspace benefit */}
        <div className="mt-6 flex items-start gap-3 border-t border-white/[0.07] pt-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#3b82f6]/20 bg-[#3b82f6]/[0.08]">
            <Zap className="h-3.5 w-3.5 text-[#60a5fa]" />
          </div>

          <div>
            <p className="text-[11.5px] font-medium text-white/70">
              Instant workspace synchronization
            </p>
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-white/35">
              Access your campaigns, AI drafts, CRM leads, and multi-channel metrics securely.
            </p>
          </div>
        </div>
      </div>

      {/* Signup link */}
      <p className="mt-6 text-center text-[13px] text-white/40">
        {t.authPages.noAccount}{" "}
        <Link
          href="/signup"
          className="font-semibold text-[#ff4da6] transition-colors hover:text-[#ff7fba]"
        >
          {t.authPages.signupButton}
        </Link>
      </p>

      {/* Mobile feature strip */}
      <div className="mt-8 grid grid-cols-3 gap-2 lg:hidden">
        <MobileFeature icon={BarChart3} label="Analytics" />
        <MobileFeature icon={Users} label="Audience" />
        <MobileFeature icon={TrendingUp} label="Growth" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#ff0a8a]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function MobileFeature({
  icon: Icon,
  label,
}: {
  icon: typeof BarChart3;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-white/[0.07] bg-white/[0.025] px-2 py-3 text-center">
      <Icon className="h-4 w-4 text-[#ff4da6]" />
      <span className="mt-1.5 text-[9.5px] font-medium text-white/40">
        {label}
      </span>
    </div>
  );
}