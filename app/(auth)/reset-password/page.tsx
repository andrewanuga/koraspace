"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  KeyRound,
  Loader2,
  MailCheck,
  Sparkles,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "h-12 w-full rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#ff0a8a]/60 focus:bg-white/[0.055] focus:ring-4 focus:ring-[#ff0a8a]/10";

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
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toastError("Failed to send reset link", error.message);
        setLoading(false);
        return;
      }

      toastSuccess("Reset link sent", "Check your email for recovery instructions.");
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toastError("Request failed", "Please try again in a few moments.");
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
            Check your inbox
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-white/55">
            We sent a secure password recovery link to{" "}
            <span className="font-semibold text-white">{email}</span>. Click the link to set a new password.
          </p>

          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff0a8a] px-6 text-xs font-semibold text-white transition-all hover:bg-[#ff299b] hover:shadow-[0_8px_25px_rgba(255,10,138,0.20)]"
            >
              <span>Return to sign in</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px]">
      {/* Header */}
      <div className="mb-7">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.06] px-3 py-1 text-[11px] font-medium text-[#ff7fba]">
          <KeyRound className="h-3.5 w-3.5 text-[#ff0a8a]" />
          <span>Account Recovery</span>
        </div>

        <h1 className="font-display text-[30px] font-semibold tracking-[-0.035em] text-white sm:text-[34px]">
          Reset your password
        </h1>

        <p className="mt-2 text-[14px] leading-relaxed text-white/45">
          Enter your registered email address and we&apos;ll send you a recovery link.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/[0.09] bg-[#181818] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.40)] sm:p-8">
        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[12px] font-medium text-white/70">
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

          <button
            type="submit"
            disabled={loading}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff0a8a] text-[13px] font-semibold text-white transition-all hover:bg-[#ff299b] hover:shadow-[0_12px_35px_rgba(255,10,138,0.22)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending recovery link...</span>
              </>
            ) : (
              <>
                <span>Send recovery link</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-white/[0.07] pt-5">
          <p className="text-[11px] leading-relaxed text-white/35">
            Tip: If you don&apos;t receive the email within a few minutes, check your spam or promotions folder.
          </p>
        </div>
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
