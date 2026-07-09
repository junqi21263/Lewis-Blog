import { jsonResponse, withErrorHandling } from "../_lib/api";
import { localizeGearRecord, localeFromRequest } from "../_lib/localization";

type GearRow = Record<string, unknown> & {
  is_featured: number;
};

function serializeGear(row: GearRow) {
  return {
    ...row,
    is_featured: Boolean(row.is_featured),
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const locale = localeFromRequest(context.request);
    const result = await context.env.DB
      .prepare(
        `SELECT id, name_json, description_json, category, maker, year, status, archive_uses, image_url, image_alt_json, tags_json, sort_order, is_featured, created_at, updated_at
         FROM gear_items
         ORDER BY is_featured DESC, sort_order ASC, updated_at DESC`,
      )
      .all<GearRow>();

    return jsonResponse({
      data: result.results.map((row) => localizeGearRecord(serializeGear(row), locale)),
    });
  });
