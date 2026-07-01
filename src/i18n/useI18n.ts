"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import {
  defaultLocale,
  localeFromPathname,
  localeLabel,
  switchLocalePath,
  type Locale,
} from "@/i18n/config";

export function useI18n(localeOverride?: Locale) {
  const pathname = usePathname();
  const locale = localeOverride ?? (pathname ? localeFromPathname(pathname) : defaultLocale);
  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  return {
    locale,
    dictionary,
    languageName: localeLabel(locale),
    switchPath: (nextLocale: Locale) =>
      switchLocalePath(pathname || "/", nextLocale, typeof window === "undefined" ? "" : window.location.search),
  };
}
