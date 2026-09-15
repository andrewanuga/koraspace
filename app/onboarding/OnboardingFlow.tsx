"use client";

import { useMemo, useState, type ComponentType, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clapperboard,
  FileText,
  Play,
  Layers3,
  Loader2,
  Megaphone,
  MessageCircle,
  PenLine,
  Rocket,
  Search,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
  WandSparkles,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

import { useToast } from "@/components/ui/toast";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import {
  ANALYTICS_STYLES,
  FONT_FAMILIES,
  THEME_MODES,
  DASHBOARD_DENSITIES,
  type AnalyticsStyle,
  type FontFamily,
  type ThemeMode,
  type DashboardDensity,
} from "@/lib/preferences/types";

type IconComponent = ComponentType<{ className?: string; style?: CSSProperties }>;

type Persona = "client" | "creator" | "marketer";

type Goal =
  | "growth"
  | "leads"
  | "sales"
  | "content"
  | "brand"
  | "management"
  | "repurpose"
  | "analytics";

type Platform =
  | "instagram"
  | "tiktok"
  | "x"
  | "linkedin"
  | "youtube"
  | "threads"
  | "facebook"
  | "whatsapp"
  | "pinterest"
  | "reddit"
  | "telegram"
  | "snapchat";

type ContentFormat =
  | "short_video"
  | "text"
  | "carousel"
  | "image"
  | "long_form"
  | "mixed";

type AutomationLevel =
  | "suggestions"
  | "drafts"
  | "create_schedule"
  | "automate";

const PINK = "#ff0a8a";
const PINK_SOFT = "#ff63b4";
const BLUE = "#3b82f6";
const BLUE_SOFT = "#60a5fa";

const PLATFORMS: {
  id: Platform;
  title: string;
  imageSrc: string;
}[] = [
  { id: "instagram", title: "Instagram", imageSrc: "/integrations/insta.png" },
  { id: "tiktok", title: "TikTok", imageSrc: "/integrations/ticktok.png" },
  { id: "x", title: "X (Twitter)", imageSrc: "/integrations/twitter.png" },
  { id: "linkedin", title: "LinkedIn", imageSrc: "/integrations/linkedin.png" },
  { id: "youtube", title: "YouTube", imageSrc: "/integrations/yt.png" },
  { id: "threads", title: "Threads", imageSrc: "/integrations/threads.png" },
  { id: "facebook", title: "Facebook", imageSrc: "/integrations/facebook.png" },
  { id: "whatsapp", title: "WhatsApp", imageSrc: "/integrations/whatsapp.png" },
  { id: "pinterest", title: "Pinterest", imageSrc: "/integrations/pin.png" },
  { id: "reddit", title: "Reddit", imageSrc: "/integrations/reddit.png" },
  { id: "telegram", title: "Telegram", imageSrc: "/integrations/telegram.png" },
  { id: "snapchat", title: "Snapchat", imageSrc: "/integrations/Snapchat.png" },
];

function ChoiceCard({
  active,
  onClick,
  icon: Icon,
  imageSrc,
  title,
  description,
  compact = false,
  accentColor = PINK,
  accentSoft = PINK_SOFT,
}: {
  active: boolean;
  onClick: () => void;
  icon?: IconComponent;
  imageSrc?: string;
  title: string;
  description?: string;
  compact?: boolean;
  accentColor?: string;
  accentSoft?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs ${
        compact ? "p-3.5" : "p-4"
      } ${
        active
          ? ""
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/[0.08] dark:bg-white/[0.025] dark:hover:border-white/15"
      }`}
      style={{
        borderColor: active ? `${accentColor}80` : undefined,
        background: active ? `${accentColor}12` : undefined,
      }}
    >
      {imageSrc ? (
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white p-1.5 shadow-xs transition-transform duration-200 group-hover:scale-105 ${
            active ? "border-transparent ring-2" : "border-slate-200 dark:border-white/10 dark:bg-white/10"
          }`}
          style={{
            borderColor: active ? `${accentColor}80` : undefined,
            boxShadow: active ? `0 0 12px ${accentColor}40` : undefined,
          }}
        >
          <Image
            src={imageSrc}
            alt={title}
            width={32}
            height={32}
            className="h-full w-full object-contain"
          />
        </span>
      ) : Icon ? (
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
            active
              ? ""
              : "border-slate-200 bg-slate-100 text-slate-500 dark:border-white/[0.07] dark:bg-white/[0.025] dark:text-white/40"
          }`}
          style={{
            borderColor: active ? `${accentColor}35` : undefined,
            background: active ? `${accentColor}20` : undefined,
          }}
        >
          <Icon
            className="h-4.5 w-4.5"
            style={{
              color: active ? accentSoft : undefined,
            }}
          />
        </span>
      ) : null}

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-900 dark:text-white/90">
          {title}
        </span>

        {description && (
          <span className="mt-0.5 block text-[11px] leading-5 text-slate-500 dark:text-white/35">
            {description}
          </span>
        )}
      </span>

      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
          active
            ? "border-transparent"
            : "border-slate-300 bg-transparent dark:border-white/15"
        }`}
        style={{
          background: active ? accentColor : undefined,
        }}
      >
        {active && <Check className="h-3 w-3 text-white stroke-[3]" />}
      </span>
    </button>
  );
}

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-500 dark:text-white/35">
      {children}
    </div>
  );
}

/* =========================================================================
   RICH VISUAL & COLORFUL CHART PREVIEWS (STEP 07)
   ========================================================================= */

