// ============================================================
<<<<<<< HEAD
// Koraspace AI — App-wide constants
// ============================================================

export const APP_NAME = "Koraspace AI";
export const APP_TAGLINE = "Stop Managing Social Media. Start Delegating It.";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://koraspace.ai";
=======
// Koraspace — App-wide constants
// ============================================================

export const APP_NAME = "Koraspace";
export const APP_TAGLINE = "Stop Managing Social Media. Start Delegating It.";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://Koraspace.co";
>>>>>>> main

// ── Plan limits ──────────────────────────────────────────────
export const PLAN_LIMITS = {
  free: {
    accounts: 3,
    tokensPerLifetime: 50000,
    schedulesPerLifetime: 3,
    agents: 0,
    teamSeats: 0,
    hasMarketerPage: false,
    hasHashtagManager: false,
    allowedPages: ["analytics", "overview", "support"],
  },
  pro: {
    accounts: 7,
    tokensPerMonth: 1600000, // 400k/week
    schedulesPerWeek: 5,
    agents: 5,
    teamSeats: 3,
    hasMarketerPage: false,
    hasHashtagManager: false,
    allowedPages: ["all"], // All pages except marketer
  },
  advanced: {
    accounts: 10,
    tokensPerMonth: 3500000, // 900k/week
    schedulesPerLifetime: 15,
    agents: 15,
    teamSeats: 7,
    hasMarketerPage: true,
    hasHashtagManager: true,
    allowedPages: ["all"],
  },
  team: {
    accounts: 9999, // Unlimited
    tokensPerMonth: 7200000, // 1.8M/week
    schedulesPerWeek: 9999, // Unlimited
    agents: 9999, // Unlimited
    teamSeats: 9999, // Unlimited
    hasMarketerPage: true,
    hasHashtagManager: true,
    allowedPages: ["all"],
  },
} as const;

// ── Plan prices (Naira) ──────────────────────────────────────
export const PLAN_PRICES = {
  free: 0,
  pro: 13500,
  advanced: 30000,
  team: 130000,
} as const;

// ── Platforms ────────────────────────────────────────────────
export const PLATFORMS = [
  { id: "x", label: "X (Twitter)", maxChars: 280, color: "#1DA1F2" },
  { id: "linkedin", label: "LinkedIn", maxChars: 3000, color: "#0077B5" },
  { id: "instagram", label: "Instagram", maxChars: 2200, color: "#E1306C" },
  { id: "tiktok", label: "TikTok", maxChars: 2200, color: "#888888" },
  { id: "threads", label: "Threads", maxChars: 500, color: "#000000" },
  { id: "youtube", label: "YouTube Shorts", maxChars: 100, color: "#FF0000" },
  { id: "whatsapp", label: "WhatsApp Channels", maxChars: 1024, color: "#25D366" },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];

// ── Ghost Mode action types ──────────────────────────────────
export const AGENT_ACTIONS = {
  AUTO_REPLY: "auto_reply",
  FLAG_LEAD: "flag_lead",
  ESCALATE_COMPLAINT: "escalate_complaint",
  IGNORE: "ignore",
} as const;

// ── Writing frameworks ───────────────────────────────────────
export const FRAMEWORKS = [
  {
    id: "aida",
    label: "AIDA",
    desc: "Attention → Interest → Desire → Action",
  },
  { id: "pas", label: "PAS", desc: "Problem → Agitate → Solve" },
  {
    id: "hook",
    label: "Curiosity Hook",
    desc: "Open loop to drive 'See More' clicks",
  },
  { id: "story", label: "Story Arc", desc: "Narrative-driven, high-retention" },
] as const;

// ── Brand tones ──────────────────────────────────────────────
export const TONES = [
  "Professional",
  "Casual",
  "Naija Vibe",
  "Witty",
  "Inspirational",
  "Educational",
  "Provocative",
  "Storyteller",
] as const;

// ── Koraspace Score thresholds ────────────────────────────────
export const SCORE_THRESHOLDS = {
  HIGH: 75,
  MEDIUM: 50,
} as const;

// ── Paystack plan codes (add real codes from Paystack dashboard) ──
export const PAYSTACK_PLANS = {
  basic: process.env.NEXT_PUBLIC_PAYSTACK_BASIC_PLAN || "PLN_xxxx",
  pro: process.env.NEXT_PUBLIC_PAYSTACK_PRO_PLAN || "PLN_xxxx",
  advanced: process.env.NEXT_PUBLIC_PAYSTACK_ADVANCED_PLAN || "PLN_xxxx",
} as const;
