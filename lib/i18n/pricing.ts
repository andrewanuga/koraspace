import { SupportedCurrency } from "./types";

export type PlanKey = "free" | "pro" | "advanced" | "team";

export interface PlanBasePrice {
  ngn: number;
  usdBase: number;
}

// Base local pricing (African base)
export const BASE_PLAN_PRICES: Record<PlanKey, PlanBasePrice> = {
  free: { ngn: 0, usdBase: 0 },
  pro: { ngn: 13500, usdBase: 9 }, // 13500 / 1500
  advanced: { ngn: 30000, usdBase: 20 }, // 30000 / 1500
  team: { ngn: 130000, usdBase: 86.67 }, // 130000 / 1500
};

// Multiplier for any non-African country
export const NON_AFRICAN_MULTIPLIER = 2.1;

// Exchange rates relative to USD (1 USD =)
const USD_FX_RATES: Record<SupportedCurrency, number> = {
  USD: 1.0,
  NGN: 1500.0,
  EUR: 0.92,
  CNY: 7.24,
  AED: 3.67,
};

export interface ComputedPrice {
  rawMonthly: number;
  formattedMonthly: string;
  rawAnnualMonthly: number;
  formattedAnnualMonthly: string;
  currency: SupportedCurrency;
  symbol: string;
}

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  NGN: "₦",
  USD: "$",
  EUR: "€",
  CNY: "¥",
  AED: "AED ",
};

/**
 * Calculates and formats price for a plan with the silent 2.1x multiplier applied for non-African visitors
 */
export function calculatePlanPrice(
  planKey: PlanKey,
  currency: SupportedCurrency,
  isAfrican: boolean,
  billingPeriod: "monthly" | "yearly" = "monthly"
): string {
  const base = BASE_PLAN_PRICES[planKey];
  if (!base || (base.ngn === 0 && base.usdBase === 0)) {
    return formatZeroPrice(currency);
  }

  // 1. If NGN and African:
  if (currency === "NGN" && isAfrican) {
    const monthlyPrice = base.ngn;
    const finalPrice =
      billingPeriod === "yearly" ? Math.round(monthlyPrice * 0.8) : monthlyPrice;
    return `₦${finalPrice.toLocaleString("en-NG")}`;
  }

  // 2. If NGN but non-African (e.g. manual currency override):
  if (currency === "NGN" && !isAfrican) {
    const monthlyPrice = Math.round(base.ngn * NON_AFRICAN_MULTIPLIER);
    const finalPrice =
      billingPeriod === "yearly" ? Math.round(monthlyPrice * 0.8) : monthlyPrice;
    return `₦${finalPrice.toLocaleString("en-NG")}`;
  }

  // 3. Foreign Currencies:
  // Base USD with silent x2.1 multiplier for non-African visitors
  const multiplier = isAfrican ? 1.0 : NON_AFRICAN_MULTIPLIER;
  const effectiveUsd = base.usdBase * multiplier;

  let localPrice = effectiveUsd * USD_FX_RATES[currency];

  // Clean rounding
  if (currency === "USD") {
    // e.g. 10 * 2.1 = 21, 23 * 2.1 = 48.3 -> 49, 57 * 2.1 = 119.7 -> 119
    localPrice = roundToCleanTier(localPrice);
  } else if (currency === "EUR") {
    localPrice = roundToCleanTier(localPrice);
  } else if (currency === "CNY") {
    localPrice = Math.round(localPrice / 10) * 10 - 1; // e.g. 149, 349, 849
    if (localPrice < 10) localPrice = Math.round(localPrice);
  } else if (currency === "AED") {
    localPrice = Math.round(localPrice);
  }

  const finalAmount =
    billingPeriod === "yearly" ? Math.round(localPrice * 0.8) : Math.round(localPrice);

  return formatCurrencyAmount(finalAmount, currency);
}

function roundToCleanTier(amount: number): number {
  if (amount <= 0) return 0;
  if (amount < 25) return Math.round(amount); // e.g. 21, 19
  if (amount < 60) return Math.round(amount); // e.g. 49, 45
  return Math.round(amount / 5) * 5 - 1; // e.g. 119, 149
}

function formatZeroPrice(currency: SupportedCurrency): string {
  switch (currency) {
    case "NGN":
      return "₦0";
    case "USD":
      return "$0";
    case "EUR":
      return "0 €";
    case "CNY":
      return "¥0";
    case "AED":
      return "0 AED";
    default:
      return "$0";
  }
}

export function formatCurrencyAmount(amount: number, currency: SupportedCurrency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  switch (currency) {
    case "NGN":
      return `₦${amount.toLocaleString("en-NG")}`;
    case "USD":
      return `$${amount.toLocaleString("en-US")}`;
    case "EUR":
      return `€${amount.toLocaleString("de-DE")}`;
    case "CNY":
      return `¥${amount.toLocaleString("zh-CN")}`;
    case "AED":
      return `${amount.toLocaleString("ar-AE")} د.إ`;
    default:
      return `${symbol}${amount}`;
  }
}
