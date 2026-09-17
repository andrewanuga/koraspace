import { SupportedLocale, SupportedCurrency, SUPPORTED_LOCALES } from "./types";

// List of African country ISO codes
export const AFRICAN_COUNTRY_CODES = new Set([
  "NG", // Nigeria
  "GH", // Ghana
  "KE", // Kenya
  "ZA", // South Africa
  "EG", // Egypt
  "RW", // Rwanda
  "SN", // Senegal
  "CI", // Côte d'Ivoire
  "TZ", // Tanzania
  "UG", // Uganda
  "CM", // Cameroon
  "ET", // Ethiopia
  "MA", // Morocco
  "DZ", // Algeria
  "TN", // Tunisia
  "AO", // Angola
  "ZM", // Zambia
  "ZW", // Zimbabwe
  "BW", // Botswana
  "NA", // Namibia
  "MU", // Mauritius
  "MZ", // Mozambique
  "MW", // Malawi
  "BJ", // Benin
  "TG", // Togo
  "BF", // Burkina Faso
  "NE", // Niger
  "ML", // Mali
  "GN", // Guinea
  "SL", // Sierra Leone
  "LR", // Liberia
  "GM", // Gambia
  "GA", // Gabon
  "CG", // Congo
  "CD", // DR Congo
  "MG", // Madagascar
  "SC", // Seychelles
  "CV", // Cape Verde
]);

// African timezones heuristics
export const AFRICAN_TIMEZONES = [
  "Africa/Lagos",
  "Africa/Accra",
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Africa/Casablanca",
  "Africa/Kigali",
  "Africa/Dakar",
  "Africa/Abidjan",
  "Africa/Dar_es_Salaam",
  "Africa/Kampala",
  "Africa/Douala",
  "Africa/Addis_Ababa",
  "Africa/Algiers",
  "Africa/Tunis",
  "Africa/Luanda",
  "Africa/Lusaka",
  "Africa/Harare",
  "Africa/Gaborone",
  "Africa/Windhoek",
  "Africa/Maputo",
  "Africa/Blantyre",
  "Africa/Porto-Novo",
  "Africa/Lome",
  "Africa/Ouagadougou",
  "Africa/Niamey",
  "Africa/Bamako",
  "Africa/Conakry",
  "Africa/Freetown",
  "Africa/Monrovia",
  "Africa/Banjul",
  "Africa/Libreville",
  "Africa/Brazzaville",
  "Africa/Kinshasa",
  "Africa/Lubumbashi",
];

export interface GeoDetectionResult {
  locale: SupportedLocale;
  currency: SupportedCurrency;
  isAfrican: boolean;
  countryCode?: string;
  source: "cookie" | "storage" | "header" | "timezone" | "browser" | "default";
}

/**
 * Checks if a country code or timezone corresponds to an African country
 */
export function isAfricanGeo(countryCode?: string | null, timezone?: string | null): boolean {
  if (countryCode && AFRICAN_COUNTRY_CODES.has(countryCode.toUpperCase())) {
    return true;
  }
  if (timezone && (timezone.startsWith("Africa/") || AFRICAN_TIMEZONES.includes(timezone))) {
    return true;
  }
  return false;
}

/**
 * Detect client locale and region on browser
 */
export function detectClientGeo(): GeoDetectionResult {
  if (typeof window === "undefined") {
    return {
      locale: "en-NG",
      currency: "NGN",
      isAfrican: true,
      source: "default",
    };
  }

  // 1. Check localStorage first
  try {
    const savedLocale = localStorage.getItem("koraspace_locale") as SupportedLocale | null;
    const savedCurrency = localStorage.getItem("koraspace_currency") as SupportedCurrency | null;
    const savedIsAfrican = localStorage.getItem("koraspace_is_african");

    if (savedLocale && SUPPORTED_LOCALES[savedLocale]) {
      const isAfrican =
        savedIsAfrican !== null
          ? savedIsAfrican === "true"
          : (SUPPORTED_LOCALES[savedLocale].defaultIsAfrican ?? false);

      return {
        locale: savedLocale,
        currency: savedCurrency || SUPPORTED_LOCALES[savedLocale].defaultCurrency,
        isAfrican,
        source: "storage",
      };
    }
  } catch {
    // ignore
  }

  // 2. Check timezone
  let tz: string | undefined;
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // ignore
  }

  const isAfrican = isAfricanGeo(null, tz);

  // If in Nigeria or West Africa
  if (tz === "Africa/Lagos" || tz === "Africa/Accra") {
    return {
      locale: "en-NG",
      currency: "NGN",
      isAfrican: true,
      source: "timezone",
    };
  }

  // 3. Check browser languages
  const navLangs = navigator.languages || [navigator.language || ""];
  const langStr = navLangs.join(",").toLowerCase();

  if (langStr.includes("es")) {
    return {
      locale: "es",
      currency: "EUR",
      isAfrican,
      source: "browser",
    };
  }
  if (langStr.includes("zh")) {
    return {
      locale: "zh",
      currency: "CNY",
      isAfrican,
      source: "browser",
    };
  }
  if (langStr.includes("ar")) {
    return {
      locale: "ar",
      currency: "AED",
      isAfrican,
      source: "browser",
    };
  }
  if (langStr.includes("fr")) {
    return {
      locale: "fr",
      currency: "EUR",
      isAfrican,
      source: "browser",
    };
  }
  if (langStr.includes("nl")) {
    return {
      locale: "nl",
      currency: "EUR",
      isAfrican,
      source: "browser",
    };
  }

  // If in Africa and English
  if (isAfrican) {
    return {
      locale: "en-NG",
      currency: "NGN",
      isAfrican: true,
      source: "timezone",
    };
  }

  // Default international visitor (US English + USD + x2.1 non-African pricing)
  return {
    locale: "en-US",
    currency: "USD",
    isAfrican: false,
    source: "default",
  };
}
