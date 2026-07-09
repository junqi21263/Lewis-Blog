import { defaultLocale, fallbackLocaleChain, type Locale } from "@/i18n/config";

export type LocalizedTextMap = Partial<Record<Locale, string>>;
export type LocalizedTextArrayMap = Partial<Record<Locale, string[]>>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseLocalizedText(value: unknown): LocalizedTextMap {
  if (typeof value === "string") {
    try {
      return parseLocalizedText(JSON.parse(value));
    } catch {
      return {};
    }
  }

  if (!isPlainObject(value)) {
    return {};
  }

  const entries = Object.entries(value).filter(
    (entry): entry is [Locale, string] =>
      (entry[0] === "zh-CN" || entry[0] === "zh-TW" || entry[0] === "en-US") && typeof entry[1] === "string",
  );

  return Object.fromEntries(entries);
}

export function stringifyLocalizedText(value: LocalizedTextMap) {
  return JSON.stringify(value);
}

export function parseLocalizedTextArray(value: unknown): LocalizedTextArrayMap {
  if (typeof value === "string") {
    try {
      return parseLocalizedTextArray(JSON.parse(value));
    } catch {
      return {};
    }
  }

  if (!isPlainObject(value)) {
    return {};
  }

  const result: LocalizedTextArrayMap = {};
  for (const locale of ["zh-CN", "zh-TW", "en-US"] as const) {
    const raw = value[locale];
    if (!Array.isArray(raw)) {
      continue;
    }
    result[locale] = raw.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  }
  return result;
}

export function stringifyLocalizedTextArray(value: LocalizedTextArrayMap) {
  return JSON.stringify(value);
}

export function resolveLocalizedText(localized: LocalizedTextMap | null | undefined, locale: Locale, raw = "") {
  const map = localized ?? {};
  for (const candidate of fallbackLocaleChain(locale)) {
    const value = map[candidate];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  if (raw.trim()) {
    return raw;
  }
  for (const candidate of fallbackLocaleChain(defaultLocale)) {
    const value = map[candidate];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return raw;
}

export function resolveLocalizedTextArray(localized: LocalizedTextArrayMap | null | undefined, locale: Locale, raw: string[] = []) {
  const map = localized ?? {};
  for (const candidate of fallbackLocaleChain(locale)) {
    const value = map[candidate];
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }
  }
  return raw;
}

export function createSourceLocalizedText(source: string) {
  return source ? { "zh-CN": source } satisfies LocalizedTextMap : {};
}

export function ensureLocalizedText(localized: LocalizedTextMap | null | undefined, raw = "") {
  const map = { ...(localized ?? {}) };
  if (!map["zh-CN"] && raw) {
    map["zh-CN"] = raw;
  }
  return map;
}
