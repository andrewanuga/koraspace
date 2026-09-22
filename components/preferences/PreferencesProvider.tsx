"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTheme } from "next-themes";
import {
  DEFAULT_PREFERENCES,
  type UserPreferences,
  type AnalyticsStyle,
  type FontFamily,
  type ThemeMode,
  type DashboardDensity,
} from "@/lib/preferences/types";

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (partial: Partial<UserPreferences>) => Promise<boolean>;
  loading: boolean;
  resolvedTheme: "dark" | "light";
  setAnalyticsStyle: (style: AnalyticsStyle) => Promise<boolean>;
  setFontFamily: (font: FontFamily) => Promise<boolean>;
  setThemeMode: (theme: ThemeMode) => Promise<boolean>;
  setDashboardDensity: (density: DashboardDensity) => Promise<boolean>;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

const STORAGE_KEY = "koraspace_user_preferences";

export function PreferencesProvider({
  children,
  initialPreferences,
}: {
  children: React.ReactNode;
  initialPreferences?: Partial<UserPreferences>;
}) {
  const { theme: nextTheme, setTheme, resolvedTheme: nextResolvedTheme } = useTheme();
  
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        const storedNextTheme = localStorage.getItem("theme") as ThemeMode | null;
        const base = cached ? JSON.parse(cached) : {};
        return {
          ...DEFAULT_PREFERENCES,
          ...base,
          ...(storedNextTheme ? { theme_mode: storedNextTheme } : {}),
          ...initialPreferences,
        };
      } catch {
        // ignore storage parse errors
      }
    }
    return { ...DEFAULT_PREFERENCES, ...initialPreferences };
  });

  const [loading, setLoading] = useState(true);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  // Apply font, density, and analytics dataset attributes to document root
  const applyDOMAttributes = useCallback((prefs: UserPreferences) => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    root.dataset.font = prefs.font_family;
    root.dataset.density = prefs.dashboard_density;
    root.dataset.analyticsStyle = prefs.analytics_style;

    // Resolve active theme
    let isDark = true;
    if (prefs.theme_mode === "light") {
      isDark = false;
    } else if (prefs.theme_mode === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    setResolvedTheme(isDark ? "dark" : "light");
    root.dataset.theme = isDark ? "dark" : "light";
  }, []);

  // Synchronize state when next-themes changes (e.g. from FloatingNav or ThemeSwitcher or OnboardingFlow)
  useEffect(() => {
    if (nextTheme && (nextTheme === "dark" || nextTheme === "light" || nextTheme === "system")) {
      setPreferences((prev) => {
        if (prev.theme_mode === nextTheme) return prev;
        const updated: UserPreferences = { ...prev, theme_mode: nextTheme as ThemeMode };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        applyDOMAttributes(updated);
        return updated;
      });
    }
  }, [nextTheme, applyDOMAttributes]);

  // Initial load from server API
  useEffect(() => {
    let active = true;

    async function fetchPreferences() {
      try {
        const res = await fetch("/api/preferences");
        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.preferences && active) {
            setPreferences((prev) => {
              // Prioritize user's active client-side theme selection over server initial default
              const localStoredTheme =
                typeof window !== "undefined"
                  ? (localStorage.getItem("theme") as ThemeMode | null)
                  : null;
              const effectiveTheme =
                localStoredTheme && (localStoredTheme === "dark" || localStoredTheme === "light" || localStoredTheme === "system")
                  ? localStoredTheme
                  : json.preferences.theme_mode || prev.theme_mode;

              const updated: UserPreferences = {
                ...prev,
                ...json.preferences,
                theme_mode: effectiveTheme,
              };

              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              } catch {}

              applyDOMAttributes(updated);

              // Only call next-themes setTheme if user hasn't explicitly set one locally
              if (json.preferences.theme_mode && !localStoredTheme) {
                try {
                  setTheme(json.preferences.theme_mode);
                } catch {}
              }

              return updated;
            });
          }
        }
      } catch {
        // Offline or unauthorized, keep current state
      } finally {
        if (active) setLoading(false);
      }
    }

    applyDOMAttributes(preferences);
    fetchPreferences();

    return () => {
      active = false;
    };
  }, [applyDOMAttributes, setTheme]);

  // Listen for system appearance change if theme is set to 'system'
  useEffect(() => {
    if (typeof window === "undefined" || preferences.theme_mode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      applyDOMAttributes(preferences);
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [preferences, applyDOMAttributes]);

  const updatePreferences = useCallback(
    async (partial: Partial<UserPreferences>): Promise<boolean> => {
      const nextPrefs: UserPreferences = {
        ...preferences,
        ...partial,
      };

      // Optimistic update
      setPreferences(nextPrefs);
      applyDOMAttributes(nextPrefs);
      
      if (partial.theme_mode) {
        try {
          setTheme(partial.theme_mode);
        } catch {}
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPrefs));
      } catch {}

      try {
        const res = await fetch("/api/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partial),
        });

        if (!res.ok) {
          console.warn("Failed to persist preferences to server");
          return false;
        }

        const data = await res.json();
        if (data.ok && data.preferences) {
          setPreferences((current) => ({ ...current, ...data.preferences }));
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...nextPrefs, ...data.preferences }));
          } catch {}
        }
        return true;
      } catch (err) {
        console.error("Network error saving preferences:", err);
        return false;
      }
    },
    [preferences, applyDOMAttributes, setTheme]
  );

  const setAnalyticsStyle = useCallback(
    (style: AnalyticsStyle) => updatePreferences({ analytics_style: style }),
    [updatePreferences]
  );

  const setFontFamily = useCallback(
    (font: FontFamily) => updatePreferences({ font_family: font }),
    [updatePreferences]
  );

  const setThemeMode = useCallback(
    (theme: ThemeMode) => updatePreferences({ theme_mode: theme }),
    [updatePreferences]
  );

  const setDashboardDensity = useCallback(
    (density: DashboardDensity) => updatePreferences({ dashboard_density: density }),
    [updatePreferences]
  );

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        loading,
        resolvedTheme: (nextResolvedTheme as "dark" | "light") || resolvedTheme,
        setAnalyticsStyle,
        setFontFamily,
        setThemeMode,
        setDashboardDensity,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    return {
      preferences: DEFAULT_PREFERENCES,
      updatePreferences: async () => false,
      loading: false,
      resolvedTheme: "dark" as const,
      setAnalyticsStyle: async () => false,
      setFontFamily: async () => false,
      setThemeMode: async () => false,
      setDashboardDensity: async () => false,
    };
  }
  return context;
}
