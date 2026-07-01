import * as OpenCC from "opencc-js";
import { defaultLocale, localeFromSegment, localeToSegment, type Locale } from "../../src/i18n/config";
import { parseLocalizedText, resolveLocalizedText, stringifyLocalizedText, type LocalizedTextMap } from "../../src/i18n/content";

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
