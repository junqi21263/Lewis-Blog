import { locales, type Locale } from "@/i18n/config";

export type BrandDisplayMode = "text" | "stackedText" | "imageLogo";

export type BrandContentFields = {
  brandName: string;
  brandDisplayMode: BrandDisplayMode;
  logoText: string;
  logoImageUrl: string;
  logoAlt: string;
  cmsTitle: string;
  cmsSubtitle: string;
};

export type BrandJson = Record<Locale, BrandContentFields>;

export const brandDisplayModes: BrandDisplayMode[] = ["text", "stackedText", "imageLogo"];

export const brandContentFields: Array<keyof BrandContentFields> = [
  "brandName",
  "brandDisplayMode",
  "logoText",
  "logoImageUrl",
  "logoAlt",
  "cmsTitle",
  "cmsSubtitle",
];

const defaultBrandFields: BrandContentFields = {
  brandName: "Lewis Photograph Blog",
  brandDisplayMode: "text",
  logoText: "Lewis.",
  logoImageUrl: "",
  logoAlt: "Lewis Photograph Blog logo",
  cmsTitle: "Lewis Photograph Blog",
  cmsSubtitle: "Editorial CMS",
};

export const defaultBrandJson: BrandJson = {
  "zh-CN": defaultBrandFields,
  "zh-TW": defaultBrandFields,
  "en-US": defaultBrandFields,
};

function normalizeDisplayMode(value: unknown): BrandDisplayMode {
  return brandDisplayModes.includes(value as BrandDisplayMode) ? (value as BrandDisplayMode) : "text";
}

function stringField(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function normalizeBrandFields(value: unknown, fallback: BrandContentFields): BrandContentFields {
  const source = value && typeof value === "object" && !Array.isArray(value) ? (value as Partial<Record<keyof BrandContentFields, unknown>>) : {};

  return {
    brandName: stringField(source.brandName, fallback.brandName),
    brandDisplayMode: normalizeDisplayMode(source.brandDisplayMode ?? fallback.brandDisplayMode),
    logoText: stringField(source.logoText, fallback.logoText),
    logoImageUrl: stringField(source.logoImageUrl, fallback.logoImageUrl),
    logoAlt: stringField(source.logoAlt, fallback.logoAlt),
    cmsTitle: stringField(source.cmsTitle, fallback.cmsTitle),
    cmsSubtitle: stringField(source.cmsSubtitle, fallback.cmsSubtitle),
  };
}

export function normalizeBrandJson(value: unknown): BrandJson {
  const source = value && typeof value === "object" && !Array.isArray(value) ? (value as Partial<Record<Locale, unknown>>) : {};

  return Object.fromEntries(
    locales.map((locale) => {
      const fallback = defaultBrandJson[locale] ?? defaultBrandJson["zh-CN"];
      return [locale, normalizeBrandFields(source[locale], fallback)];
    }),
  ) as BrandJson;
}

export function resolveBrandContent(value: unknown, locale: Locale): BrandContentFields {
  const brandJson = normalizeBrandJson(value);
  return brandJson[locale] ?? brandJson["zh-CN"];
}
