import {
  booleanField,
  handleRequestError,
  jsonResponse,
  nowIso,
  numberField,
  readJsonObject,
  requireAccess,
  textField,
  withErrorHandling,
} from "../../../_lib/api";
import { buildGearLocalizations, parseGearLocalizationPayload } from "../../../_lib/localization";

type GearRow = Record<string, unknown> & {
  is_featured: number;
};

function serializeGear(row: GearRow) {
  return {
    ...row,
    is_featured: Boolean(row.is_featured),
  };
}

async function listGear(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT id, name_json, description_json, category, maker, year, status, archive_uses, image_url, image_alt_json, tags_json, sort_order, is_featured, created_at, updated_at
       FROM gear_items
       ORDER BY is_featured DESC, sort_order ASC, updated_at DESC`,
    )
    .all<GearRow>();

  return result.results.map(serializeGear);
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    return jsonResponse({ data: await listGear(context.env.DB) });
  });

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    try {
      const body = await readJsonObject(context.request);
      const now = nowIso();
      const id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : crypto.randomUUID();
      const source = {
        name: textField(body, "name"),
        description: textField(body, "description"),
        imageAlt: textField(body, "image_alt"),
        tags: Array.isArray(body.tags) ? body.tags.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [],
      };
      const localized = await buildGearLocalizations(context.env, source, undefined, {
        localizedFields: parseGearLocalizationPayload(body),
        generateTranslations: true,
      });

      await context.env.DB
        .prepare(
          `INSERT INTO gear_items (
            id, name_json, description_json, category, maker, year, status, archive_uses,
            image_url, image_alt_json, tags_json, sort_order, is_featured, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          localized.name_json,
          localized.description_json,
          textField(body, "category", { fallback: "Camera" }),
          textField(body, "maker"),
          textField(body, "year"),
          textField(body, "status", { fallback: "current" }),
          numberField(body, "archive_uses", 0),
          textField(body, "image_url"),
          localized.image_alt_json,
          localized.tags_json,
          numberField(body, "sort_order", 0),
          booleanField(body, "is_featured"),
          now,
          now,
        )
        .run();

      const created = await context.env.DB.prepare("SELECT * FROM gear_items WHERE id = ?").bind(id).first<GearRow>();
      return jsonResponse({ data: created ? serializeGear(created) : null, meta: { warnings: localized.warnings } }, { status: 201 });
    } catch (error) {
      return handleRequestError(error);
    }
  });
