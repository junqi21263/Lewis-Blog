import type { Locale } from "@/i18n/config";

export type FooterContentFields = {
  brand: string;
  description: string;
  copyright: string;
  location: string;
};

export type FooterJson = Partial<Record<Locale, Partial<FooterContentFields>>>;

const footerLocales = ["zh-CN", "zh-TW", "en-US"] as const satisfies Locale[];
const footerFields = ["brand", "description", "copyright", "location"] as const satisfies Array<keyof FooterContentFields>;

export const defaultFooterJson = {
  "zh-CN": {
    brand: "Lewis.",
    description: "关于旅行、摄影、影像与安静写作的个人归档。",
    copyright: "© 2026 Lewis Lee.",
    location: "Guangzhou · China",
  },
  "zh-TW": {
    brand: "Lewis.",
    description: "關於旅行、攝影、影像與安靜寫作的個人歸檔。",
    copyright: "© 2026 Lewis Lee.",
    location: "Guangzhou · China",
  },
  "en-US": {
    brand: "Lewis.",
    description: "A personal archive for travel, photography, moving images, and quiet writing.",
    copyright: "© 2026 Lewis Lee.",
    location: "Guangzhou · China",
  },
} as const satisfies Record<Locale, FooterContentFields>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringField(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function normalizeFooterJson(value: unknown): Record<Locale, FooterContentFields> {
  const source = typeof value === "string" ? safeParseJson(value) : value;
  const sourceRecord = isRecord(source) ? source : {};

  return Object.fromEntries(
    footerLocales.map((locale) => {
      const rawLocale = sourceRecord[locale];
      const rawFields = isRecord(rawLocale) ? rawLocale : {};
      const fields = Object.fromEntries(
        footerFields.map((field) => [field, stringField(rawFields[field])]),
      ) as FooterContentFields;
      return [locale, fields];
    }),
  ) as Record<Locale, FooterContentFields>;
}

export function resolveFooterContent(footerJson: FooterJson | null | undefined, locale: Locale): FooterContentFields {
  const normalized = normalizeFooterJson(footerJson);
  const chain = locale === "zh-CN" ? ["zh-CN", "en-US"] : locale === "zh-TW" ? ["zh-TW", "zh-CN", "en-US"] : ["en-US", "zh-CN"];

  return Object.fromEntries(
    footerFields.map((field) => {
      for (const candidate of chain) {
        const value = normalized[candidate as Locale]?.[field]?.trim();
        if (value) {
          return [field, value];
        }
      }
      return [field, defaultFooterJson[locale][field] || defaultFooterJson["zh-CN"][field]];
    }),
  ) as FooterContentFields;
}

function safeParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return {};
  }
}
