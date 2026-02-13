"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContext = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const Ctx = createContext<ThemeContext>({ theme: "system", setTheme: () => {} });

export function useTheme() {
  return useContext(Ctx);
}

// Keep this in sync with `apps/web/public/theme-init.js` (used to prevent FOUC).
const STORAGE_KEY = "orbital-theme";

function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // Ignore storage read failures (e.g. blocked storage in private mode).
  }
  return null;
}

function persistTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore storage write failures and still apply the theme in-memory.
  }
}

function prefersDarkScheme(): boolean {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  if (theme === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else if (theme === "light") {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  } else {
    const prefersDark = prefersDarkScheme();
    root.classList.toggle("dark", prefersDark);
    root.style.colorScheme = prefersDark ? "dark" : "light";
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    const stored = readStoredTheme();
    if (stored) {
      setThemeState(stored);
      applyThemeClass(stored);
    } else {
      applyThemeClass("system");
    }
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyThemeClass("system");
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    if (typeof mq.addListener === "function") {
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
    return;
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    persistTheme(next);
    applyThemeClass(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
