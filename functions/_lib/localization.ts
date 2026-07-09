import * as OpenCC from "opencc-js";
import { parseJsonText } from "./api";
import { defaultLocale, localeFromSegment, localeToSegment, type Locale } from "../../src/i18n/config";
import { parseLocalizedText, parseLocalizedTextArray, resolveLocalizedText, resolveLocalizedTextArray, stringifyLocalizedText, stringifyLocalizedTextArray, type LocalizedTextMap } from "../../src/i18n/content";

type DeepSeekEnv = Env & {
  DEEPSEEK_API_KEY?: string;
};

type PostSourceFields = {
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
};

export type PostTranslationField = keyof PostSourceFields;
export type PostLocalizedInput = Partial<Record<Locale, Partial<PostSourceFields>>>;
export type PostTranslationLocks = Partial<Record<Locale, Partial<Record<PostTranslationField, boolean>>>>;

type AboutSourceFields = {
  eyebrow: string;
  headline: string;
  description: string;
  body: string;
  heroImage: string;
  imageAlt: string;
  imageFit: string;
  imagePositionX: string;
  imagePositionY: string;
  imageAspectRatio: string;
  seoTitle: string;
  seoDescription: string;
};

type AboutLocalizedInput = Partial<Record<Locale, Partial<AboutSourceFields>>>;

type GearSourceFields = {
  name: string;
  description: string;
  imageAlt: string;
  tags: string[];
};

type GearTranslationField = keyof GearSourceFields;
type GearLocalizedInput = Partial<Record<Locale, Partial<GearSourceFields>>>;
type GenericTranslationOptions = {
  generateTranslations?: boolean;
  regenerateLocales?: Locale[];
};

type PostLocalizedFields = {
  title_json: string;
  excerpt_json: string;
  content_json: string;
  seo_title_json: string;
  seo_description_json: string;
  warnings: string[];
};

type BuildPostLocalizationOptions = {
  localizedFields?: PostLocalizedInput;
  translationLocks?: PostTranslationLocks;
  regenerateLocales?: Locale[];
  generateTranslations?: boolean;
};

const translationFields = ["title", "excerpt", "content", "seoTitle", "seoDescription"] as const;
const aboutTranslationFields = [
  "eyebrow",
  "headline",
  "description",
  "body",
  "heroImage",
  "imageAlt",
  "imageFit",
  "imagePositionX",
  "imagePositionY",
  "imageAspectRatio",
  "seoTitle",
  "seoDescription",
] as const;
const toTraditionalChinese = OpenCC.Converter({ from: "cn", to: "tw" });

function extractResponseText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.output_text === "string") {
    return record.output_text;
  }

  const output = Array.isArray(record.output) ? record.output : [];
  const parts: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as { content?: unknown[] }).content) ? (item as { content: unknown[] }).content : [];
    for (const block of content) {
      if (!block || typeof block !== "object") continue;
      const text = (block as { text?: unknown }).text;
      if (typeof text === "string") {
        parts.push(text);
      }
    }
  }

  return parts.join("\n").trim();
}

function parseJsonObject<T>(text: string) {
  const normalized = text.trim();
  const fenced = normalized.match(/```json\s*([\s\S]+?)```/i)?.[1] ?? normalized;
  return JSON.parse(fenced) as T;
}

function parseLocalizedStringField(rawFields: Record<string, unknown>, field: Exclude<GearTranslationField, "tags">) {
  const rawValue = rawFields[field];
  return typeof rawValue === "string" ? rawValue : undefined;
}

function parseLocalizedTagsField(rawFields: Record<string, unknown>) {
  const rawValue = rawFields.tags;
  return Array.isArray(rawValue)
    ? rawValue.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : undefined;
}

function resolveLocaleFromHint(value: string | null | undefined) {
  if (!value) {
    return defaultLocale;
  }
  if (value === "zh-CN" || value === "zh-TW" || value === "en-US") {
    return value;
  }
  if (value === "zh" || value === "tw" || value === "en") {
    return localeFromSegment(value);
  }
  return defaultLocale;
}

export function localeFromRequest(request: Request) {
  const url = new URL(request.url);
  return resolveLocaleFromHint(url.searchParams.get("lang"));
}

