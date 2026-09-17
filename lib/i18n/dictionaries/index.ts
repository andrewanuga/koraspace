import { SupportedLocale, TranslationDictionary } from "../types";
import { enNG } from "./en-NG";
import { enUS } from "./en-US";
import { es } from "./es";
import { zh } from "./zh";
import { ar } from "./ar";
import { fr } from "./fr";
import { nl } from "./nl";

export const DICTIONARIES: Record<SupportedLocale, TranslationDictionary> = {
  "en-NG": enNG,
  "en-US": enUS,
  es,
  zh,
  ar,
  fr,
  nl,
};

export function getDictionary(locale: SupportedLocale): TranslationDictionary {
  return DICTIONARIES[locale] || DICTIONARIES["en-US"] || DICTIONARIES["en-NG"];
}
