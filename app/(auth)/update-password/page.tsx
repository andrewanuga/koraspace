"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

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

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();

  const handleUpdate = async (e: React.FormEvent) => {
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

    if (password !== confirmPassword) {
      toastError(
        "Passwords don't match",
        "Please ensure both password fields match."
      );
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toastError("Couldn't update password", error.message);
        setLoading(false);
        return;
      }

      toastSuccess(
        "Password updated",
        "Your password has been successfully reset. Redirecting..."
      );
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      toastError("Update failed", "Please try again in a few moments.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px]">
      {/* Header */}
      <div className="mb-7">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.06] px-3 py-1 text-[11px] font-medium text-[#ff7fba]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#ff0a8a]" />
          <span>Security & Credentials</span>
        </div>

        <h1 className="font-display text-[30px] font-semibold tracking-[-0.035em] text-white sm:text-[34px]">
          Set new password
        </h1>

        <p className="mt-2 text-[14px] leading-relaxed text-white/45">
          Choose a secure, strong password for your KoraSpace workspace.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/[0.09] bg-[#181818] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.40)] sm:p-8">
        <form onSubmit={handleUpdate} className="space-y-4">
          {/* New Password */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-[12px] font-medium text-white/70"
            >
              New password
            </Label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter new password"
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
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-[12px] font-medium text-white/70"
            >
              Confirm new password
            </Label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputCls}
            />
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
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Update password</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Back to login */}
      <p className="mt-6 text-center text-[13px] text-white/40">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#ff4da6] transition-colors hover:text-[#ff7fba]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
