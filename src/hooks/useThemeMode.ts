"use client";

import { useCallback, useEffect, useState } from "react";

export function useThemeMode(defaultDark = true) {
  const [isDark, setIsDark] = useState(defaultDark);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const nextIsDark = storedTheme ? storedTheme === "dark" : defaultDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    setIsDark(nextIsDark);
  }, [defaultDark]);

  const applyTheme = useCallback((nextIsDark: boolean) => {
    document.documentElement.classList.toggle("dark", nextIsDark);
    window.localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    setIsDark(nextIsDark);
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(!isDark);
  }, [applyTheme, isDark]);

  return {
    isDark,
    setTheme: applyTheme,
    toggleTheme,
  };
}
