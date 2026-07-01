"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/hooks/useThemeMode";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeMode();

  return (
    <button
      aria-label="Toggle theme"
      className="grid size-10 place-items-center rounded-full border border-outline-variant/20 text-on-surface-variant transition duration-500 hover:border-secondary/50 hover:text-secondary"
      type="button"
      onClick={toggleTheme}
    >
      {isDark ? <Sun aria-hidden size={18} strokeWidth={1.6} /> : <Moon aria-hidden size={18} strokeWidth={1.6} />}
    </button>
  );
}
