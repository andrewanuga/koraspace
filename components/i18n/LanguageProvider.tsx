"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  SupportedLocale,
  SupportedCurrency,
  SUPPORTED_LOCALES,
  TranslationDictionary,
} from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { detectClientGeo } from "@/lib/i18n/geo";
import { calculatePlanPrice, PlanKey } from "@/lib/i18n/pricing";

interface LanguageContextType {
  locale: SupportedLocale;
  currency: SupportedCurrency;
  isAfrican: boolean;
  isRTL: boolean;
  t: TranslationDictionary;
  setLocale: (locale: SupportedLocale) => void;
  setCurrency: (currency: SupportedCurrency) => void;
  formatPlanPrice: (planKey: PlanKey, billingPeriod?: "monthly" | "yearly") => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("en-NG");
  const [currency, setCurrencyState] = useState<SupportedCurrency>("NGN");
  const [isAfrican, setIsAfricanState] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Detect geo & saved preferences
    const detected = detectClientGeo();
    setLocaleState(detected.locale);
    setCurrencyState(detected.currency);
    setIsAfricanState(detected.isAfrican);

    // Optional: Fetch server geo endpoint asynchronously to refine
    fetch("/api/geo")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.isAfrican === "boolean" && !localStorage.getItem("koraspace_is_african")) {
          setIsAfricanState(data.isAfrican);
        }
      })
      .catch(() => {
        // ignore network error
      });

    setMounted(true);
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("koraspace_locale", newLocale);
    } catch {
      // ignore
    }

    // Auto-update currency to locale's default currency if user hasn't explicitly locked currency
    const targetLocaleInfo = SUPPORTED_LOCALES[newLocale];
    if (targetLocaleInfo) {
      setCurrencyState(targetLocaleInfo.defaultCurrency);
      try {
        localStorage.setItem("koraspace_currency", targetLocaleInfo.defaultCurrency);
      } catch {
        // ignore
      }

      if (targetLocaleInfo.defaultIsAfrican !== undefined) {
        setIsAfricanState(targetLocaleInfo.defaultIsAfrican);
        try {
          localStorage.setItem("koraspace_is_african", String(targetLocaleInfo.defaultIsAfrican));
        } catch {
          // ignore
        }
      }
    }
  };

  const setCurrency = (newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem("koraspace_currency", newCurrency);
    } catch {
      // ignore
    }
  };

  const isRTL = Boolean(SUPPORTED_LOCALES[locale]?.isRTL);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
    }
  }, [locale, isRTL]);

  const dictionary = getDictionary(locale);

  const formatPrice = (planKey: PlanKey, billingPeriod: "monthly" | "yearly" = "monthly") => {
    return calculatePlanPrice(planKey, currency, isAfrican, billingPeriod);
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        currency,
        isAfrican,
        isRTL,
        t: dictionary,
        setLocale,
        setCurrency,
        formatPlanPrice: formatPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
