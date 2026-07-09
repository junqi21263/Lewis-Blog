import { jsonResponse, withErrorHandling } from "../../_lib/api";
import { localizeAboutPageRecord, localeFromRequest } from "../../_lib/localization";

type SitePageRow = {
  id: string;
  page_key: string;
  content_json: string;
  seo_json: string;
  created_at: string;
  updated_at: string;
};

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const locale = localeFromRequest(context.request);
    const page = await context.env.DB.prepare(
      "SELECT id, page_key, content_json, seo_json, created_at, updated_at FROM site_pages WHERE page_key = ? LIMIT 1",
    )
      .bind("about")
      .first<SitePageRow>();

    if (!page) {
      return jsonResponse({ data: null });
    }

    return jsonResponse({ data: localizeAboutPageRecord(page, locale) });
  });