export function localeFromRoute(context: EventContext<Env, string, unknown>) {
  const value = context.params.locale;
  const segment = Array.isArray(value) ? value[0] : value;
  return resolveLocaleFromHint(segment);
}

export function prefixedPath(locale: Locale, pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${localeToSegment(locale)}${normalized === "/" ? "/" : normalized}`.replace(/\/+/g, "/");
}

export function localizedValue(raw: string | null | undefined, jsonText: string | null | undefined, locale: Locale) {
  return resolveLocalizedText(parseLocalizedText(jsonText), locale, raw ?? "");
}

export function localizePostRecord<T extends Record<string, unknown>>(row: T, locale: Locale) {
  return {
    ...row,
    title: localizedValue(typeof row.title === "string" ? row.title : "", typeof row.title_json === "string" ? row.title_json : null, locale),
    excerpt: localizedValue(typeof row.excerpt === "string" ? row.excerpt : "", typeof row.excerpt_json === "string" ? row.excerpt_json : null, locale),
    content: localizedValue(typeof row.content === "string" ? row.content : "", typeof row.content_json === "string" ? row.content_json : null, locale),
    seo_title: localizedValue(typeof row.seo_title === "string" ? row.seo_title : "", typeof row.seo_title_json === "string" ? row.seo_title_json : null, locale),
    seo_description: localizedValue(
      typeof row.seo_description === "string" ? row.seo_description : "",
      typeof row.seo_description_json === "string" ? row.seo_description_json : null,
      locale,
    ),
  };
}

function mergeLocalized(base: LocalizedTextMap, locale: Locale, value: string) {
  return { ...base, [locale]: value };
}

function traditionalized(source: PostSourceFields) {
  return {
    title: toTraditionalChinese(source.title),
    excerpt: toTraditionalChinese(source.excerpt),
    content: toTraditionalChinese(source.content),
    seoTitle: toTraditionalChinese(source.seoTitle),
    seoDescription: toTraditionalChinese(source.seoDescription),
  };
}

function traditionalizeStringArray(values: string[]) {
  return values.map((value) => toTraditionalChinese(value));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeLocalizedInput(value: unknown): PostLocalizedInput {
  if (!isPlainObject(value)) {
    return {};
  }

  const result: PostLocalizedInput = {};
  for (const locale of ["zh-CN", "zh-TW", "en-US"] as const) {
    const rawFields = value[locale];
    if (!isPlainObject(rawFields)) {
      continue;
    }
    result[locale] = {};
    for (const field of translationFields) {
      const rawValue = rawFields[field];
      if (typeof rawValue === "string") {
        result[locale]![field] = rawValue;
      }
    }
  }
  return result;
}

function normalizeTranslationLocks(value: unknown): PostTranslationLocks {
  if (!isPlainObject(value)) {
    return {};
  }

  const result: PostTranslationLocks = {};
  for (const locale of ["zh-TW", "en-US"] as const) {
    const rawFields = value[locale];
    if (!isPlainObject(rawFields)) {
      continue;
    }
    result[locale] = {};
    for (const field of translationFields) {
      if (typeof rawFields[field] === "boolean") {
        result[locale]![field] = rawFields[field];
      }
    }
  }
  return result;
}

function normalizeRegenerateLocales(value: unknown): Locale[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is Locale => item === "zh-TW" || item === "en-US");
}

export function parsePostLocalizationPayload(body: Record<string, unknown>) {
  return {
    localizedFields: normalizeLocalizedInput(body.localized_fields),
    translationLocks: normalizeTranslationLocks(body.translation_locks),
    regenerateLocales: normalizeRegenerateLocales(body.regenerate_locales),
  };
}

export function parseAboutLocalizationPayload(body: Record<string, unknown>) {
  const localizedFields = body.localized_fields;
  const result: AboutLocalizedInput = {};
  if (isPlainObject(localizedFields)) {
    for (const locale of ["zh-CN", "zh-TW", "en-US"] as const) {
      const rawFields = localizedFields[locale];
      if (!isPlainObject(rawFields)) continue;
      result[locale] = {};
      for (const field of aboutTranslationFields) {
        if (typeof rawFields[field] === "string") {
          result[locale]![field] = rawFields[field];
        }
      }
    }
  }
  return result;
}

export function parseGearLocalizationPayload(body: Record<string, unknown>) {
  const localizedFields = body.localized_fields;
  const result: GearLocalizedInput = {};
  if (isPlainObject(localizedFields)) {
    for (const locale of ["zh-CN", "zh-TW", "en-US"] as const) {
      const rawFields = localizedFields[locale];
      if (!isPlainObject(rawFields)) continue;
      result[locale] = {};
      const name = parseLocalizedStringField(rawFields, "name");
      const description = parseLocalizedStringField(rawFields, "description");
      const imageAlt = parseLocalizedStringField(rawFields, "imageAlt");
      const tags = parseLocalizedTagsField(rawFields);
      if (name != null) result[locale]!.name = name;
      if (description != null) result[locale]!.description = description;
      if (imageAlt != null) result[locale]!.imageAlt = imageAlt;
      if (tags != null) result[locale]!.tags = tags;
    }
  }
  return result;
}

function lockValue(locks: PostTranslationLocks | undefined, locale: Locale, field: PostTranslationField) {
  return Boolean(locks?.[locale]?.[field]);
}

function shouldFillTranslation(
  currentValue: string | undefined,
  locale: Locale,
  field: PostTranslationField,
  options: BuildPostLocalizationOptions,
) {
  if (lockValue(options.translationLocks, locale, field)) {
    return false;
  }

  if (options.regenerateLocales?.includes(locale)) {
    return true;
  }

  return Boolean(options.generateTranslations && !currentValue?.trim());
}

function shouldFillGenericTranslation(currentValue: string | string[] | undefined, locale: Locale, options: GenericTranslationOptions) {
  if (options.regenerateLocales?.includes(locale)) {
    return true;
  }
  if (!options.generateTranslations) {
    return false;
  }
  if (Array.isArray(currentValue)) {
    return currentValue.length === 0;
  }
  return !currentValue?.trim();
}

async function translateToEnglish(env: DeepSeekEnv, source: PostSourceFields) {
  if (!env.DEEPSEEK_API_KEY) {
    return {
      translation: {
        title: source.title,
        excerpt: source.excerpt,
        content: source.content,
        seoTitle: source.seoTitle,
        seoDescription: source.seoDescription,
      },
      warning: "AI translation unavailable",
    };
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an editorial translator. Translate Simplified Chinese into polished English for a high-end personal journal. Preserve markdown, links, code blocks, image syntax, block quotes, inline code, and heading structure. Do not translate URLs, filenames, code, or frontmatter-like keys. Return only JSON with keys title, excerpt, content, seoTitle, seoDescription.",
        },
        {
          role: "user",
          content: JSON.stringify(source),
        },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`DeepSeek translation request failed: ${response.status} ${message}`);
  }

  const responsePayload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = responsePayload.choices?.[0]?.message?.content?.trim() || extractResponseText(responsePayload);
  const translationPayload = parseJsonObject<{
    title?: string;
    excerpt?: string;
    content?: string;
    seoTitle?: string;
    seoDescription?: string;
  }>(text);

  return {
    translation: {
      title: translationPayload.title?.trim() || source.title,
      excerpt: translationPayload.excerpt?.trim() || source.excerpt,
      content: translationPayload.content?.trim() || source.content,
      seoTitle: translationPayload.seoTitle?.trim() || translationPayload.title?.trim() || source.seoTitle,
      seoDescription: translationPayload.seoDescription?.trim() || translationPayload.excerpt?.trim() || source.seoDescription,
    },
    warning: "",
  };
}

export async function buildPostLocalizations(
  env: DeepSeekEnv,
  source: PostSourceFields,
  existing?: {
    title_json?: string | null;
    excerpt_json?: string | null;
    content_json?: string | null;
    seo_title_json?: string | null;
    seo_description_json?: string | null;
  },
  options: BuildPostLocalizationOptions = {},
): Promise<PostLocalizedFields> {
  const warnings: string[] = [];
  const title = mergeLocalized(parseLocalizedText(existing?.title_json), "zh-CN", source.title);
  const excerpt = mergeLocalized(parseLocalizedText(existing?.excerpt_json), "zh-CN", source.excerpt);
  const content = mergeLocalized(parseLocalizedText(existing?.content_json), "zh-CN", source.content);
  const seoTitle = mergeLocalized(parseLocalizedText(existing?.seo_title_json), "zh-CN", source.seoTitle);
  const seoDescription = mergeLocalized(parseLocalizedText(existing?.seo_description_json), "zh-CN", source.seoDescription);

  for (const [locale, fields] of Object.entries(options.localizedFields ?? {}) as Array<[Locale, Partial<PostSourceFields>]>) {
    if (fields.title != null) title[locale] = fields.title;
    if (fields.excerpt != null) excerpt[locale] = fields.excerpt;
    if (fields.content != null) content[locale] = fields.content;
    if (fields.seoTitle != null) seoTitle[locale] = fields.seoTitle;
    if (fields.seoDescription != null) seoDescription[locale] = fields.seoDescription;
  }

  const tw = traditionalized(source);
  if (shouldFillTranslation(title["zh-TW"], "zh-TW", "title", options)) title["zh-TW"] = tw.title;
  if (shouldFillTranslation(excerpt["zh-TW"], "zh-TW", "excerpt", options)) excerpt["zh-TW"] = tw.excerpt;
  if (shouldFillTranslation(content["zh-TW"], "zh-TW", "content", options)) content["zh-TW"] = tw.content;
  if (shouldFillTranslation(seoTitle["zh-TW"], "zh-TW", "seoTitle", options)) seoTitle["zh-TW"] = tw.seoTitle;
  if (shouldFillTranslation(seoDescription["zh-TW"], "zh-TW", "seoDescription", options)) seoDescription["zh-TW"] = tw.seoDescription;

  const needsEnglish =
    shouldFillTranslation(title["en-US"], "en-US", "title", options) ||
    shouldFillTranslation(excerpt["en-US"], "en-US", "excerpt", options) ||
    shouldFillTranslation(content["en-US"], "en-US", "content", options) ||
    shouldFillTranslation(seoTitle["en-US"], "en-US", "seoTitle", options) ||
    shouldFillTranslation(seoDescription["en-US"], "en-US", "seoDescription", options);

  if (needsEnglish) {
    try {
      const english = await translateToEnglish(env, source);
      if (shouldFillTranslation(title["en-US"], "en-US", "title", options)) title["en-US"] = english.translation.title;
      if (shouldFillTranslation(excerpt["en-US"], "en-US", "excerpt", options)) excerpt["en-US"] = english.translation.excerpt;
      if (shouldFillTranslation(content["en-US"], "en-US", "content", options)) content["en-US"] = english.translation.content;
      if (shouldFillTranslation(seoTitle["en-US"], "en-US", "seoTitle", options)) seoTitle["en-US"] = english.translation.seoTitle;
      if (shouldFillTranslation(seoDescription["en-US"], "en-US", "seoDescription", options)) seoDescription["en-US"] = english.translation.seoDescription;
      if (english.warning) {
        warnings.push(english.warning);
      }
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "AI translation unavailable");
      if (shouldFillTranslation(title["en-US"], "en-US", "title", options)) title["en-US"] = source.title;
      if (shouldFillTranslation(excerpt["en-US"], "en-US", "excerpt", options)) excerpt["en-US"] = source.excerpt;
      if (shouldFillTranslation(content["en-US"], "en-US", "content", options)) content["en-US"] = source.content;
      if (shouldFillTranslation(seoTitle["en-US"], "en-US", "seoTitle", options)) seoTitle["en-US"] = source.seoTitle;
      if (shouldFillTranslation(seoDescription["en-US"], "en-US", "seoDescription", options)) seoDescription["en-US"] = source.seoDescription;
    }
  }

  return {
    title_json: stringifyLocalizedText(title),
    excerpt_json: stringifyLocalizedText(excerpt),
    content_json: stringifyLocalizedText(content),
    seo_title_json: stringifyLocalizedText(seoTitle),
    seo_description_json: stringifyLocalizedText(seoDescription),
    warnings,
  };
}

async function translateGenericEnglish<T extends Record<string, unknown>>(env: DeepSeekEnv, source: T, systemPrompt: string) {
  if (!env.DEEPSEEK_API_KEY) {
    return { translation: source, warning: "AI translation unavailable" };
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(source) },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`DeepSeek translation request failed: ${response.status} ${message}`);
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = payload.choices?.[0]?.message?.content?.trim() || extractResponseText(payload);
  return { translation: parseJsonObject<T>(text), warning: "" };
}

export async function buildAboutLocalizations(
  env: DeepSeekEnv,
  source: AboutSourceFields,
  existing?: { content_json?: string | null; seo_json?: string | null },
  options: { localizedFields?: AboutLocalizedInput; generateTranslations?: boolean; regenerateLocales?: Locale[] } = {},
) {
  const warnings: string[] = [];
  const existingContent = parseJsonText(existing?.content_json, {}) as Record<string, Record<string, string>>;
  const existingSeo = parseJsonText(existing?.seo_json, {}) as Record<string, Record<string, string>>;
  const content: Record<Locale, Record<string, string>> = {
    "zh-CN": {
      ...(existingContent["zh-CN"] ?? {}),
      eyebrow: source.eyebrow,
      headline: source.headline,
      description: source.description,
      body: source.body,
      heroImage: source.heroImage,
      imageAlt: source.imageAlt,
      imageFit: source.imageFit,
      imagePositionX: source.imagePositionX,
      imagePositionY: source.imagePositionY,
      imageAspectRatio: source.imageAspectRatio,
    },
    "zh-TW": { ...(existingContent["zh-TW"] ?? {}) },
    "en-US": { ...(existingContent["en-US"] ?? {}) },
  };
  const seo: Record<Locale, Record<string, string>> = {
    "zh-CN": {
      ...(existingSeo["zh-CN"] ?? {}),
      title: source.seoTitle,
      description: source.seoDescription,
    },
    "zh-TW": { ...(existingSeo["zh-TW"] ?? {}) },
    "en-US": { ...(existingSeo["en-US"] ?? {}) },
  };

  for (const [locale, fields] of Object.entries(options.localizedFields ?? {}) as Array<[Locale, Partial<AboutSourceFields>]>) {
    if (fields.eyebrow != null) content[locale].eyebrow = fields.eyebrow;
    if (fields.headline != null) content[locale].headline = fields.headline;
    if (fields.description != null) content[locale].description = fields.description;
    if (fields.body != null) content[locale].body = fields.body;
    if (fields.heroImage != null) content[locale].heroImage = fields.heroImage;
    if (fields.imageAlt != null) content[locale].imageAlt = fields.imageAlt;
    if (fields.imageFit != null) content[locale].imageFit = fields.imageFit;
    if (fields.imagePositionX != null) content[locale].imagePositionX = fields.imagePositionX;
    if (fields.imagePositionY != null) content[locale].imagePositionY = fields.imagePositionY;
    if (fields.imageAspectRatio != null) content[locale].imageAspectRatio = fields.imageAspectRatio;
    if (fields.seoTitle != null) seo[locale].title = fields.seoTitle;
    if (fields.seoDescription != null) seo[locale].description = fields.seoDescription;
  }

  if (
    shouldFillGenericTranslation(content["zh-TW"].eyebrow, "zh-TW", options) ||
    shouldFillGenericTranslation(content["zh-TW"].headline, "zh-TW", options) ||
    shouldFillGenericTranslation(content["zh-TW"].description, "zh-TW", options) ||
    shouldFillGenericTranslation(content["zh-TW"].body, "zh-TW", options) ||
    shouldFillGenericTranslation(content["zh-TW"].heroImage, "zh-TW", options) ||
    shouldFillGenericTranslation(content["zh-TW"].imageAlt, "zh-TW", options) ||
    shouldFillGenericTranslation(content["zh-TW"].imageFit, "zh-TW", options) ||
    shouldFillGenericTranslation(content["zh-TW"].imagePositionX, "zh-TW", options) ||
    shouldFillGenericTranslation(content["zh-TW"].imagePositionY, "zh-TW", options) ||
    shouldFillGenericTranslation(content["zh-TW"].imageAspectRatio, "zh-TW", options) ||
    shouldFillGenericTranslation(seo["zh-TW"].title, "zh-TW", options) ||
    shouldFillGenericTranslation(seo["zh-TW"].description, "zh-TW", options)
  ) {
    if (shouldFillGenericTranslation(content["zh-TW"].eyebrow, "zh-TW", options)) content["zh-TW"].eyebrow = toTraditionalChinese(content["zh-CN"].eyebrow ?? "");
    if (shouldFillGenericTranslation(content["zh-TW"].headline, "zh-TW", options)) content["zh-TW"].headline = toTraditionalChinese(content["zh-CN"].headline ?? "");
    if (shouldFillGenericTranslation(content["zh-TW"].description, "zh-TW", options)) content["zh-TW"].description = toTraditionalChinese(content["zh-CN"].description ?? "");
    if (shouldFillGenericTranslation(content["zh-TW"].body, "zh-TW", options)) content["zh-TW"].body = toTraditionalChinese(content["zh-CN"].body ?? "");
    if (shouldFillGenericTranslation(content["zh-TW"].heroImage, "zh-TW", options)) content["zh-TW"].heroImage = content["zh-CN"].heroImage ?? "";
    if (shouldFillGenericTranslation(content["zh-TW"].imageAlt, "zh-TW", options)) content["zh-TW"].imageAlt = toTraditionalChinese(content["zh-CN"].imageAlt ?? "");
    if (shouldFillGenericTranslation(content["zh-TW"].imageFit, "zh-TW", options)) content["zh-TW"].imageFit = content["zh-CN"].imageFit ?? "";
    if (shouldFillGenericTranslation(content["zh-TW"].imagePositionX, "zh-TW", options)) content["zh-TW"].imagePositionX = content["zh-CN"].imagePositionX ?? "";
    if (shouldFillGenericTranslation(content["zh-TW"].imagePositionY, "zh-TW", options)) content["zh-TW"].imagePositionY = content["zh-CN"].imagePositionY ?? "";
    if (shouldFillGenericTranslation(content["zh-TW"].imageAspectRatio, "zh-TW", options)) content["zh-TW"].imageAspectRatio = content["zh-CN"].imageAspectRatio ?? "";
    if (shouldFillGenericTranslation(seo["zh-TW"].title, "zh-TW", options)) seo["zh-TW"].title = toTraditionalChinese(seo["zh-CN"].title ?? "");
    if (shouldFillGenericTranslation(seo["zh-TW"].description, "zh-TW", options)) seo["zh-TW"].description = toTraditionalChinese(seo["zh-CN"].description ?? "");
  }

  if (shouldFillGenericTranslation(content["en-US"].imageFit, "en-US", options)) content["en-US"].imageFit = content["zh-CN"].imageFit ?? "";
  if (shouldFillGenericTranslation(content["en-US"].imagePositionX, "en-US", options)) content["en-US"].imagePositionX = content["zh-CN"].imagePositionX ?? "";
  if (shouldFillGenericTranslation(content["en-US"].imagePositionY, "en-US", options)) content["en-US"].imagePositionY = content["zh-CN"].imagePositionY ?? "";
  if (shouldFillGenericTranslation(content["en-US"].imageAspectRatio, "en-US", options)) content["en-US"].imageAspectRatio = content["zh-CN"].imageAspectRatio ?? "";

  const needsEnglish =
    shouldFillGenericTranslation(content["en-US"].eyebrow, "en-US", options) ||
    shouldFillGenericTranslation(content["en-US"].headline, "en-US", options) ||
    shouldFillGenericTranslation(content["en-US"].description, "en-US", options) ||
    shouldFillGenericTranslation(content["en-US"].body, "en-US", options) ||
    shouldFillGenericTranslation(content["en-US"].heroImage, "en-US", options) ||
    shouldFillGenericTranslation(content["en-US"].imageAlt, "en-US", options) ||
    shouldFillGenericTranslation(seo["en-US"].title, "en-US", options) ||
    shouldFillGenericTranslation(seo["en-US"].description, "en-US", options);

  if (needsEnglish) {
    try {
      const english = await translateGenericEnglish(
        env,
        {
          eyebrow: content["zh-CN"].eyebrow ?? "",
          headline: content["zh-CN"].headline ?? "",
          description: content["zh-CN"].description ?? "",
          body: content["zh-CN"].body ?? "",
          heroImage: content["zh-CN"].heroImage ?? "",
          imageAlt: content["zh-CN"].imageAlt ?? "",
          seoTitle: seo["zh-CN"].title ?? "",
          seoDescription: seo["zh-CN"].description ?? "",
        },
        "You translate Simplified Chinese into polished English for a high-end personal journal About page. Preserve image URLs exactly. Return only JSON with keys eyebrow, headline, description, body, heroImage, imageAlt, seoTitle, seoDescription.",
      );
      if (shouldFillGenericTranslation(content["en-US"].eyebrow, "en-US", options)) content["en-US"].eyebrow = typeof english.translation.eyebrow === "string" ? english.translation.eyebrow : content["zh-CN"].eyebrow ?? "";
      if (shouldFillGenericTranslation(content["en-US"].headline, "en-US", options)) content["en-US"].headline = typeof english.translation.headline === "string" ? english.translation.headline : content["zh-CN"].headline ?? "";
      if (shouldFillGenericTranslation(content["en-US"].description, "en-US", options)) content["en-US"].description = typeof english.translation.description === "string" ? english.translation.description : content["zh-CN"].description ?? "";
      if (shouldFillGenericTranslation(content["en-US"].body, "en-US", options)) content["en-US"].body = typeof english.translation.body === "string" ? english.translation.body : content["zh-CN"].body ?? "";
      if (shouldFillGenericTranslation(content["en-US"].heroImage, "en-US", options)) content["en-US"].heroImage = typeof english.translation.heroImage === "string" ? english.translation.heroImage : content["zh-CN"].heroImage ?? "";
      if (shouldFillGenericTranslation(content["en-US"].imageAlt, "en-US", options)) content["en-US"].imageAlt = typeof english.translation.imageAlt === "string" ? english.translation.imageAlt : content["zh-CN"].imageAlt ?? "";
      if (shouldFillGenericTranslation(seo["en-US"].title, "en-US", options)) seo["en-US"].title = typeof english.translation.seoTitle === "string" ? english.translation.seoTitle : seo["zh-CN"].title ?? "";
      if (shouldFillGenericTranslation(seo["en-US"].description, "en-US", options)) seo["en-US"].description = typeof english.translation.seoDescription === "string" ? english.translation.seoDescription : seo["zh-CN"].description ?? "";
      if (english.warning) warnings.push(english.warning);
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "AI translation unavailable");
      if (shouldFillGenericTranslation(content["en-US"].eyebrow, "en-US", options)) content["en-US"].eyebrow = content["zh-CN"].eyebrow ?? "";
      if (shouldFillGenericTranslation(content["en-US"].headline, "en-US", options)) content["en-US"].headline = content["zh-CN"].headline ?? "";
      if (shouldFillGenericTranslation(content["en-US"].description, "en-US", options)) content["en-US"].description = content["zh-CN"].description ?? "";
      if (shouldFillGenericTranslation(content["en-US"].body, "en-US", options)) content["en-US"].body = content["zh-CN"].body ?? "";
      if (shouldFillGenericTranslation(content["en-US"].heroImage, "en-US", options)) content["en-US"].heroImage = content["zh-CN"].heroImage ?? "";
      if (shouldFillGenericTranslation(content["en-US"].imageAlt, "en-US", options)) content["en-US"].imageAlt = content["zh-CN"].imageAlt ?? "";
      if (shouldFillGenericTranslation(seo["en-US"].title, "en-US", options)) seo["en-US"].title = seo["zh-CN"].title ?? "";
      if (shouldFillGenericTranslation(seo["en-US"].description, "en-US", options)) seo["en-US"].description = seo["zh-CN"].description ?? "";
    }
  }

  return {
    content_json: JSON.stringify(content),
    seo_json: JSON.stringify(seo),
    warnings,
  };
}

export async function buildGearLocalizations(
  env: DeepSeekEnv,
  source: GearSourceFields,
  existing?: { name_json?: string | null; description_json?: string | null; image_alt_json?: string | null; tags_json?: string | null },
  options: { localizedFields?: GearLocalizedInput; generateTranslations?: boolean; regenerateLocales?: Locale[] } = {},
) {
  const warnings: string[] = [];
  const name = { ...parseLocalizedText(existing?.name_json), "zh-CN": source.name };
  const description = { ...parseLocalizedText(existing?.description_json), "zh-CN": source.description };
  const imageAlt = { ...parseLocalizedText(existing?.image_alt_json), "zh-CN": source.imageAlt };
  const tags = { ...parseLocalizedTextArray(existing?.tags_json), "zh-CN": source.tags };

  for (const [locale, fields] of Object.entries(options.localizedFields ?? {}) as Array<[Locale, Partial<GearSourceFields>]>) {
    if (fields.name != null) name[locale] = fields.name;
    if (fields.description != null) description[locale] = fields.description;
    if (fields.imageAlt != null) imageAlt[locale] = fields.imageAlt;
    if (fields.tags != null) tags[locale] = fields.tags;
  }

  if (shouldFillGenericTranslation(name["zh-TW"], "zh-TW", options)) name["zh-TW"] = toTraditionalChinese(source.name);
  if (shouldFillGenericTranslation(description["zh-TW"], "zh-TW", options)) description["zh-TW"] = toTraditionalChinese(source.description);
  if (shouldFillGenericTranslation(imageAlt["zh-TW"], "zh-TW", options)) imageAlt["zh-TW"] = toTraditionalChinese(source.imageAlt);
  if (shouldFillGenericTranslation(tags["zh-TW"], "zh-TW", options)) tags["zh-TW"] = traditionalizeStringArray(source.tags);

  const needsEnglish =
    shouldFillGenericTranslation(name["en-US"], "en-US", options) ||
    shouldFillGenericTranslation(description["en-US"], "en-US", options) ||
    shouldFillGenericTranslation(imageAlt["en-US"], "en-US", options) ||
    shouldFillGenericTranslation(tags["en-US"], "en-US", options);

  if (needsEnglish) {
    try {
      const english = await translateGenericEnglish(
        env,
        source,
        "You translate Simplified Chinese gear catalogue copy into polished English. Preserve JSON keys and arrays. Return only JSON with keys name, description, imageAlt, tags.",
      );
      if (shouldFillGenericTranslation(name["en-US"], "en-US", options)) name["en-US"] = typeof english.translation.name === "string" ? english.translation.name : source.name;
      if (shouldFillGenericTranslation(description["en-US"], "en-US", options)) description["en-US"] = typeof english.translation.description === "string" ? english.translation.description : source.description;
      if (shouldFillGenericTranslation(imageAlt["en-US"], "en-US", options)) imageAlt["en-US"] = typeof english.translation.imageAlt === "string" ? english.translation.imageAlt : source.imageAlt;
      if (shouldFillGenericTranslation(tags["en-US"], "en-US", options)) {
        tags["en-US"] = Array.isArray(english.translation.tags)
          ? english.translation.tags.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
          : source.tags;
      }
      if (english.warning) warnings.push(english.warning);
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "AI translation unavailable");
      if (shouldFillGenericTranslation(name["en-US"], "en-US", options)) name["en-US"] = source.name;
      if (shouldFillGenericTranslation(description["en-US"], "en-US", options)) description["en-US"] = source.description;
      if (shouldFillGenericTranslation(imageAlt["en-US"], "en-US", options)) imageAlt["en-US"] = source.imageAlt;
      if (shouldFillGenericTranslation(tags["en-US"], "en-US", options)) tags["en-US"] = source.tags;
    }
  }

  return {
    name_json: stringifyLocalizedText(name),
    description_json: stringifyLocalizedText(description),
    image_alt_json: stringifyLocalizedText(imageAlt),
    tags_json: stringifyLocalizedTextArray(tags),
    warnings,
  };
}

export function localizeAboutPageRecord<T extends Record<string, unknown>>(row: T, locale: Locale) {
  const content = parseJsonText(row.content_json, {}) as Record<string, Record<string, string>>;
  const seo = parseJsonText(row.seo_json, {}) as Record<string, Record<string, string>>;
  const localizedContent = content[locale] ?? content["zh-CN"] ?? content["en-US"] ?? {};
  const localizedSeo = seo[locale] ?? seo["zh-CN"] ?? seo["en-US"] ?? {};

  return {
    ...row,
    content: localizedContent,
    seo: localizedSeo,
  };
}

export function localizeGearRecord<T extends Record<string, unknown>>(row: T, locale: Locale) {
  const localizedName = resolveLocalizedText(parseLocalizedText(row.name_json), locale, typeof row.name === "string" ? row.name : "");
  const localizedDescription = resolveLocalizedText(parseLocalizedText(row.description_json), locale, typeof row.description === "string" ? row.description : "");
  const localizedImageAlt = resolveLocalizedText(parseLocalizedText(row.image_alt_json), locale, localizedName);
  const localizedTags = resolveLocalizedTextArray(parseLocalizedTextArray(row.tags_json), locale, []);

  return {
    ...row,
    name: localizedName,
    description: localizedDescription,
    image_alt: localizedImageAlt,
    tags: localizedTags,
  };
}
