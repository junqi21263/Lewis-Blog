import { handleRequestError, jsonResponse, nowIso, readJsonObject, requireAccess, textField, withErrorHandling } from "../../../_lib/api";
import { buildAboutLocalizations, localizeAboutPageRecord, localeFromRequest, parseAboutLocalizationPayload } from "../../../_lib/localization";

type SitePageRow = {
  id: string;
  page_key: string;
  content_json: string;
  seo_json: string;
  created_at: string;
  updated_at: string;
};

async function getAboutPage(db: D1Database) {
  return await db
    .prepare("SELECT id, page_key, content_json, seo_json, created_at, updated_at FROM site_pages WHERE page_key = ? LIMIT 1")
    .bind("about")
    .first<SitePageRow>();
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    const page = await getAboutPage(context.env.DB);
    if (!page) {
      return jsonResponse({ data: null });
    }

    return jsonResponse({ data: page });
  });

export const onRequestPut: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    try {
      const body = await readJsonObject(context.request);
      const now = nowIso();
      const source = {
        eyebrow: textField(body, "eyebrow"),
        headline: textField(body, "headline"),
        description: textField(body, "description"),
        body: textField(body, "body"),
        heroImage: textField(body, "hero_image"),
        imageAlt: textField(body, "image_alt"),
        imageFit: textField(body, "image_fit") || "cover",
        imagePositionX: textField(body, "image_position_x") || "center",
        imagePositionY: textField(body, "image_position_y") || "center",
        imageAspectRatio: textField(body, "image_aspect_ratio") || "cinema",
        seoTitle: textField(body, "seo_title"),
        seoDescription: textField(body, "seo_description"),
      };
      const localizedFields = parseAboutLocalizationPayload(body);
      const existing = await getAboutPage(context.env.DB);
      const localized = await buildAboutLocalizations(context.env, source, existing ?? undefined, {
        localizedFields,
        generateTranslations: body.generate_translations !== false,
        regenerateLocales: Array.isArray(body.regenerate_locales)
          ? body.regenerate_locales.filter((item): item is "zh-TW" | "en-US" => item === "zh-TW" || item === "en-US")
          : [],
      });

      await context.env.DB
        .prepare(
          `INSERT INTO site_pages (id, page_key, content_json, seo_json, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(page_key) DO UPDATE SET
             content_json = excluded.content_json,
             seo_json = excluded.seo_json,
             updated_at = excluded.updated_at`,
        )
        .bind("about", "about", localized.content_json, localized.seo_json, existing?.created_at ?? now, now)
        .run();

      const saved = await getAboutPage(context.env.DB);
      return jsonResponse(
        {
          data: saved ? localizeAboutPageRecord(saved, localeFromRequest(context.request)) : null,
          meta: { warnings: localized.warnings },
        },
      );
    } catch (error) {
      return handleRequestError(error);
    }
  });
