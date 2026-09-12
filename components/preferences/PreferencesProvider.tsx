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
  const { setTheme } = useTheme();
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          return { ...DEFAULT_PREFERENCES, ...JSON.parse(cached), ...initialPreferences };
        }
      } catch {
        // ignore storage parse errors
      }
    }
    return { ...DEFAULT_PREFERENCES, ...initialPreferences };
  });

  const [loading, setLoading] = useState(true);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  // Apply font and density dataset attributes to document root
  const applyDOMAttributes = useCallback((prefs: UserPreferences) => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    root.dataset.font = prefs.font_family;
    root.dataset.density = prefs.dashboard_density;
    root.dataset.analyticsStyle = prefs.analytics_style;

    // Resolve system theme if needed
    let isDark = true;
    if (prefs.theme_mode === "light") {
      isDark = false;
    } else if (prefs.theme_mode === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    setResolvedTheme(isDark ? "dark" : "light");

    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
      root.dataset.theme = "dark";
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      root.dataset.theme = "light";
    }

    try {
      setTheme(prefs.theme_mode);
    } catch {
      // next-themes may not always be mounted
    }
  }, [setTheme]);

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
              const updated = { ...prev, ...json.preferences };
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              } catch {}
              applyDOMAttributes(updated);
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
  }, [applyDOMAttributes]);

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
    [preferences, applyDOMAttributes]
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
        resolvedTheme,
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
