import Link from "next/link";
import { ArrowLeft, Home, Compass, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center select-none"
      style={{ background: "#0b0c10", color: "#f3f4f6" }}
    >
      {/* Ambient blooms */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full opacity-20 blur-[130px]"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
        />
        <div
          className="absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full opacity-15 blur-[130px]"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
        />
      </div>

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative flex flex-col items-center">
        {/* Brand */}
        <Link href="/" className="group mb-8 flex items-center gap-2.5 transition">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Koraspace"
            width={28}
            height={25}
            className="h-7 w-auto transition-transform group-hover:scale-105"
          />
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Kora<span className="text-blue-500">space</span>
          </span>
        </Link>

        {/* 404 Big Display */}
        <div
          className="font-display leading-none tracking-[-0.04em] font-extrabold select-none text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20"
          style={{ fontSize: "clamp(96px, 20vw, 180px)" }}
        >
          404
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1">
          <Compass className="h-3.5 w-3.5 text-blue-400" />
          <span className="font-data text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">
            Route Not Found
          </span>
        </div>

        <h1 className="font-display mt-6 text-2xl font-bold tracking-tight text-white sm:text-4xl">
          This page went off the grid.
        </h1>
        <p className="mt-3 max-w-md text-xs leading-relaxed text-white/60 sm:text-sm">
          The link is broken or the page moved. Your automated agents and campaigns are safely running in your workspace.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/dashboard">
            <button className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110 active:scale-[0.98]">
              <ArrowLeft className="h-4 w-4" /> Go to Dashboard
            </button>
          </Link>
          <Link href="/">
            <button className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-7 text-xs font-semibold text-white/80 backdrop-blur-md transition hover:bg-white/[0.08] hover:text-white active:scale-[0.98]">
              <Home className="h-4 w-4 text-white/50" /> Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
