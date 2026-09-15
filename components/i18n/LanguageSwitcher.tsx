"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";
import { SupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/types";
import { Globe, Check, ChevronDown } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "default" | "compact" | "minimal";
  className?: string;
}

export function LanguageSwitcher({
  variant = "default",
  className = "",
}: LanguageSwitcherProps) {
  const { locale, setLocale, currency } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentInfo = SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES["en-NG"];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: SupportedLocale) => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div
      className={`relative inline-block text-left ${isOpen ? "z-[999]" : "z-20"} ${className}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Select Language & Currency"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md text-neutral-700 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <span className="text-sm leading-none">{currentInfo.flag}</span>
        {variant !== "minimal" && (
          <>
            <span className="font-semibold">{currentInfo.code.toUpperCase()}</span>
            <span className="text-neutral-400 dark:text-neutral-500">·</span>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-mono">
              {currency}
            </span>
          </>
        )}
        <ChevronDown
          size={13}
          className={`text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl z-[9999] py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800/60 mb-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              <Globe size={12} />
              <span>Language & Currency</span>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-neutral-100/50 dark:divide-neutral-800/40">
            {(Object.keys(SUPPORTED_LOCALES) as SupportedLocale[]).map((code) => {
              const info = SUPPORTED_LOCALES[code];
              const isSelected = code === locale;

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelect(code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{info.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium leading-tight">
                        {info.nativeName}
                      </span>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        {info.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-neutral-500 dark:text-neutral-400">
                      {info.defaultCurrency}
                    </span>
                    {isSelected && <Check size={14} className="text-emerald-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
