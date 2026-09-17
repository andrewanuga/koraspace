"use client";

import { useEffect, useState } from "react";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

const HINTS = [
  "Synchronizing workspace context...",
  "Verifying zero-trust credentials...",
  "Calibrating AI creative engines...",
  "Connecting real-time analytics...",
  "Welcome to Koraspace",
];

export default function RootLoading() {
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % HINTS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ background: "#0b0c10" }}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-[420px] w-[420px] rounded-full opacity-25 blur-[120px] animate-pulse"
          style={{
            background: "radial-gradient(circle, #3b82f6 0%, #6366f1 50%, #a855f7 100%)",
            animationDuration: "3s",
          }}
        />
      </div>

      {/* Orbital rings around center */}
      <div className="relative flex flex-col items-center gap-7">
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* Subtle spinning orbital ring */}
          <div
            className="absolute inset-0 rounded-full border border-blue-500/20 border-t-blue-400 animate-spin"
            style={{ animationDuration: "2.4s" }}
          />
          <div
            className="absolute -inset-2 rounded-full border border-indigo-500/10 border-b-indigo-400 animate-spin"
            style={{ animationDuration: "3.8s", animationDirection: "reverse" }}
          />

          {/* Glowing Brand Icon */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl backdrop-blur-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Koraspace"
              width={48}
              height={42}
              className="h-9 w-auto drop-shadow-[0_0_16px_rgba(59,130,246,0.65)]"
            />
          </div>
        </div>

        {/* Brand Wordmark with water-flow shimmer */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div
            className="font-display tracking-tight text-white flex items-center gap-0.5"
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            <span>Kora</span>
            <span className="text-blue-500">space</span>
            <Sparkles className="ml-1.5 h-4 w-4 text-blue-400 animate-pulse" />
          </div>

          {/* Dynamic Loading Status Hint */}
          <p className="h-5 text-[12.5px] font-medium tracking-wide text-white/50 transition-all duration-300">
            {HINTS[hintIndex]}
          </p>
        </div>

        {/* Indeterminate Laser Progress Bar */}
        <div className="mt-1 h-[2.5px] w-[200px] overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full animate-progress-indeterminate"
            style={{
              background: "linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, transparent)",
              boxShadow: "0 0 10px rgba(59,130,246,0.8)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
