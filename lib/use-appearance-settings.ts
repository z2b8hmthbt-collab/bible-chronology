"use client";

import { useEffect, useState, useCallback } from "react";

export type AppTheme = "modern" | "parchment";

const THEME_KEY = "timeline-theme";

export function useAppearanceSettings() {
  const [theme, setThemeState] = useState<AppTheme>("modern");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_KEY);
      if (storedTheme === "modern" || storedTheme === "parchment") {
        setThemeState(storedTheme);
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, loaded]);

  const setTheme = useCallback((next: AppTheme) => {
    setThemeState(next);
    localStorage.setItem(THEME_KEY, next);
  }, []);

  return {
    theme,
    setTheme,
    loaded,
  };
}

export type AppearanceSettings = ReturnType<typeof useAppearanceSettings>;
