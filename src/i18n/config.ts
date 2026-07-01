export const localeSegments = {
  "zh-CN": "zh",
  "zh-TW": "tw",
  "en-US": "en",
} as const;

export const segmentLocales = {
  zh: "zh-CN",
  tw: "zh-TW",
  en: "en-US",
} as const;

export type Locale = keyof typeof localeSegments;
export type LocaleSegment = (typeof localeSegments)[Locale];

export const locales = Object.keys(localeSegments) as Locale[];
export const defaultLocale: Locale = "zh-CN";
export const localeCookieName = "noah_locale";
export const localeStorageKey = "noah-locale";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function isLocaleSegment(value: string): value is LocaleSegment {
  return value in segmentLocales;
}

export function localeFromSegment(segment?: string | null): Locale {
  if (segment && isLocaleSegment(segment)) {
    return segmentLocales[segment];
  }
  return defaultLocale;
}

export function localeToSegment(locale: Locale): LocaleSegment {
  return localeSegments[locale];
}

export function localeLabel(locale: Locale) {
  switch (locale) {
    case "zh-CN":
      return "简体中文";
    case "zh-TW":
      return "繁體中文";
    case "en-US":
      return "English";
  }
}

export function fallbackLocaleChain(locale: Locale) {
  const candidates: Locale[] = [locale, "zh-CN", "en-US"];
  return [...new Set(candidates)];
}

export function stripLocalePrefix(pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const [, first, ...rest] = normalized.split("/");
  if (isLocaleSegment(first)) {
    const next = `/${rest.join("/")}`.replace(/\/+/g, "/");
    return next === "/" ? "/" : next.replace(/\/$/, "") || "/";
  }
  return normalized === "/" ? "/" : normalized.replace(/\/$/, "");
}

export function withLocalePrefix(pathname: string, locale: Locale) {
  const normalized = stripLocalePrefix(pathname);
  const path = normalized === "/" ? "" : normalized;
  return `/${localeToSegment(locale)}${path}`.replace(/\/+/g, "/") || `/${localeToSegment(locale)}`;
}

export function switchLocalePath(pathname: string, locale: Locale, search = "") {
  const base = withLocalePrefix(pathname, locale);
  return `${base}${search}`;
}

export function localeFromPathname(pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const [, first] = normalized.split("/");
  return localeFromSegment(first);
}

export function localePath(locale: Locale, pathname = "/") {
  return withLocalePrefix(pathname, locale);
}

export function isLocalizedPath(pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const [, first] = normalized.split("/");
  return isLocaleSegment(first);
}
