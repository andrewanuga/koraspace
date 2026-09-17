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
  ServerCrash,
} from "lucide-react";
import { GlassCard, PrimaryButton } from "@/components/dashboard/ui";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const errorId = error?.digest || "ERR_" + Math.abs(hashCode(error?.message || "dashboard")).toString().slice(0, 10);

  useEffect(() => {
    console.error("Dashboard caught error:", error);
  }, [error]);

  const copyErrorId = () => {
    navigator.clipboard.writeText(errorId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      reset();
      setIsRetrying(false);
    }, 350);
  };

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 py-8 text-center select-none">
      <GlassCard className="relative mx-auto w-full max-w-[480px] overflow-hidden p-8 sm:p-10 text-center shadow-2xl border border-white/[0.08] bg-[#12131a]/80 backdrop-blur-2xl space-y-6">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-32 w-full rounded-full bg-rose-500/10 blur-[60px]" />

        {/* Icon */}
        <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.2)] animate-pulse">
          <ServerCrash className="h-8 w-8 drop-shadow-md" />
        </div>

        {/* Text */}
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-rose-300 font-data">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Workspace Interruption
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">
            Workspace Interrupted
          </h2>
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-white/60">
            We encountered an issue loading this section. Your settings, campaigns, and scheduled posts are safely stored.
          </p>
        </div>

        {/* Error ID badge */}
        <div className="relative z-10 mx-auto flex w-fit items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-xs text-white/50 transition hover:border-white/15">
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

        {/* Actions */}
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Home className="h-4 w-4 text-white/50" />
            <span>Dashboard Home</span>
          </Link>
        </div>

        {/* Collapsible Diagnostics */}
        {error?.message && (
          <div className="relative z-10 border-t border-white/[0.06] pt-4 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex w-full items-center justify-between text-xs font-medium text-white/40 hover:text-white/70 transition"
            >
              <span>Diagnostic stack</span>
              {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showDetails && (
              <div className="mt-3 overflow-x-auto rounded-xl border border-white/[0.06] bg-black/50 p-3.5 font-data text-[11px] text-rose-300 leading-relaxed max-h-32 overflow-y-auto">
                <p className="break-words">{error.message}</p>
              </div>
            )}
          </div>
        )}
      </GlassCard>
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
