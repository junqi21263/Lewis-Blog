import { resolveLocalizedText, type LocalizedTextMap } from "@/i18n/content";
import type { Locale } from "@/i18n/config";

export type HomepageContentFields = {
  heroEyebrow: string;
  heroHeadline: string;
  journalEyebrow: string;
  journalHeadline: string;
  galleryEyebrow: string;
  galleryHeadline: string;
  latestEyebrow: string;
  latestHeadline: string;
  latestCta: string;
};

export type HomepageJson = Record<Locale, HomepageContentFields>;

export const homepageContentFields = [
  "heroEyebrow",
  "heroHeadline",
  "journalEyebrow",
  "journalHeadline",
  "galleryEyebrow",
  "galleryHeadline",
  "latestEyebrow",
  "latestHeadline",
  "latestCta",
] as const satisfies ReadonlyArray<keyof HomepageContentFields>;

export const defaultHomepageJson: HomepageJson = {
  "zh-CN": {
    heroEyebrow: "Lewis Photograph Blog - 个人归档",
    heroHeadline: "关于北方道路、房间与影像的安静笔记。",
    journalEyebrow: "文章 - 编辑归档",
    journalHeadline: "旅行记录、城市观察与影像笔记。",
    galleryEyebrow: "影像归档",
    galleryHeadline: "精选影像",
    latestEyebrow: "最新文章",
    latestHeadline: "最新文章",
    latestCta: "查看全部文章",
  },
  "zh-TW": {
    heroEyebrow: "Lewis Photograph Blog - 個人歸檔",
    heroHeadline: "關於北方道路、房間與影像的安靜筆記。",
    journalEyebrow: "文章 - 編輯歸檔",
    journalHeadline: "旅行記錄、城市觀察與影像筆記。",
    galleryEyebrow: "影像歸檔",
    galleryHeadline: "精選影像",
    latestEyebrow: "最新文章",
    latestHeadline: "最新文章",
    latestCta: "查看全部文章",
  },
  "en-US": {
    heroEyebrow: "Lewis Photograph Blog - Personal Archive",
    heroHeadline: "Quiet notes on northern roads, rooms, and images.",
    journalEyebrow: "Journal - Editorial Archive",
    journalHeadline: "Travel notes, city observations, and photographic essays.",
    galleryEyebrow: "Image Archive",
    galleryHeadline: "Featured Images",
    latestEyebrow: "Latest Articles",
    latestHeadline: "Latest Articles",
    latestCta: "View all articles",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringField(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

export function normalizeHomepageJson(value: unknown): HomepageJson {
  const source = isRecord(value) ? value : {};

  return Object.fromEntries(
    (Object.keys(defaultHomepageJson) as Locale[]).map((locale) => {
      const rawLocale = source[locale];
      const rawFields = isRecord(rawLocale) ? rawLocale : {};
      const fields = Object.fromEntries(
        homepageContentFields.map((field) => [field, stringField(rawFields[field], defaultHomepageJson[locale][field])]),
      ) as HomepageContentFields;
      return [locale, fields];
    }),
  ) as HomepageJson;
}

export function resolveHomepageContent(homepageJson: unknown, locale: Locale): HomepageContentFields {
  const normalized = normalizeHomepageJson(homepageJson);
  const source = normalized["zh-CN"];

  return Object.fromEntries(
    homepageContentFields.map((field) => {
      const localizedMap: LocalizedTextMap = {
        "zh-CN": source[field],
        "zh-TW": normalized["zh-TW"][field],
        "en-US": normalized["en-US"][field],
      };
      return [field, resolveLocalizedText(localizedMap, locale, source[field])];
    }),
  ) as HomepageContentFields;
}
