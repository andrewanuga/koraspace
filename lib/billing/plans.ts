// Billing plans — single source of truth for pricing + Paystack plan codes.
export type PlanId = "free" | "pro" | "advanced" | "team";

export interface PlanConfig {
  id: PlanId;
  name: string;
  /** Naira per month (major units). */
  price: number;
  /** Env var holding the Paystack plan code for subscriptions. */
  planCodeEnv?: string;
  /** Monthly AI generation/token allowance. */
  aiTokens: number;
  /** Connected social account limit. */
  accounts: number;
  /** Autonomous bots/agents limit. */
  bots: number;
  /** Maximum number of team collaborators allowed. */
  collaborators: number;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: { id: "free", name: "Free", price: 0, aiTokens: 50000, accounts: 3, bots: 0, collaborators: 0 },
  pro: { id: "pro", name: "Pro", price: 13500, planCodeEnv: "NEXT_PUBLIC_PAYSTACK_PRO_PLAN", aiTokens: 1600000, accounts: 7, bots: 5, collaborators: 3 },
  advanced: { id: "advanced", name: "Advanced", price: 30000, planCodeEnv: "NEXT_PUBLIC_PAYSTACK_ADVANCED_PLAN", aiTokens: 3500000, accounts: 10, bots: 15, collaborators: 7 },
  team: { id: "team", name: "Teams", price: 130000, planCodeEnv: "NEXT_PUBLIC_PAYSTACK_TEAM_PLAN", aiTokens: 7200000, accounts: 9999, bots: 9999, collaborators: 9999 },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "advanced", "team"];

/** Paystack works in kobo (₦1 = 100 kobo). */
export const toKobo = (naira: number) => Math.round(naira * 100);

export const isPlan = (v: string): v is PlanId => v in PLANS;
