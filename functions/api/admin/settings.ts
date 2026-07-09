import { handleRequestError, jsonResponse, nowIso, readJsonObject, requireAccess, withErrorHandling } from "../../_lib/api";
import * as OpenCC from "opencc-js";

type FooterLocale = "zh-CN" | "zh-TW" | "en-US";
type FooterFields = {
  brand: string;
  description: string;
  copyright: string;
  location: string;
};

type HomepageFields = {
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

const pageCopyKeys = ["journal", "gallery", "gear", "films", "about", "fragments"] as const;
const pageCopyFields = ["eyebrow", "title", "description", "emptyTitle", "emptyDescription"] as const;
type PageCopyKey = (typeof pageCopyKeys)[number];
type PageCopyFields = Record<(typeof pageCopyFields)[number], string>;
type PageCopyLocaleMap = Record<FooterLocale, PageCopyFields>;
type PageCopyJson = Record<PageCopyKey, PageCopyLocaleMap> & {
  translationModes: Record<PageCopyKey, Record<"zh-TW" | "en-US", "auto" | "manual">>;
};

type TranslationEnv = Env & {
  DEEPSEEK_API_KEY?: string;
};

const footerLocales = ["zh-CN", "zh-TW", "en-US"] as const;
const footerFields = ["brand", "description", "copyright", "location"] as const;
const homepageFields = [
  "heroEyebrow",
  "heroHeadline",
  "journalEyebrow",
  "journalHeadline",
  "galleryEyebrow",
  "galleryHeadline",
  "latestEyebrow",
  "latestHeadline",
  "latestCta",
] as const;
const toTraditionalChinese = OpenCC.Converter({ from: "cn", to: "tw" });

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringField(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeFooterJson(value: unknown): Record<FooterLocale, FooterFields> {
  const source = isRecord(value) ? value : {};

  return Object.fromEntries(
    footerLocales.map((locale) => {
      const rawLocale = source[locale];
      const rawFields = isRecord(rawLocale) ? rawLocale : {};
      const fields = Object.fromEntries(footerFields.map((field) => [field, stringField(rawFields[field])])) as FooterFields;
      return [locale, fields];
    }),
  ) as Record<FooterLocale, FooterFields>;
}

function normalizeHomepageJson(value: unknown): Record<FooterLocale, HomepageFields> {
  const source = isRecord(value) ? value : {};

  return Object.fromEntries(
    footerLocales.map((locale) => {
      const rawLocale = source[locale];
      const rawFields = isRecord(rawLocale) ? rawLocale : {};
      const fields = Object.fromEntries(homepageFields.map((field) => [field, stringField(rawFields[field])])) as HomepageFields;
      return [locale, fields];
    }),
  ) as Record<FooterLocale, HomepageFields>;
}

function normalizePageCopyJson(value: unknown): PageCopyJson {
  const source = isRecord(value) ? value : {};
  const rawModes = isRecord(source.translationModes) ? source.translationModes : {};
  const result = {} as PageCopyJson;

  for (const page of pageCopyKeys) {
    const rawPage = isRecord(source[page]) ? source[page] : {};
    result[page] = Object.fromEntries(
      footerLocales.map((locale) => {
        const rawLocale = isRecord(rawPage[locale]) ? rawPage[locale] : {};
        return [locale, Object.fromEntries(pageCopyFields.map((field) => [field, stringField(rawLocale[field])]))];
      }),
    ) as PageCopyLocaleMap;
  }

  result.translationModes = Object.fromEntries(
    pageCopyKeys.map((page) => {
      const modes = isRecord(rawModes[page]) ? rawModes[page] : {};
      return [page, {
        "zh-TW": modes["zh-TW"] === "manual" ? "manual" : "auto",
        "en-US": modes["en-US"] === "manual" ? "manual" : "auto",
      }];
    }),
  ) as PageCopyJson["translationModes"];

  return result;
}

function translateFooterToTraditional(source: FooterFields): FooterFields {
  return {
    brand: source.brand,
    description: toTraditionalChinese(source.description),
    copyright: source.copyright,
    location: source.location,
  };
}

function translateHomepageToTraditional(source: HomepageFields): HomepageFields {
  return Object.fromEntries(
    homepageFields.map((field) => [field, toTraditionalChinese(source[field])]),
  ) as HomepageFields;
}

function translatePageCopyToTraditional(source: PageCopyFields): PageCopyFields {
  return Object.fromEntries(
    pageCopyFields.map((field) => [field, toTraditionalChinese(source[field])]),
  ) as PageCopyFields;
}

function extractResponseText(payload: unknown): string {
  if (!isRecord(payload)) return "";
  if (typeof payload.output_text === "string") return payload.output_text;

  const output = Array.isArray(payload.output) ? payload.output : [];
  const parts: string[] = [];

  for (const item of output) {
    if (!isRecord(item)) continue;
    const content = Array.isArray(item.content) ? item.content : [];
    for (const block of content) {
      if (isRecord(block) && typeof block.text === "string") {
        parts.push(block.text);
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

function normalizeEnglishFooterTranslation(translated: Partial<FooterFields>, source: FooterFields): FooterFields {
  return {
    brand: translated.brand?.trim() || source.brand,
    description: translated.description?.trim() || source.description,
    copyright: translated.copyright?.trim() || source.copyright,
    location: translated.location?.trim() || source.location,
  };
}

function normalizeEnglishHomepageTranslation(translated: Partial<HomepageFields>, source: HomepageFields): HomepageFields {
  return Object.fromEntries(
    homepageFields.map((field) => [field, translated[field]?.trim() || source[field]]),
  ) as HomepageFields;
}

async function translateFooterWithDeepSeek(env: TranslationEnv, source: FooterFields) {
  if (!env.DEEPSEEK_API_KEY) {
    return null;
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
            "You are an editorial translator. Translate Simplified Chinese footer copy into concise, natural English for a restrained photography portfolio. Preserve brand names, years, personal names, and locations unless a natural English form is obvious. Return only JSON with keys brand, description, copyright, location.",
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
      warning: `DeepSeek footer translation failed (${response.status}); English footer falls back to zh-CN. ${message.slice(0, 160)}`,
    };
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = payload.choices?.[0]?.message?.content?.trim() || extractResponseText(payload);
  const translated = parseJsonObject<Partial<FooterFields>>(text);

  return {
    translation: normalizeEnglishFooterTranslation(translated, source),
    warning: "",
  };
}

async function translateHomepageWithDeepSeek(env: TranslationEnv, source: HomepageFields) {
  if (!env.DEEPSEEK_API_KEY) {
    return null;
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
            "You are an editorial translator. Translate Simplified Chinese homepage section copy into concise, natural English for a restrained photography magazine. Preserve brand names. Return only JSON with keys heroEyebrow, heroHeadline, journalEyebrow, journalHeadline, galleryEyebrow, galleryHeadline, latestEyebrow, latestHeadline, latestCta.",
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
      warning: `DeepSeek homepage translation failed (${response.status}); English homepage falls back to zh-CN. ${message.slice(0, 160)}`,
    };
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = payload.choices?.[0]?.message?.content?.trim() || extractResponseText(payload);
  const translated = parseJsonObject<Partial<HomepageFields>>(text);

  return {
    translation: normalizeEnglishHomepageTranslation(translated, source),
    warning: "",
  };
}

async function translatePageCopyWithDeepSeek(env: TranslationEnv, source: Record<PageCopyKey, PageCopyFields>) {
  if (!env.DEEPSEEK_API_KEY) {
    return null;
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
            "Translate this Simplified Chinese page copy into concise natural English for a restrained photography magazine. Preserve the page keys and the fields eyebrow, title, description, emptyTitle, emptyDescription. Preserve proper nouns. Return only a JSON object with exactly the same shape.",
        },
        { role: "user", content: JSON.stringify(source) },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = payload.choices?.[0]?.message?.content?.trim() || extractResponseText(payload);
  const translated = parseJsonObject<Partial<Record<PageCopyKey, Partial<PageCopyFields>>>>(text);

  return Object.fromEntries(
    pageCopyKeys.map((page) => [
      page,
      Object.fromEntries(
        pageCopyFields.map((field) => [field, translated[page]?.[field]?.trim() || source[page][field]]),
      ),
    ]),
  ) as Record<PageCopyKey, PageCopyFields>;
}

async function translateFooterToEnglish(env: TranslationEnv, source: FooterFields) {
  try {
    const deepSeekTranslation = await translateFooterWithDeepSeek(env, source);
    if (deepSeekTranslation) {
      return deepSeekTranslation;
    }

    return {
      translation: source,
      warning: "DEEPSEEK_API_KEY is not configured; English footer falls back to zh-CN.",
    };
  } catch (error) {
    return {
      translation: source,
      warning: `Footer English translation failed; English footer falls back to zh-CN. ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function translateHomepageToEnglish(env: TranslationEnv, source: HomepageFields) {
  try {
    const deepSeekTranslation = await translateHomepageWithDeepSeek(env, source);
    if (deepSeekTranslation) {
      return deepSeekTranslation;
    }

    return {
      translation: source,
      warning: "DEEPSEEK_API_KEY is not configured; English homepage falls back to zh-CN.",
    };
  } catch (error) {
    return {
      translation: source,
      warning: `Homepage English translation failed; English homepage falls back to zh-CN. ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function buildFooterJsonForSave(env: Env, value: unknown, sourceLocale: unknown) {
  const footerJson = normalizeFooterJson(value);
  const warnings: string[] = [];

  if (sourceLocale === "zh-CN") {
    const source = footerJson["zh-CN"];
    footerJson["zh-TW"] = translateFooterToTraditional(source);
    const english = await translateFooterToEnglish(env as TranslationEnv, source);
    footerJson["en-US"] = english.translation;
    if (english.warning) {
      warnings.push(english.warning);
    }
  }

  return { footerJson, warnings };
}

async function buildHomepageJsonForSave(env: Env, value: unknown, sourceLocale: unknown) {
  const homepageJson = normalizeHomepageJson(value);
  const warnings: string[] = [];

  if (sourceLocale === "zh-CN") {
    const source = homepageJson["zh-CN"];
    homepageJson["zh-TW"] = translateHomepageToTraditional(source);
    const english = await translateHomepageToEnglish(env as TranslationEnv, source);
    homepageJson["en-US"] = english.translation;
    if (english.warning) {
      warnings.push(english.warning);
    }
  }

  return { homepageJson, warnings };
}

async function buildPageCopyJsonForSave(env: Env, value: unknown, sourceLocale: unknown) {
  const pageCopyJson = normalizePageCopyJson(value);
  const warnings: string[] = [];

  if (sourceLocale === "zh-CN") {
    const source = Object.fromEntries(pageCopyKeys.map((page) => [page, pageCopyJson[page]["zh-CN"]])) as Record<PageCopyKey, PageCopyFields>;
    const english = await translatePageCopyWithDeepSeek(env as TranslationEnv, source);

    for (const page of pageCopyKeys) {
      if (pageCopyJson.translationModes[page]["zh-TW"] === "auto") {
        pageCopyJson[page]["zh-TW"] = translatePageCopyToTraditional(source[page]);
      }
      if (pageCopyJson.translationModes[page]["en-US"] === "auto") {
        pageCopyJson[page]["en-US"] = english?.[page] ?? source[page];
      }
    }

    if (!english) {
      warnings.push("DEEPSEEK_API_KEY is not configured or translation failed; AUTO English page copy falls back to zh-CN.");
    }
  }

  return { pageCopyJson, warnings };
}

function parseSetting(value: string, valueType: string) {
  if (valueType === "boolean") {
    return value === "true";
  }
  if (valueType === "number") {
    return Number(value);
  }
  if (valueType === "string") {
    return value;
  }
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function inferValueType(value: unknown) {
  if (typeof value === "boolean") {
    return "boolean";
  }
  if (typeof value === "number") {
    return "number";
  }
  if (typeof value === "string") {
    return "string";
  }
  return "json";
}

function serializeValue(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) {
      return blocked;
    }

    const result = await context.env.DB.prepare("SELECT key, value, value_type FROM site_settings ORDER BY key ASC").all<{
      key: string;
      value: string;
      value_type: string;
    }>();

    const settings: Record<string, unknown> = {};
    for (const row of result.results) {
      settings[row.key] = parseSetting(row.value, row.value_type);
    }

    return jsonResponse(
      { data: settings },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  });

export const onRequestPut: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) {
      return blocked;
    }

    try {
      const body = await readJsonObject(context.request);
      const footerTranslateFrom = body.footer_translate_from;
      const homepageTranslateFrom = body.homepage_translate_from;
      const pageCopyTranslateFrom = body.page_copy_translate_from;
      const warnings: string[] = [];
      delete body.footer_translate_from;
      delete body.homepage_translate_from;
      delete body.page_copy_translate_from;

      if ("footer_json" in body) {
        const footer = await buildFooterJsonForSave(context.env, body.footer_json, footerTranslateFrom);
        body.footer_json = footer.footerJson;
        warnings.push(...footer.warnings);
      } else if ("footerJson" in body) {
        const footer = await buildFooterJsonForSave(context.env, body.footerJson, footerTranslateFrom);
        body.footer_json = footer.footerJson;
        delete body.footerJson;
        warnings.push(...footer.warnings);
      }

      if ("homepage_json" in body) {
        const homepage = await buildHomepageJsonForSave(context.env, body.homepage_json, homepageTranslateFrom);
        body.homepage_json = homepage.homepageJson;
        warnings.push(...homepage.warnings);
      } else if ("homepageJson" in body) {
        const homepage = await buildHomepageJsonForSave(context.env, body.homepageJson, homepageTranslateFrom);
        body.homepage_json = homepage.homepageJson;
        delete body.homepageJson;
        warnings.push(...homepage.warnings);
      }

      if ("page_copy_json" in body) {
        const pageCopy = await buildPageCopyJsonForSave(context.env, body.page_copy_json, pageCopyTranslateFrom);
        body.page_copy_json = pageCopy.pageCopyJson;
        warnings.push(...pageCopy.warnings);
      } else if ("pageCopyJson" in body) {
        const pageCopy = await buildPageCopyJsonForSave(context.env, body.pageCopyJson, pageCopyTranslateFrom);
        body.page_copy_json = pageCopy.pageCopyJson;
        delete body.pageCopyJson;
        warnings.push(...pageCopy.warnings);
      }

      const updatedAt = nowIso();

      for (const [key, value] of Object.entries(body)) {
        if (!/^[a-zA-Z0-9_.-]+$/.test(key)) {
          return jsonResponse({ error: { message: `Invalid setting key: ${key}` } }, { status: 400 });
        }

        const valueType = inferValueType(value);
        await context.env.DB
          .prepare(
            `INSERT INTO site_settings (key, value, value_type, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(key) DO UPDATE SET
               value = excluded.value,
               value_type = excluded.value_type,
               updated_at = excluded.updated_at`,
          )
          .bind(key, serializeValue(value), valueType, updatedAt, updatedAt)
          .run();
      }

      return jsonResponse({ data: { updated: true }, meta: warnings.length > 0 ? { warnings } : undefined });
    } catch (error) {
      return handleRequestError(error);
    }
  });