function RichChartIllustration({
  style,
  accentColor,
}: {
  style: AnalyticsStyle;
  accentColor: string;
}) {
  switch (style) {
    case "auto":
      return (
        <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-[#181824] to-[#0d0d16] p-3 text-white shadow-inner dark:border-white/[0.1]">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#ff0a8a]/30 blur-xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-[#3b82f6]/30 blur-xl" />

          <div className="flex items-center justify-between text-[10px] font-medium text-white/70">
            <span className="flex items-center gap-1.5 font-mono text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              AI Adaptive Mode
            </span>
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-[#ff7fba]">
              +48.2% Active
            </span>
          </div>

          {/* SVG Waveform */}
          <div className="mt-2 h-14 w-full">
            <svg viewBox="0 0 200 60" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="aiGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#ff0a8a" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="aiFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff0a8a" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 45 Q 30 10 65 30 T 130 18 T 200 12 L 200 60 L 0 60 Z"
                fill="url(#aiFill)"
              />
              <path
                d="M 0 45 Q 30 10 65 30 T 130 18 T 200 12"
                fill="none"
                stroke="url(#aiGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="130" cy="18" r="4" fill="#fff" stroke="#ff0a8a" strokeWidth="2" />
              <circle cx="65" cy="30" r="3" fill="#3b82f6" />
            </svg>
          </div>
        </div>
      );

    case "area":
      return (
        <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-900 to-[#12121c] p-3 text-white shadow-inner dark:border-white/[0.1]">
          <div className="flex items-center justify-between text-[10px] text-white/60">
            <span className="font-medium text-white/90">Luminous Volume</span>
            <span className="font-mono text-[#ff0a8a]">482.4K Reach</span>
          </div>
          <div className="mt-2 h-14 w-full">
            <svg viewBox="0 0 200 60" className="h-full w-full">
              <defs>
                <linearGradient id="areaGradFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff0a8a" stopOpacity="0.6" />
                  <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 50 L 30 35 L 65 42 L 105 18 L 150 25 L 200 8 L 200 60 L 0 60 Z"
                fill="url(#areaGradFull)"
              />
              <path
                d="M 0 50 L 30 35 L 65 42 L 105 18 L 150 25 L 200 8"
                fill="none"
                stroke="#ff4da6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="105" cy="18" r="3.5" fill="#fff" stroke="#ff0a8a" strokeWidth="2" />
              <circle cx="200" cy="8" r="3" fill="#38bdf8" />
            </svg>
          </div>
        </div>
      );

    case "bar":
      return (
        <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-900 to-[#121218] p-3 text-white shadow-inner dark:border-white/[0.1]">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#ff0a8a]/20 blur-lg" />
          <div className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-[#3b82f6]/20 blur-lg" />

          <div className="flex items-center justify-between text-[10px] text-white/70">
            <span className="font-semibold text-white">Channel ROI & Conversion</span>
            <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-emerald-400">
              3.82× ROAS
            </span>
          </div>

          <div className="mt-1 h-16 w-full">
            <svg viewBox="0 0 200 65" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="barGradPink" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff0a8a" />
                  <stop offset="100%" stopColor="#b80062" />
                </linearGradient>
                <linearGradient id="barGradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="barGradPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id="barGradEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="barGradAmber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="0" y1="12" x2="200" y2="12" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="0" y1="30" x2="200" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="0" y1="48" x2="200" y2="48" stroke="rgba(255,255,255,0.12)" />

              {/* Group 1: Instagram */}
              <rect x="14" y="20" width="10" height="28" rx="3" fill="url(#barGradPink)" filter="drop-shadow(0 2px 5px rgba(255,10,138,0.35))" />
              <rect x="27" y="30" width="10" height="18" rx="3" fill="url(#barGradBlue)" opacity="0.85" />
              <text x="25.5" y="58" fill="rgba(255,255,255,0.5)" fontSize="7" textAnchor="middle" fontFamily="sans-serif">IG</text>

              {/* Group 2: TikTok */}
              <rect x="54" y="14" width="10" height="34" rx="3" fill="url(#barGradPink)" filter="drop-shadow(0 2px 5px rgba(255,10,138,0.35))" />
              <rect x="67" y="24" width="10" height="24" rx="3" fill="url(#barGradBlue)" opacity="0.85" />
              <text x="65.5" y="58" fill="rgba(255,255,255,0.5)" fontSize="7" textAnchor="middle" fontFamily="sans-serif">TT</text>

              {/* Group 3: X / Twitter */}
              <rect x="94" y="26" width="10" height="22" rx="3" fill="url(#barGradPink)" opacity="0.85" />
              <rect x="107" y="18" width="10" height="30" rx="3" fill="url(#barGradBlue)" filter="drop-shadow(0 2px 5px rgba(56,189,248,0.35))" />
              <text x="105.5" y="58" fill="rgba(255,255,255,0.5)" fontSize="7" textAnchor="middle" fontFamily="sans-serif">X</text>

              {/* Group 4: LinkedIn */}
              <rect x="134" y="10" width="10" height="38" rx="3" fill="url(#barGradEmerald)" filter="drop-shadow(0 2px 5px rgba(52,211,153,0.35))" />
              <rect x="147" y="16" width="10" height="32" rx="3" fill="url(#barGradBlue)" filter="drop-shadow(0 2px 5px rgba(56,189,248,0.35))" />
              <text x="145.5" y="58" fill="rgba(255,255,255,0.5)" fontSize="7" textAnchor="middle" fontFamily="sans-serif">LI</text>

              {/* Group 5: YouTube */}
              <rect x="174" y="16" width="10" height="32" rx="3" fill="url(#barGradPurple)" />
              <rect x="187" y="28" width="10" height="20" rx="3" fill="url(#barGradAmber)" opacity="0.85" />
              <text x="185.5" y="58" fill="rgba(255,255,255,0.5)" fontSize="7" textAnchor="middle" fontFamily="sans-serif">YT</text>

              {/* Floating Peak Label */}
              <g transform="translate(134, 4)">
                <rect x="-3" y="-6" width="26" height="10" rx="3" fill="#10b981" />
                <text x="10" y="1" fill="#fff" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">+94%</text>
              </g>
            </svg>
          </div>
        </div>
      );

    case "line":
      return (
        <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-900 to-[#121218] p-3 text-white shadow-inner dark:border-white/[0.1]">
          <div className="flex items-center justify-between text-[10px] text-white/60">
            <span className="font-medium text-white/90">Comparative Trajectory</span>
            <span className="font-mono text-cyan-400">+34.8% MoM</span>
          </div>
          <div className="mt-2 h-14 w-full">
            <svg viewBox="0 0 200 60" className="h-full w-full">
              {/* Grid guide */}
              <line x1="0" y1="30" x2="200" y2="30" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              {/* Series 1 (Pink) */}
              <path
                d="M 0 48 Q 45 15 90 32 T 200 10"
                fill="none"
                stroke="#ff0a8a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Series 2 (Cyan) */}
              <path
                d="M 0 35 Q 50 48 110 22 T 200 28"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeDasharray="4 2"
                strokeLinecap="round"
              />
              <circle cx="90" cy="32" r="3" fill="#ff0a8a" />
              <circle cx="200" cy="10" r="3.5" fill="#fff" stroke="#ff0a8a" strokeWidth="2" />
            </svg>
          </div>
        </div>
      );

    case "donut":
      return (
        <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-900 to-[#13131c] p-3 text-white shadow-inner dark:border-white/[0.1]">
          <div className="flex items-center justify-between text-[10px] text-white/60">
            <span className="font-medium text-white/90">Audience Share</span>
            <span className="font-mono text-purple-400">100% Synced</span>
          </div>
          <div className="mt-1 flex items-center justify-around">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-full w-full rotate-[-90deg]">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="4.5" strokeDasharray="30 70" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#ff0a8a" strokeWidth="4.5" strokeDasharray="40 60" strokeDashoffset="-30" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4.5" strokeDasharray="20 80" strokeDashoffset="-70" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeDasharray="10 90" strokeDashoffset="-90" />
              </svg>
              <span className="absolute text-[9px] font-bold text-white">482K</span>
            </div>
            <div className="space-y-1 text-[9px]">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ff0a8a]" /> IG (40%)</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#3b82f6]" /> LinkedIn (30%)</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#10b981]" /> TikTok (20%)</div>
            </div>
          </div>
        </div>
      );

    case "funnel":
      return (
        <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-900 to-[#14141d] p-3 text-white shadow-inner dark:border-white/[0.1]">
          <div className="flex items-center justify-between text-[10px] text-white/60">
            <span className="font-medium text-white/90">Lead Conversion Funnel</span>
            <span className="font-mono text-emerald-400">₦8.4M Rev</span>
          </div>
          <div className="mt-2 flex flex-col items-center gap-1">
            <div className="h-3 w-44 rounded-sm bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-between px-2 text-[8px] font-mono">
              <span>Views</span><span>100%</span>
            </div>
            <div className="h-3 w-36 rounded-sm bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-between px-2 text-[8px] font-mono">
              <span>Engaged</span><span>54%</span>
            </div>
            <div className="h-3 w-28 rounded-sm bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-between px-2 text-[8px] font-mono">
              <span>Qualified</span><span>26%</span>
            </div>
            <div className="h-3 w-20 rounded-sm bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-between px-2 text-[8px] font-mono">
              <span>Paid</span><span>12%</span>
            </div>
          </div>
        </div>
      );

    case "radar":
    default:
      return (
        <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-900 to-[#12121c] p-3 text-white shadow-inner dark:border-white/[0.1]">
          <div className="flex items-center justify-between text-[10px] text-white/60">
            <span className="font-medium text-white/90">Multi-Axis Brand Score</span>
            <span className="font-mono text-[#ff0a8a]">96/100</span>
          </div>
          <div className="mt-1 flex justify-center">
            <svg viewBox="0 0 100 60" className="h-14 w-28">
              {/* Outer web */}
              <polygon points="50,5 90,20 75,55 25,55 10,20" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <polygon points="50,15 75,25 65,45 35,45 25,25" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              {/* Filled metric polygon */}
              <polygon
                points="50,8 85,22 68,50 30,48 18,22"
                fill="rgba(255,10,138,0.35)"
                stroke="#ff0a8a"
                strokeWidth="2"
              />
              <circle cx="50" cy="8" r="2.5" fill="#38bdf8" />
              <circle cx="85" cy="22" r="2.5" fill="#38bdf8" />
              <circle cx="68" cy="50" r="2.5" fill="#38bdf8" />
              <circle cx="30" cy="48" r="2.5" fill="#38bdf8" />
              <circle cx="18" cy="22" r="2.5" fill="#38bdf8" />
            </svg>
          </div>
        </div>
      );
  }
}

export function OnboardingFlow({
  initialName,
  initialUsername,
}: {
  initialName?: string;
  initialUsername?: string;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { error: toastError, success: toastSuccess } = useToast();
  const { preferences, updatePreferences } = usePreferences();
  const { t } = useLanguage();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [persona, setPersona] = useState<Persona | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [username, setUsername] = useState(initialUsername ?? "");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [contentFormats, setContentFormats] = useState<ContentFormat[]>([]);
  const [niche, setNiche] = useState("");
  const [postingCadence, setPostingCadence] = useState<number | null>(null);
  const [audienceRange, setAudienceRange] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [industry, setIndustry] = useState("");
  const [automationLevel, setAutomationLevel] = useState<AutomationLevel | null>(null);

  // Personalization Choices
  const [analyticsStyle, setAnalyticsStyle] = useState<AnalyticsStyle>(
    preferences.analytics_style || "auto"
  );
  const [fontFamily, setFontFamily] = useState<FontFamily>(
    preferences.font_family || "inter"
  );
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    preferences.theme_mode || "dark"
  );
  const [dashboardDensity, setDashboardDensity] = useState<DashboardDensity>(
    preferences.dashboard_density || "balanced"
  );

  const TOTAL_STEPS = 9;
  const firstName = initialName?.trim().split(/\s+/)[0] ?? "";

  const isMarketer = persona === "marketer";
  const accentColor = isMarketer ? BLUE : PINK;
  const accentSoft = isMarketer ? BLUE_SOFT : PINK_SOFT;

  const inputCls = `flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 dark:border-white/[0.10] dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/25 dark:focus:bg-white/[0.05] ${
    isMarketer
      ? "focus:border-[#3b82f6]/60 focus:ring-[#3b82f6]/10"
      : "focus:border-[#ff0a8a]/60 focus:ring-[#ff0a8a]/10"
  }`;

  const toggleGoal = (goal: Goal) => {
    setGoals((current) =>
      current.includes(goal)
        ? current.filter((item) => item !== goal)
        : [...current, goal]
    );
  };

  const togglePlatform = (platform: Platform) => {
    setPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    );
  };

  const toggleContentFormat = (format: ContentFormat) => {
    setContentFormats((current) =>
      current.includes(format)
        ? current.filter((item) => item !== format)
        : [...current, format]
    );
  };

  const handleFontFamilySelect = (font: FontFamily) => {
    setFontFamily(font);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.font = font;
    }
  };

  const handleThemeModeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    setTheme(mode);
  };

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return persona !== null;

      case 1:
        return goals.length > 0;

      case 2:
        return (
          username.trim().length >= 2 &&
          platforms.length > 0
        );

      case 3:
        return (
          niche.trim().length >= 2 &&
          contentFormats.length > 0 &&
          postingCadence !== null
        );

      case 4:
        if (persona === "creator") {
          return (
            audienceRange.trim().length > 0 &&
            targetAudience.trim().length >= 2
          );
        }

        if (persona === "client") {
          return (
            businessType.trim().length > 0 &&
            targetAudience.trim().length >= 2
          );
        }

        if (persona === "marketer") {
          return (
            industry.trim().length > 0 &&
            businessType.trim().length > 0
          );
        }

        return false;

      case 5:
        return automationLevel !== null;

      case 6:
        return Boolean(analyticsStyle);

      case 7:
        return Boolean(fontFamily);

      case 8:
        return Boolean(themeMode && dashboardDensity);

      default:
        return false;
    }
  }, [
    step,
    persona,
    goals,
    username,
    platforms,
    niche,
    contentFormats,
    postingCadence,
    audienceRange,
    businessType,
    targetAudience,
    industry,
    automationLevel,
    analyticsStyle,
    fontFamily,
    themeMode,
    dashboardDensity,
  ]);

  const next = () => {
    if (!stepValid) return;
    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
  };

  const back = () => {
    setStep((current) => Math.max(current - 1, 0));
  };

  const finish = async () => {
    if (!stepValid || loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona,
          username: username.trim(),
          goals,
          platforms,
          contentFormats,
          niche: niche.trim(),
          postingCadence,
          audienceRange,
          targetAudience,
          businessType,
          industry,
          automationLevel,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        toastError(
          "Couldn't finish setup",
          data?.error || "Please check your details and try again."
        );
        return;
      }

      // Persist user personalization preferences
      await updatePreferences({
        analytics_style: analyticsStyle,
        font_family: fontFamily,
        theme_mode: themeMode,
        dashboard_density: dashboardDensity,
      });

      toastSuccess(
        "Workspace ready",
        "Your Koraspace experience has been personalized."
      );

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toastError(
        "Something went wrong",
        err?.message || "We couldn't finish your setup. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = t.onboarding.stepTitles || [
    "Your role",
    "Your goals",
    "Your channels",
    "Your content",
    "Your audience",
    "Your workflow",
    "Analytics style",
    "Typography",
    "Appearance",
  ];

  return (
    <div className="w-full max-w-[680px]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-white/25">
            {t.onboarding.topBarTitle}
          </div>

          <div className="mt-1 text-xs text-slate-600 dark:text-white/45">
            {t.onboarding.stepIndicator} {step + 1} / {TOTAL_STEPS}
            <span className="mx-2 text-slate-300 dark:text-white/15">·</span>
            {stepTitles[step]}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="compact" />
          <div className="hidden items-center gap-2 sm:flex">
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: accentColor }}
            />
            <span className="text-[10px] font-medium uppercase tracking-[0.13em] text-slate-400 dark:text-white/25">
              {t.onboarding.personalizingBadge}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 flex gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
          const complete = index <= step;

          return (
            <div
              key={index}
              className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.08]"
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: complete ? "100%" : "0%",
                  background: index === step ? accentColor : accentSoft,
                  opacity: index < step ? 0.5 : 1,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Main card */}
      <div
        className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white dark:border-white/[0.08] dark:bg-[#171717] shadow-[0_20px_70px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_100px_-55px_rgba(0,0,0,0.95)] transition-colors duration-200"
      >
        <div className="p-6 sm:p-8 lg:p-9">
          <div key={step} className="sai-step-in">
            {/* STEP 0: Role */}
            {step === 0 && (
              <>
                <StepEyebrow number="01" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[38px]">
                  {t.onboarding.step1.titleStart}
                  <br />
                  <span className="text-slate-400 dark:text-white/40">
                    {t.onboarding.step1.titleHighlight}
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-white/40">
                  {firstName ? `Nice to meet you, ${firstName}. ` : ""}
                  {t.onboarding.step1.description}
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    {
                      id: "client" as Persona,
                      icon: BriefcaseBusiness,
                      title: t.onboarding.step1.roles.businessTitle,
                      blurb: t.onboarding.step1.roles.businessBlurb,
                      detail: t.onboarding.step1.roles.businessDetail,
                    },
                    {
                      id: "creator" as Persona,
                      icon: Sparkles,
                      title: t.onboarding.step1.roles.creatorTitle,
                      blurb: t.onboarding.step1.roles.creatorBlurb,
                      detail: t.onboarding.step1.roles.creatorDetail,
                    },
                    {
                      id: "marketer" as Persona,
                      icon: Megaphone,
                      title: t.onboarding.step1.roles.marketerTitle,
                      blurb: t.onboarding.step1.roles.marketerBlurb,
                      detail: t.onboarding.step1.roles.marketerDetail,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = persona === item.id;
                    const itemAccent = item.id === "marketer" ? BLUE : PINK;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPersona(item.id)}
                        className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer shadow-xs ${
                          active
                            ? ""
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/[0.08] dark:bg-white/[0.025] dark:hover:border-white/15"
                        }`}
                        style={{
                          borderColor: active ? `${itemAccent}80` : undefined,
                          background: active ? `${itemAccent}12` : undefined,
                        }}
                      >
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                            active
                              ? ""
                              : "border-slate-200 bg-slate-100 dark:border-white/[0.07] dark:bg-white/[0.025]"
                          }`}
                          style={{
                            borderColor: active ? `${itemAccent}35` : undefined,
                            background: active ? `${itemAccent}20` : undefined,
                          }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{
                              color: active
                                ? item.id === "marketer" ? BLUE_SOFT : PINK
                                : undefined,
                            }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                            {item.title}
                          </div>

                          <div className="mt-1 text-xs leading-5 text-slate-600 dark:text-white/40">
                            {item.blurb}
                          </div>

                          <div className="mt-1 hidden text-[10px] text-slate-400 dark:text-white/25 sm:block">
                            {item.detail}
                          </div>
                        </div>

                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                            active
                              ? "border-transparent"
                              : "border-slate-300 dark:border-white/15"
                          }`}
                          style={{
                            background: active ? itemAccent : "transparent",
                          }}
                        >
                          {active && (
                            <Check className="h-3 w-3 text-white stroke-[3]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* STEP 1: Goals */}
            {step === 1 && (
              <>
                <StepEyebrow number="02" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[38px]">
                  {t.onboarding.step2.titleStart}
                  <br />
                  <span className="text-slate-400 dark:text-white/40">
                    {t.onboarding.step2.titleHighlight}
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-white/40">
                  {t.onboarding.step2.description}
                </p>

                <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
                  {[
                    { id: "growth" as Goal, icon: TrendingUp, title: t.onboarding.step2.goals.growth?.title || "Grow my audience", description: t.onboarding.step2.goals.growth?.description || "Reach more people and increase visibility." },
                    { id: "leads" as Goal, icon: Users, title: t.onboarding.step2.goals.leads?.title || "Generate leads", description: t.onboarding.step2.goals.leads?.description || "Turn social attention into qualified prospects." },
                    { id: "sales" as Goal, icon: Target, title: t.onboarding.step2.goals.sales?.title || "Increase sales", description: t.onboarding.step2.goals.sales?.description || "Connect content and campaigns to revenue." },
                    { id: "content" as Goal, icon: Sparkles, title: t.onboarding.step2.goals.content?.title || "Create better content", description: t.onboarding.step2.goals.content?.description || "Produce higher quality posts in your voice." },
                    { id: "brand" as Goal, icon: BriefcaseBusiness, title: t.onboarding.step2.goals.brand?.title || "Build brand authority", description: t.onboarding.step2.goals.brand?.description || "Establish a clear, consistent presence." },
                    { id: "management" as Goal, icon: Calendar, title: t.onboarding.step2.goals.management?.title || "Save time on planning", description: t.onboarding.step2.goals.management?.description || "Streamline scheduling and asset management." },
                    { id: "repurpose" as Goal, icon: WandSparkles, title: t.onboarding.step2.goals.repurpose?.title || "Repurpose across platforms", description: t.onboarding.step2.goals.repurpose?.description || "Turn one piece of content into multiple formats." },
                    { id: "analytics" as Goal, icon: BarChart3, title: t.onboarding.step2.goals.analytics?.title || "Track full-funnel metrics", description: t.onboarding.step2.goals.analytics?.description || "Understand engagement, ROAS, and conversion." },
                  ].map((goal) => (
                    <ChoiceCard
                      key={goal.id}
                      active={goals.includes(goal.id)}
                      onClick={() => toggleGoal(goal.id)}
                      icon={goal.icon}
                      title={goal.title}
                      description={goal.description}
                      accentColor={accentColor}
                      accentSoft={accentSoft}
                    />
                  ))}
                </div>

                <SelectionHint count={goals.length} label={t.onboarding.step2.selectedCount} accentColor={accentColor} />
              </>
            )}

            {/* STEP 2: Channels & Username */}
            {step === 2 && (
              <>
                <StepEyebrow number="03" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[38px]">
                  {t.onboarding.step3.titleStart}
                  <br />
                  <span className="text-slate-400 dark:text-white/40">
                    {t.onboarding.step3.titleHighlight}
                  </span>
                </h1>

                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-white/40">
                  {t.onboarding.step3.description}
                </p>

                <div className="mt-8">
                  <SectionLabel>{t.onboarding.step3.platformsLabel}</SectionLabel>

                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {PLATFORMS.map((platform) => (
                      <ChoiceCard
                        key={platform.id}
                        active={platforms.includes(platform.id)}
                        onClick={() => togglePlatform(platform.id)}
                        imageSrc={platform.imageSrc}
                        title={platform.title}
                        compact
                        accentColor={accentColor}
                        accentSoft={accentSoft}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <SectionLabel>{t.onboarding.step3.usernameLabel}</SectionLabel>

                  <div className="relative">
                    <AtSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/25" />

                    <input
                      value={username}
                      onChange={(event) =>
                        setUsername(
                          event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                        )
                      }
                      placeholder={t.onboarding.step3.usernamePlaceholder || "yourhandle"}
                      autoFocus
                      className={`${inputCls} pl-10`}
                    />
                  </div>

                  <p className="mt-2 text-[10px] text-slate-400 dark:text-white/25">
                    {t.onboarding.step3.usernameHint}
                  </p>
                </div>

                <SelectionHint
                  count={platforms.length}
                  label={t.onboarding.step3.selectedCount}
                  accentColor={accentColor}
                />
              </>
            )}

            {/* STEP 3: Content & Cadence */}
            {step === 3 && (
              <>
                <StepEyebrow number="04" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[38px]">
                  {t.onboarding.step4.titleStart}
                  <br />
                  <span className="text-slate-400 dark:text-white/40">
                    {t.onboarding.step4.titleHighlight}
                  </span>
                </h1>

                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-white/40">
                  {t.onboarding.step4.description}
                </p>

                <div className="mt-8">
                  <SectionLabel>{t.onboarding.step4.nicheLabel}</SectionLabel>

                  <input
                    value={niche}
                    onChange={(event) =>
                      setNiche(event.target.value)
                    }
                    placeholder={t.onboarding.step4.nichePlaceholder}
                    autoFocus
                    className={inputCls}
                  />
                </div>

                <div className="mt-7">
                  <SectionLabel>{t.onboarding.step4.formatsLabel}</SectionLabel>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {[
                      { id: "short_video" as ContentFormat, icon: Clapperboard, title: t.onboarding.step4.formats.short_video?.title || "Short-form video", description: t.onboarding.step4.formats.short_video?.description || "Reels, TikToks, Shorts" },
                      { id: "text" as ContentFormat, icon: PenLine, title: t.onboarding.step4.formats.text?.title || "Text & threads", description: t.onboarding.step4.formats.text?.description || "X posts, LinkedIn insights" },
                      { id: "carousel" as ContentFormat, icon: Layers3, title: t.onboarding.step4.formats.carousel?.title || "Carousels & slides", description: t.onboarding.step4.formats.carousel?.description || "Multi-slide visual breakdowns" },
                      { id: "image" as ContentFormat, icon: Camera, title: t.onboarding.step4.formats.image?.title || "Single images & graphics", description: t.onboarding.step4.formats.image?.description || "Product shots, quotes, flyers" },
                      { id: "long_form" as ContentFormat, icon: FileText, title: t.onboarding.step4.formats.long_form?.title || "Long-form content", description: t.onboarding.step4.formats.long_form?.description || "Articles, newsletters, YouTube" },
                      { id: "mixed" as ContentFormat, icon: Sparkles, title: t.onboarding.step4.formats.mixed?.title || "A mix of everything", description: t.onboarding.step4.formats.mixed?.description || "Diverse cross-platform format" },
                    ].map((format) => (
                      <ChoiceCard
                        key={format.id}
                        active={contentFormats.includes(format.id)}
                        onClick={() =>
                          toggleContentFormat(format.id)
                        }
                        icon={format.icon}
                        title={format.title}
                        description={format.description}
                        accentColor={accentColor}
                        accentSoft={accentSoft}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-7">
                  <SectionLabel>
                    {t.onboarding.step4.cadenceLabel}
                  </SectionLabel>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { value: 1, title: t.onboarding.step4.cadences?.["1"]?.title || "1-2 posts / week", description: t.onboarding.step4.cadences?.["1"]?.description || "Low-frequency, high-focus consistency" },
                      { value: 3, title: t.onboarding.step4.cadences?.["3"]?.title || "3-5 posts / week", description: t.onboarding.step4.cadences?.["3"]?.description || "Active growth and audience momentum" },
                      { value: 7, title: t.onboarding.step4.cadences?.["7"]?.title || "Daily (7 posts / week)", description: t.onboarding.step4.cadences?.["7"]?.description || "Aggressive multi-channel presence" },
                      { value: 14, title: t.onboarding.step4.cadences?.["14"]?.title || "Multiple times / day", description: t.onboarding.step4.cadences?.["14"]?.description || "Heavy publishing volume across channels" },
                    ].map((cadence) => {
                      const active =
                        postingCadence === cadence.value;

                      return (
                        <button
                          key={cadence.value}
                          type="button"
                          onClick={() =>
                            setPostingCadence(cadence.value)
                          }
                          className={`rounded-2xl border p-3.5 text-left transition-all cursor-pointer shadow-xs ${
                            active
                              ? ""
                              : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/[0.08] dark:bg-white/[0.025]"
                          }`}
                          style={{
                            borderColor: active
                              ? `${accentColor}80`
                              : undefined,
                            background: active
                              ? `${accentColor}12`
                              : undefined,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {cadence.title}
                            </span>

                            {active && (
                              <Check
                                className="h-4 w-4 stroke-[3]"
                                style={{ color: accentColor }}
                              />
                            )}
                          </div>

                          <div className="mt-1 text-[11px] text-slate-500 dark:text-white/30">
                            {cadence.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* STEP 4: Audience Context */}
            {step === 4 && (
              <>
                <StepEyebrow number="05" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[38px]">
                  {t.onboarding.step5.titleStart}
                  <br />
                  <span className="text-slate-400 dark:text-white/40">
                    {t.onboarding.step5.titleHighlight}
                  </span>
                </h1>

                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-white/40">
                  {persona === "creator"
                    ? t.onboarding.step5.creatorDesc
                    : persona === "client"
                      ? t.onboarding.step5.clientDesc
                      : t.onboarding.step5.marketerDesc}
                </p>

                <div className="mt-8 space-y-6">
                  {persona === "creator" && (
                    <>
                      <div>
                        <SectionLabel>
                          {t.onboarding.step5.audienceSizeLabel}
                        </SectionLabel>

                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            "0 – 1K",
                            "1K – 10K",
                            "10K – 100K",
                            "100K+",
                          ].map((range) => (
                            <ChoiceCard
                              key={range}
                              active={audienceRange === range}
                              onClick={() =>
                                setAudienceRange(range)
                              }
                              title={range}
                              compact
                              accentColor={accentColor}
                              accentSoft={accentSoft}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <SectionLabel>
                          {t.onboarding.step5.targetAudienceLabel}
                        </SectionLabel>

                        <input
                          value={targetAudience}
                          onChange={(event) =>
                            setTargetAudience(event.target.value)
                          }
                          placeholder={t.onboarding.step5.targetAudiencePlaceholderCreator}
                          className={inputCls}
                        />
                      </div>
                    </>
                  )}

                  {persona === "client" && (
                    <>
                      <div>
                        <SectionLabel>
                          {t.onboarding.step5.businessTypeLabel}
                        </SectionLabel>

                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                          {[
                            "E-commerce",
                            "SaaS",
                            "Agency",
                            "Local business",
                            "Personal brand",
                            "Other",
                          ].map((type) => (
                            <ChoiceCard
                              key={type}
                              active={businessType === type}
                              onClick={() =>
                                setBusinessType(type)
                              }
                              title={type}
                              compact
                              accentColor={accentColor}
                              accentSoft={accentSoft}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <SectionLabel>
                          {t.onboarding.step5.targetAudienceLabel}
                        </SectionLabel>

                        <input
                          value={targetAudience}
                          onChange={(event) =>
                            setTargetAudience(event.target.value)
                          }
                          placeholder={t.onboarding.step5.targetAudiencePlaceholderClient}
                          className={inputCls}
                        />
                      </div>
                    </>
                  )}

                  {persona === "marketer" && (
                    <>
                      <div>
                        <SectionLabel>
                          {t.onboarding.step5.industryLabel}
                        </SectionLabel>

                        <input
                          value={industry}
                          onChange={(event) =>
                            setIndustry(event.target.value)
                          }
                          placeholder={t.onboarding.step5.industryPlaceholder}
                          autoFocus
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <SectionLabel>
                          {t.onboarding.step5.primarilyMarketLabel}
                        </SectionLabel>

                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                          {[
                            "Products",
                            "Services",
                            "SaaS",
                            "Personal brands",
                            "Agencies",
                            "Multiple brands",
                          ].map((type) => (
                            <ChoiceCard
                              key={type}
                              active={businessType === type}
                              onClick={() =>
                                setBusinessType(type)
                              }
                              title={type}
                              compact
                              accentColor={accentColor}
                              accentSoft={accentSoft}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* STEP 5: Workflow & Automation */}
            {step === 5 && (
              <>
                <StepEyebrow number="06" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[38px]">
                  {t.onboarding.step6.titleStart}
                  <br />
                  <span className="text-slate-400 dark:text-white/40">
                    {t.onboarding.step6.titleHighlight}
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-white/40">
                  {t.onboarding.step6.description}
                </p>

                <div className="mt-8 space-y-2.5">
                  {[
                    { id: "suggestions" as AutomationLevel, icon: Search, title: t.onboarding.step6.levels.suggestions?.title || "Suggestions & Ideas", description: t.onboarding.step6.levels.suggestions?.description || "Give me ideas and recommendations. I'll craft the rest." },
                    { id: "drafts" as AutomationLevel, icon: PenLine, title: t.onboarding.step6.levels.drafts?.title || "AI Pipeline Drafts", description: t.onboarding.step6.levels.drafts?.description || "Turn recommendations into ready-to-edit 8-step drafts." },
                    { id: "create_schedule" as AutomationLevel, icon: Calendar, title: t.onboarding.step6.levels.create_schedule?.title || "Create & Auto-Schedule", description: t.onboarding.step6.levels.create_schedule?.description || "Generate drafts and place them onto the visual calendar." },
                    { id: "automate" as AutomationLevel, icon: WandSparkles, title: t.onboarding.step6.levels.automate?.title || "Autonomous Operator", description: t.onboarding.step6.levels.automate?.description || "Let Koraspace triage leads and optimize campaigns continuously." },
                  ].map((level) => (
                    <ChoiceCard
                      key={level.id}
                      active={automationLevel === level.id}
                      onClick={() =>
                        setAutomationLevel(level.id)
                      }
                      icon={level.icon}
                      title={level.title}
                      description={level.description}
                      accentColor={accentColor}
                      accentSoft={accentSoft}
                    />
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.02] p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: `${accentColor}18`,
                        color: accentColor,
                      }}
                    >
                      <Settings2 className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-700 dark:text-white/70">
                        {t.onboarding.step6.summaryConfigured}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <SummaryPill>
                          {persona === "creator"
                            ? "Creator Mode"
                            : persona === "marketer"
                              ? "Marketer Mode"
                              : "Business Mode"}
                        </SummaryPill>

                        <SummaryPill>
                          {platforms.length} platforms
                        </SummaryPill>

                        <SummaryPill>
                          {goals.length} goals
                        </SummaryPill>

                        {niche && (
                          <SummaryPill>
                            {niche}
                          </SummaryPill>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* STEP 6: Analytics Style */}
            {step === 6 && (
              <>
                <StepEyebrow number="07" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[38px]">
                  {t.onboarding.step7.titleStart}
                  <br />
                  <span className="text-slate-400 dark:text-white/40">
                    {t.onboarding.step7.titleHighlight}
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-white/40">
                  {t.onboarding.step7.description}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {ANALYTICS_STYLES.map((style) => {
                    const active = analyticsStyle === style.id;
                    const translatedStyle = t.onboarding.step7.styles?.[style.id] || {
                      title: style.title,
                      subtitle: style.subtitle,
                      bestFor: style.bestFor,
                    };

                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setAnalyticsStyle(style.id)}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer shadow-xs ${
                          active
                            ? ""
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/[0.08] dark:bg-white/[0.025]"
                        }`}
                        style={{
                          borderColor: active
                            ? `${accentColor}80`
                            : undefined,
                          background: active
                            ? `${accentColor}12`
                            : undefined,
                        }}
                      >
                        {/* Rich Colorful Chart Viewport */}
                        <div className="mb-3 w-full">
                          <RichChartIllustration style={style.id} accentColor={active ? accentColor : "#3b82f6"} />
                        </div>

                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">{translatedStyle.title}</div>
                            <div className="text-[11px] text-slate-500 dark:text-white/40">{translatedStyle.subtitle}</div>
                          </div>

                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                              active ? "border-transparent" : "border-slate-300 dark:border-white/20"
                            }`}
                            style={{
                              background: active ? accentColor : "transparent",
                            }}
                          >
                            {active && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                          </div>
                        </div>

                        <div className="mt-3.5 border-t border-slate-100 dark:border-white/[0.06] pt-2.5">
                          <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/30 font-medium">
                            {t.onboarding.step7.bestForPrefix}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-600 dark:text-white/60">{translatedStyle.bestFor}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* STEP 7: Typography */}
            {step === 7 && (
              <>
                <StepEyebrow number="08" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[38px]">
                  {t.onboarding.step8.titleStart}
                  <br />
                  <span className="text-slate-400 dark:text-white/40">
                    {t.onboarding.step8.titleHighlight}
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-white/40">
                  {t.onboarding.step8.description}
                </p>

                <div className="mt-8 space-y-2.5">
                  {FONT_FAMILIES.map((font) => {
                    const active = fontFamily === font.id;
                    const translatedFont = t.onboarding.step8.fonts?.[font.id] || {
                      label: font.label,
                      category: font.category,
                      preview: font.preview,
                    };

                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => handleFontFamilySelect(font.id)}
                        className={`group flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer shadow-xs ${
                          active
                            ? ""
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/[0.08] dark:bg-white/[0.025]"
                        }`}
                        style={{
                          borderColor: active
                            ? `${accentColor}80`
                            : undefined,
                          background: active
                            ? `${accentColor}12`
                            : undefined,
                          fontFamily: font.cssFamily,
                        }}
                      >
                        <div className="min-w-0 flex-1 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-slate-900 dark:text-white">{translatedFont.label}</span>
                            <span className="rounded-md border border-slate-200 bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:text-white/40">
                              {translatedFont.category}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-slate-500 dark:text-white/50 tracking-wide">
                            {translatedFont.preview}
                          </div>
                        </div>

                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                            active ? "border-transparent" : "border-slate-300 dark:border-white/20"
                          }`}
                          style={{
                            background: active ? accentColor : "transparent",
                          }}
                        >
                          {active && <Check className="h-3 w-3 text-white stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* STEP 8: Appearance & Density */}
            {step === 8 && (
              <>
                <StepEyebrow number="09" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[38px]">
                  {t.onboarding.step9.titleStart}
                  <br />
                  <span className="text-slate-400 dark:text-white/40">
                    {t.onboarding.step9.titleHighlight}
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-white/40">
                  {t.onboarding.step9.description}
                </p>

                {/* Theme Selector */}
                <div className="mt-8">
                  <SectionLabel>{t.onboarding.step9.themeModeLabel}</SectionLabel>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {THEME_MODES.map((mode) => {
                      const active = themeMode === mode.id;
                      const translatedTheme = t.onboarding.step9.themes?.[mode.id] || {
                        label: mode.label,
                        description: mode.id === "light" ? "Crisp daylight" : mode.id === "dark" ? "Deep obsidian" : "Follows OS",
                      };

                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => handleThemeModeSelect(mode.id)}
                          className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all cursor-pointer shadow-xs ${
                            active
                              ? ""
                              : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/[0.08] dark:bg-white/[0.025]"
                          }`}
                          style={{
                            borderColor: active ? `${accentColor}80` : undefined,
                            background: active ? `${accentColor}12` : undefined,
                          }}
                        >
                          <div
                            className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl border ${
                              active ? "" : "border-slate-200 bg-slate-100 dark:border-white/[0.1] dark:bg-white/[0.04]"
                            }`}
                            style={{
                              borderColor: active ? `${accentColor}50` : undefined,
                              background: active ? `${accentColor}20` : undefined,
                            }}
                          >
                            {mode.id === "dark" && <Moon className="h-5 w-5" style={{ color: active ? accentColor : "currentColor" }} />}
                            {mode.id === "light" && <Sun className="h-5 w-5" style={{ color: active ? accentColor : "currentColor" }} />}
                            {mode.id === "system" && <Monitor className="h-5 w-5" style={{ color: active ? accentColor : "currentColor" }} />}
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{translatedTheme.label}</span>
                          <span className="mt-1 text-[11px] text-slate-500 dark:text-white/40">
                            {translatedTheme.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Density Selector */}
                <div className="mt-8">
                  <SectionLabel>{t.onboarding.step9.densityLabel}</SectionLabel>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {DASHBOARD_DENSITIES.map((dens) => {
                      const active = dashboardDensity === dens.id;
                      const translatedDensity = t.onboarding.step9.densities?.[dens.id] || {
                        label: dens.label,
                        badge: dens.badge,
                        description: dens.description,
                      };

                      return (
                        <button
                          key={dens.id}
                          type="button"
                          onClick={() => setDashboardDensity(dens.id)}
                          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer shadow-xs ${
                            active
                              ? ""
                              : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/[0.08] dark:bg-white/[0.025]"
                          }`}
                          style={{
                            borderColor: active ? `${accentColor}80` : undefined,
                            background: active ? `${accentColor}12` : undefined,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{translatedDensity.label}</span>
                            <span className="rounded-md border border-slate-200 bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.04] px-1.5 py-0.5 text-[9.5px] font-medium text-slate-500 dark:text-white/40">
                              {translatedDensity.badge}
                            </span>
                          </div>
                          <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-white/40">{translatedDensity.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Final Launch Summary Box */}
                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.02] p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${accentColor}20`, color: accentColor }}
                    >
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t.onboarding.step9.readyTitle}</h4>
                      <p className="text-xs text-slate-500 dark:text-white/40">{t.onboarding.step9.readyDesc}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 dark:border-white/[0.06] pt-3 text-[11px]">
                    <span className="rounded-lg border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.03] px-2.5 py-1 text-slate-600 dark:text-white/60 shadow-2xs">
                      Chart: <strong className="text-slate-900 dark:text-white capitalize">{analyticsStyle}</strong>
                    </span>
                    <span className="rounded-lg border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.03] px-2.5 py-1 text-slate-600 dark:text-white/60 shadow-2xs">
                      Font: <strong className="text-slate-900 dark:text-white capitalize">{fontFamily}</strong>
                    </span>
                    <span className="rounded-lg border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.03] px-2.5 py-1 text-slate-600 dark:text-white/60 shadow-2xs">
                      Theme: <strong className="text-slate-900 dark:text-white capitalize">{themeMode}</strong>
                    </span>
                    <span className="rounded-lg border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.03] px-2.5 py-1 text-slate-600 dark:text-white/60 shadow-2xs">
                      Density: <strong className="text-slate-900 dark:text-white capitalize">{dashboardDensity}</strong>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-9 flex items-center justify-between border-t border-slate-200 dark:border-white/[0.07] pt-6">
            <div>
              {step > 0 ? (
                <button
                  type="button"
                  onClick={back}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/[0.03] dark:hover:text-white/75 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t.onboarding.navigation.back}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.13em] text-slate-400 dark:text-white/20">
                  <Rocket
                    className="h-3.5 w-3.5"
                    style={{ color: accentColor }}
                  />
                  {t.onboarding.navigation.getStartedBadge}
                </div>
              )}
            </div>

            {step < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                disabled={!stepValid}
                onClick={next}
                className="group flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-white/[0.08] dark:disabled:text-white/25 disabled:shadow-none cursor-pointer"
                style={{
                  background: stepValid ? accentColor : undefined,
                  boxShadow: stepValid ? `0 14px 35px -16px ${accentColor}90` : undefined,
                }}
              >
                {t.onboarding.navigation.continue}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!stepValid || loading}
                onClick={finish}
                className="group flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-white/[0.08] dark:disabled:text-white/25 disabled:shadow-none cursor-pointer"
                style={{
                  background: stepValid && !loading ? accentColor : undefined,
                  boxShadow: stepValid && !loading ? `0 14px 35px -16px ${accentColor}90` : undefined,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.onboarding.navigation.settingUp}
                  </>
                ) : (
                  <>
                    {t.onboarding.navigation.enterWorkspace}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom reassurance */}
      <div className="mt-5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.13em] text-slate-400 dark:text-white/20">
        <CheckCircle2
          className="h-3.5 w-3.5"
          style={{ color: `${accentColor}80` }}
        />
        {t.onboarding.navigation.changeAnytimeReassurance}
      </div>
    </div>
  );
}

function StepEyebrow({
  number,
  accentColor = PINK,
  accentSoft = PINK_SOFT,
}: {
  number: string;
  accentColor?: string;
  accentSoft?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: accentColor }}
      />

      <span
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: accentSoft }}
      >
        Step {number}
      </span>
    </div>
  );
}

function SelectionHint({
  count,
  label,
  accentColor = PINK,
}: {
  count: number;
  label: string;
  accentColor?: string;
}) {
  return (
    <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 dark:text-white/20">
      <Check
        className="h-3.5 w-3.5"
        style={{
          color: count > 0 ? accentColor : "currentColor",
        }}
      />
      {count > 0 ? `${count} ${label}` : "Select at least one"}
    </div>
  );
}

function SummaryPill({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] text-slate-600 dark:border-white/[0.07] dark:bg-white/[0.025] dark:text-white/40">
      {children}
    </span>
  );
}
