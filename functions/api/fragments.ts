import { jsonResponse, methodNotAllowed, withErrorHandling } from "../_lib/api";
import { localeFromRequest } from "../_lib/localization";
import { localizeFragmentRecord } from "../_lib/fragments";

type FragmentRow = Record<string, unknown> & {
  is_public: number;
};

function serializeFragment(row: FragmentRow) {
  return {
    ...row,
    is_public: Boolean(row.is_public),
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const locale = localeFromRequest(context.request);
    const result = await context.env.DB
      .prepare(
        `SELECT id, content_json, location_json, images_json, camera, mood, status, is_public, translation_locks_json, published_at, created_at, updated_at
         FROM fragments
         WHERE status = 'published' AND is_public = 1
         ORDER BY COALESCE(NULLIF(published_at, ''), created_at) DESC, created_at DESC`,
      )
      .all<FragmentRow>();

    return jsonResponse({ data: result.results.map((row) => localizeFragmentRecord(serializeFragment(row), locale)) });
  });

export const onRequestPost: PagesFunction<Env> = () => methodNotAllowed();
