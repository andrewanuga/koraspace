import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Check,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Bot,
    title: "Your AI agent",
    description: "Creates, publishes and manages social work around the clock.",
  },
  {
    icon: MessageSquare,
    title: "Always-on engagement",
    description: "Respond to conversations while surfacing the leads that matter.",
  },
  {
    icon: TrendingUp,
    title: "Performance intelligence",
    description: "Understand what actually drives attention, growth and revenue.",
  },
];

const AGENT_ACTIVITY = [
  {
    label: "Content drafted",
    detail: "3 posts ready for review",
    time: "2m ago",
    icon: Sparkles,
  },
  {
    label: "Lead detected",
    detail: "High-intent conversation",
    time: "8m ago",
    icon: MessageSquare,
  },
  {
    label: "Performance updated",
    detail: "Engagement +18.4%",
    time: "14m ago",
    icon: TrendingUp,
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="flex min-h-screen lg:h-screen">
        {/* =========================================================
            LEFT — BRAND / PRODUCT EXPERIENCE
        ========================================================= */}
        <aside className="relative hidden w-[48%] shrink-0 overflow-hidden border-r border-white/[0.08] lg:flex">
          {/* Structural background elements — intentionally no gradients */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-180px] top-[20%] h-[420px] w-[420px] rounded-full border border-[#ff0a8a]/[0.07]" />
            <div className="absolute left-[-120px] top-[27%] h-[300px] w-[300px] rounded-full border border-[#ff0a8a]/[0.05]" />
            <div className="absolute bottom-[-220px] right-[-160px] h-[460px] w-[460px] rounded-full border border-[#2f80ff]/[0.06]" />

            <div className="absolute left-0 top-0 h-px w-32 bg-[#ff0a8a]/40" />
            <div className="absolute bottom-0 right-0 h-px w-32 bg-[#2f80ff]/30" />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            {/* Brand */}
            <div>
              <Link
                href="/"
                className="group inline-flex items-center gap-2.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Koraspace"
                  width={28}
                  height={25}
                  className="h-[25px] w-auto"
                />

                <span className="font-display text-[19px] font-semibold tracking-[-0.02em] text-white">
                  Kora
                  <span className="text-[#ff0a8a]">space</span>
                </span>
              </Link>
            </div>

            {/* Main brand statement */}
            <div className="my-auto max-w-[620px] py-16">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#ff0a8a]/20 bg-[#ff0a8a]/[0.06] px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff0a8a]/50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff0a8a]" />
                </span>

                <span className="font-data text-[10px] font-medium uppercase tracking-[0.16em] text-[#ff72b5]">
                  Your social operating system
                </span>
              </div>

              <h1 className="font-display text-[52px] font-semibold leading-[0.98] tracking-[-0.045em] text-white xl:text-[68px]">
                Turn your
                <br />
                <span className="text-[#ff0a8a]">social presence</span>
                <br />
                into a system.
              </h1>

              <p className="mt-7 max-w-[490px] text-[15px] leading-7 text-white/50 xl:text-base">
                Koraspace gives creators and marketers an intelligent agent
                that can plan, create, engage and measure — without adding
                another full-time job to your calendar.
              </p>

              {/* Product highlights */}
              <div className="mt-10 space-y-3">
                {HIGHLIGHTS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="group flex max-w-[500px] items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3.5 transition-colors duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                        <Icon className="h-4 w-4 text-[#ff0a8a]" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-white">
                          {item.title}
                        </p>

                        <p className="mt-0.5 text-[11px] leading-5 text-white/40">
                          {item.description}
                        </p>
                      </div>

                      <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-white/20 transition-colors group-hover:text-[#ff0a8a]" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom product telemetry */}
            <div className="grid grid-cols-[1fr_auto] items-end gap-8">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#ff0a8a]/10">
                    <Zap className="h-3 w-3 text-[#ff0a8a]" />
                  </div>

                  <span className="font-data text-[9px] uppercase tracking-[0.16em] text-white/30">
                    Agent activity
                  </span>
                </div>

                <div className="space-y-1.5">
                  {AGENT_ACTIVITY.map((activity) => {
                    const Icon = activity.icon;

                    return (
                      <div
                        key={activity.label}
                        className="flex items-center gap-2.5"
                      >
                        <Icon className="h-3 w-3 text-white/25" />

                        <span className="text-[10px] font-medium text-white/55">
                          {activity.label}
                        </span>

                        <span className="hidden text-[10px] text-white/25 xl:inline">
                          {activity.detail}
                        </span>

                        <span className="ml-auto font-data text-[9px] text-white/20">
                          {activity.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="hidden text-right xl:block">
                <p className="font-data text-[9px] uppercase tracking-[0.18em] text-white/20">
                  KORASPACE OS
                </p>
                <p className="mt-1 text-[10px] text-white/30">
                  Built for modern teams
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* =========================================================
            RIGHT — AUTH AREA
        ========================================================= */}
        <main className="relative flex min-w-0 flex-1 flex-col bg-[#121212]">
          {/* Top navigation */}
          <header className="flex items-center justify-between px-5 py-5 sm:px-8 sm:py-7">
            {/* Mobile logo */}
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 lg:hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Koraspace"
                width={25}
                height={22}
                className="h-[22px] w-auto"
              />

              <span className="font-display text-[16px] font-semibold tracking-[-0.02em] text-white">
                Kora
                <span className="text-[#ff0a8a]">space</span>
              </span>
            </Link>

            {/* Desktop minimal brand marker */}
            <div className="hidden items-center gap-2 lg:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
              <span className="font-data text-[9px] uppercase tracking-[0.2em] text-white/25">
                Secure workspace access
              </span>
            </div>

            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 text-[12px] font-medium text-white/35 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Back to site</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </header>

          {/* Thin divider */}
          <div className="mx-5 h-px bg-white/[0.06] sm:mx-8" />

          {/* Form container */}
          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-14">
            <div className="w-full max-w-[430px]">
              {children}
            </div>
          </div>

          {/* Footer */}
          <footer className="px-5 pb-6 sm:px-8">
            <div className="flex items-center justify-center gap-3 text-[10px] text-white/20">
              <div className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-emerald-400/60" />
                <span>Secure authentication</span>
              </div>

              <span className="h-1 w-1 rounded-full bg-white/10" />

              <span>© {new Date().getFullYear()} Koraspace</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}