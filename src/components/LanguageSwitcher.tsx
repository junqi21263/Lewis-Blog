"use client";

import Link from "next/link";
import { useEffect } from "react";
import { localeCookieName, localeStorageKey, locales, localeLabel, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
  onSelect?: () => void;
};

export default function LanguageSwitcher({ className, onSelect }: LanguageSwitcherProps) {
  const { locale, switchPath } = useI18n();

  useEffect(() => {
    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem(localeStorageKey, locale);
  }, [locale]);

  function persistLocale(nextLocale: Locale) {
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem(localeStorageKey, nextLocale);
    onSelect?.();
  }

  return (
    <div
      aria-label="Language switcher"
      className={cn("inline-flex items-center rounded-full border border-outline-variant/20 bg-surface-container-lowest/50 p-1", className)}
      role="group"
    >
      {locales.map((item) => {
        const active = item === locale;
        return (
          <Link
            key={item}
            aria-label={localeLabel(item)}
            className={cn(
              "min-w-11 rounded-full px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.24em] transition duration-200",
              active
                ? "bg-primary text-background"
                : "text-on-surface-variant hover:border-outline-variant/40 hover:text-on-background",
            )}
            href={switchPath(item)}
            onClick={() => persistLocale(item)}
          >
            {item === "zh-CN" ? "简" : item === "zh-TW" ? "繁" : "EN"}
          </Link>
        );
      })}
    </div>
  );
}
