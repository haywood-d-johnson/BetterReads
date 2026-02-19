import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "betterreads_theme";

function getInitialTheme() {
  // Try localStorage first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  // Fall back to system preference
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return { theme, toggleTheme };
}
