"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  defaultLocale,
  localeCookieName,
  localeStorageKey,
  localeToSegment,
  locales,
  type Locale,
} from "@/i18n/config";

function localeFromBrowser(): Locale {
  const languages = typeof navigator === "undefined" ? [] : navigator.languages;
  for (const language of languages) {
    const normalized = language.toLowerCase();
    if (normalized.startsWith("zh-tw") || normalized.startsWith("zh-hk")) {
      return "zh-TW";
    }
    if (normalized.startsWith("zh")) {
      return "zh-CN";
    }
    if (normalized.startsWith("en")) {
      return "en-US";
    }
  }
  return defaultLocale;
}

function localeFromCookie() {
  if (typeof document === "undefined") return "";
  const entry = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${localeCookieName}=`));
  return entry?.split("=")[1] ?? "";
}

export default function LocaleRedirect() {
  const router = useRouter();

  useEffect(() => {
    const stored = window.localStorage.getItem(localeStorageKey);
    const cookie = localeFromCookie();
    const candidate = [cookie, stored, localeFromBrowser()].find((value): value is Locale => locales.includes(value as Locale)) ?? defaultLocale;
    const nextPath = `/${localeToSegment(candidate)}/`;
    document.cookie = `${localeCookieName}=${candidate}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem(localeStorageKey, candidate);
    router.replace(nextPath);
  }, [router]);

  return (
    <div className="editorial-shell flex min-h-[calc(100vh-18rem)] items-center pb-28">
      <div>
        <p className="label-mono mb-6">Language</p>
        <h1 className="font-serif text-display-lg text-on-background md:text-display-xl">Loading your preferred edition.</h1>
      </div>
    </div>
  );
}
