import * as OpenCC from "opencc-js";
import { parseJsonText } from "./api";
import { resolveLocalizedText, parseLocalizedText, stringifyLocalizedText } from "../../src/i18n/content";
import type { Locale } from "../../src/i18n/config";

export type FragmentSourceFields = {
  content: string;
  location: string;
};

export type FragmentTranslationField = keyof FragmentSourceFields;
export type FragmentLocalizedInput = Partial<Record<Locale, Partial<FragmentSourceFields>>>;
export type FragmentTranslationLocks = Partial<Record<Locale, Partial<Record<FragmentTranslationField, boolean>>>>;

type FragmentLocalizationOptions = {
  localizedFields?: FragmentLocalizedInput;
  translationLocks?: FragmentTranslationLocks;
};

type TranslationEnv = Env & {
  DEEPSEEK_API_KEY?: string;
};

const toTraditionalChinese = OpenCC.Converter({ from: "cn", to: "tw" });

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

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

function lockValue(locks: FragmentTranslationLocks | undefined, locale: Locale, field: FragmentTranslationField) {
  return Boolean(locks?.[locale]?.[field]);
}

function shouldFillTranslation(value: string | undefined, locale: Locale, field: FragmentTranslationField, options: FragmentLocalizationOptions) {
  if (lockValue(options.translationLocks, locale, field)) {
    return false;
  }
  return !value?.trim();
}

function normalizeLocalizedInput(value: unknown): FragmentLocalizedInput {
  if (!isRecord(value)) {
    return {};
  }

  const result: FragmentLocalizedInput = {};
  for (const locale of ["zh-CN", "zh-TW", "en-US"] as const) {
    const rawFields = value[locale];
    if (!isRecord(rawFields)) continue;
    result[locale] = {};
    if (typeof rawFields.content === "string") result[locale]!.content = rawFields.content;
    if (typeof rawFields.location === "string") result[locale]!.location = rawFields.location;
  }
  return result;
}

function normalizeTranslationLocks(value: unknown): FragmentTranslationLocks {
  if (!isRecord(value)) {
    return {};
  }

  const result: FragmentTranslationLocks = {};
  for (const locale of ["zh-TW", "en-US"] as const) {
    const rawFields = value[locale];
    if (!isRecord(rawFields)) continue;
    result[locale] = {};
    if (typeof rawFields.content === "boolean") result[locale]!.content = rawFields.content;
    if (typeof rawFields.location === "boolean") result[locale]!.location = rawFields.location;
  }
  return result;
}

export function parseFragmentLocalizationPayload(body: Record<string, unknown>) {
  return {
    localizedFields: normalizeLocalizedInput(body.localized_fields),
    translationLocks: normalizeTranslationLocks(body.translation_locks),
  };
}

async function translateFragmentToEnglish(env: TranslationEnv, source: FragmentSourceFields) {
  if (!env.DEEPSEEK_API_KEY) {
    return {
      translation: source,
      warning: "DEEPSEEK_API_KEY is not configured; English fragment copy falls back to zh-CN.",
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
            "You are an editorial translator. Translate Simplified Chinese fragment copy into concise, natural English for a restrained photography diary. Preserve place names and camera model names naturally. Return only JSON with keys content and location.",
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
    return {
      translation: source,
      warning: `DeepSeek fragment translation failed (${response.status}); English fragment copy falls back to zh-CN. ${message.slice(0, 160)}`,
    };
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = payload.choices?.[0]?.message?.content?.trim() || extractResponseText(payload);
  const translated = parseJsonObject<Partial<FragmentSourceFields>>(text);
  return {
    translation: {
      content: typeof translated.content === "string" ? translated.content.trim() || source.content : source.content,
      location: typeof translated.location === "string" ? translated.location.trim() || source.location : source.location,
    },
    warning: "",
  };
}

export async function buildFragmentLocalizations(
  env: TranslationEnv,
  source: FragmentSourceFields,
  existing?: { content_json?: string | null; location_json?: string | null },
  options: FragmentLocalizationOptions = {},
) {
  const warnings: string[] = [];
  const content = { ...parseLocalizedText(existing?.content_json), "zh-CN": source.content };
  const location = { ...parseLocalizedText(existing?.location_json), "zh-CN": source.location };

  for (const [locale, fields] of Object.entries(options.localizedFields ?? {}) as Array<[Locale, Partial<FragmentSourceFields>]>) {
    if (fields.content != null) content[locale] = fields.content;
    if (fields.location != null) location[locale] = fields.location;
  }

  if (shouldFillTranslation(content["zh-TW"], "zh-TW", "content", options)) content["zh-TW"] = toTraditionalChinese(source.content);
  if (shouldFillTranslation(location["zh-TW"], "zh-TW", "location", options)) location["zh-TW"] = toTraditionalChinese(source.location);

  const needsEnglish =
    shouldFillTranslation(content["en-US"], "en-US", "content", options) ||
    shouldFillTranslation(location["en-US"], "en-US", "location", options);

  if (needsEnglish) {
    const english = await translateFragmentToEnglish(env, source);
    if (shouldFillTranslation(content["en-US"], "en-US", "content", options)) content["en-US"] = english.translation.content;
    if (shouldFillTranslation(location["en-US"], "en-US", "location", options)) location["en-US"] = english.translation.location;
    if (english.warning) warnings.push(english.warning);
  }

  return {
    content_json: stringifyLocalizedText(content),
    location_json: stringifyLocalizedText(location),
    warnings,
  };
}

export function localizeFragmentRecord<T extends Record<string, unknown>>(row: T, locale: Locale) {
  return {
    ...row,
    content: resolveLocalizedText(parseLocalizedText(row.content_json), locale, typeof row.content === "string" ? row.content : ""),
    location: resolveLocalizedText(parseLocalizedText(row.location_json), locale, typeof row.location === "string" ? row.location : ""),
  };
}

export function parseFragmentImagesJson(value: unknown) {
  const parsed = parseJsonText(value, []);
  return Array.isArray(parsed) ? parsed : [];
}
