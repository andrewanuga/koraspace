"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Copy,
  Check,
  LifeBuoy,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const errorId = error?.digest || "ERR_" + Math.abs(hashCode(error?.message || "unknown")).toString().slice(0, 10);

  useEffect(() => {
    console.error("Koraspace Runtime Error Caught:", error);
  }, [error]);

  const copyErrorId = () => {
    navigator.clipboard.writeText(errorId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      reset();
      setIsRetrying(false);
    }, 400);
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12 select-none"
      style={{ background: "#0b0c10", color: "#f3f4f6" }}
    >
      {/* Ambient background bloom */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-32 top-1/4 h-[480px] w-[480px] rounded-full opacity-20 blur-[130px]"
          style={{ background: "radial-gradient(circle, #f43f5e, transparent 70%)" }}
        />
        <div
          className="absolute -right-32 bottom-1/4 h-[450px] w-[450px] rounded-full opacity-15 blur-[130px]"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto w-full max-w-[540px] flex flex-col items-center">
        {/* Brand Header */}
        <Link href="/" className="group mb-8 flex items-center gap-2.5 transition">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Koraspace"
            width={28}
            height={25}
            className="h-7 w-auto transition-transform group-hover:scale-105"
          />
          <span className="font-display text-[18px] font-bold tracking-tight text-white">
            Kora<span className="text-blue-500">space</span>
          </span>
        </Link>

        {/* Main Glassmorphic Error Card */}
        <div className="relative w-full rounded-3xl border border-white/[0.08] bg-[#12131a]/80 p-8 text-center shadow-2xl backdrop-blur-2xl sm:p-10 space-y-6">
          {/* Glowing Alert Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.25)] animate-pulse">
            <AlertTriangle className="h-8 w-8 drop-shadow-md" />
          </div>

          {/* Heading & Explanation */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-rose-300 font-data">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              Runtime Exception
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Something went wrong
            </h1>
            <p className="mx-auto max-w-sm text-xs leading-relaxed text-white/60 sm:text-sm">
              An unexpected error occurred during rendering. Our automated telemetry has logged this incident. Your workspace data is completely safe.
            </p>
          </div>

          {/* Copyable Error ID Badge */}
          <div className="mx-auto flex w-fit items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-xs text-white/50 transition hover:border-white/15 hover:bg-white/[0.04]">
            <span className="font-data text-[11px] text-white/40">Error ID:</span>
            <code className="font-data font-semibold text-white/80">{errorId}</code>
            <button
              onClick={copyErrorId}
              className="ml-1 p-1 text-white/40 hover:text-white transition"
              title="Copy Error ID"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
              <span>Try again</span>
            </button>

            <Link
              href="/"
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
            >
              <Home className="h-4 w-4 text-white/50" />
              <span>Go home</span>
            </Link>
          </div>

          {/* Technical Diagnostics Collapsible */}
          {error?.message && (
            <div className="border-t border-white/[0.06] pt-4 text-left">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="flex w-full items-center justify-between text-xs font-medium text-white/40 hover:text-white/70 transition"
              >
                <span>Diagnostic details</span>
                {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showDetails && (
                <div className="mt-3 overflow-x-auto rounded-xl border border-white/[0.06] bg-black/50 p-3.5 font-data text-[11px] text-rose-300 leading-relaxed max-h-36 overflow-y-auto">
                  <p className="font-semibold text-rose-400 mb-1">{error.name || "Error"}:</p>
                  <p className="break-words">{error.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Support Cross-links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/40">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-white transition"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
          <span>•</span>
          <a
            href="mailto:support@koraspace.com"
            className="flex items-center gap-1.5 hover:text-white transition"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            <span>Contact Support Desk</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
