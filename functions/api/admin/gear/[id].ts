import {
  booleanField,
  handleRequestError,
  jsonResponse,
  nowIso,
  numberField,
  readJsonObject,
  requireAccess,
  routeParam,
  textField,
  withErrorHandling,
} from "../../../_lib/api";
import { buildGearLocalizations, parseGearLocalizationPayload } from "../../../_lib/localization";

type GearRow = Record<string, unknown> & {
  is_featured: number;
  name_json?: string | null;
  description_json?: string | null;
  image_alt_json?: string | null;
  tags_json?: string | null;
};

function serializeGear(row: GearRow) {
  return {
    ...row,
    is_featured: Boolean(row.is_featured),
  };
}

async function getGear(db: D1Database, id: string) {
  return await db.prepare("SELECT * FROM gear_items WHERE id = ? LIMIT 1").bind(id).first<GearRow>();
}

export const onRequestPut: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    try {
      const id = routeParam(context, "id");
      if (!id) {
        return jsonResponse({ error: { message: "Missing gear id." } }, { status: 400 });
      }

      const body = await readJsonObject(context.request);
      const existing = await getGear(context.env.DB, id);
      if (!existing) {
        return jsonResponse({ error: { message: "Resource not found." } }, { status: 404 });
      }

      const source = {
        name: textField(body, "name"),
        description: textField(body, "description"),
        imageAlt: textField(body, "image_alt"),
        tags: Array.isArray(body.tags) ? body.tags.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [],
      };
      const localized = await buildGearLocalizations(context.env, source, existing, {
        localizedFields: parseGearLocalizationPayload(body),
        generateTranslations: true,
      });

      await context.env.DB
        .prepare(
          `UPDATE gear_items
           SET name_json = ?, description_json = ?, category = ?, maker = ?, year = ?, status = ?, archive_uses = ?,
               image_url = ?, image_alt_json = ?, tags_json = ?, sort_order = ?, is_featured = ?, updated_at = ?
           WHERE id = ?`,
        )
        .bind(
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
          nowIso(),
          id,
        )
        .run();

      const updated = await getGear(context.env.DB, id);
      return jsonResponse({ data: updated ? serializeGear(updated) : null, meta: { warnings: localized.warnings } });
    } catch (error) {
      return handleRequestError(error);
    }
  });

export const onRequestDelete: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    const id = routeParam(context, "id");
    if (!id) {
      return jsonResponse({ error: { message: "Missing gear id." } }, { status: 400 });
    }

    const result = await context.env.DB.prepare("DELETE FROM gear_items WHERE id = ?").bind(id).run();
    if (result.meta.changes === 0) {
      return jsonResponse({ error: { message: "Resource not found." } }, { status: 404 });
    }

    return jsonResponse({ data: { id, deleted: true } });
  });
