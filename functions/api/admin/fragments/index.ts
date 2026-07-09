import {
  booleanField,
  handleRequestError,
  jsonResponse,
  nowIso,
  optionalTextField,
  readJsonObject,
  requireAccess,
  statusField,
  textField,
  withErrorHandling,
} from "../../../_lib/api";
import { buildFragmentLocalizations, parseFragmentLocalizationPayload } from "../../../_lib/fragments";

type FragmentRow = Record<string, unknown> & {
  is_public: number;
};

function serializeFragment(row: FragmentRow) {
  return {
    ...row,
    is_public: Boolean(row.is_public),
  };
}

async function listFragments(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT id, content_json, location_json, images_json, camera, mood, status, is_public, translation_locks_json, published_at, created_at, updated_at
       FROM fragments
       ORDER BY COALESCE(NULLIF(published_at, ''), created_at) DESC, created_at DESC`,
    )
    .all<FragmentRow>();

  return result.results.map(serializeFragment);
}

async function getFragmentById(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT id, content_json, location_json, images_json, camera, mood, status, is_public, translation_locks_json, published_at, created_at, updated_at
       FROM fragments
       WHERE id = ?`,
    )
    .bind(id)
    .first<FragmentRow>();

  return row ? serializeFragment(row) : null;
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    return jsonResponse({ data: await listFragments(context.env.DB) });
  });

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    try {
      const body = await readJsonObject(context.request);
      const id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : crypto.randomUUID();
      const createdAt = nowIso();
      const source = {
        content: textField(body, "content", { fallback: "" }),
        location: optionalTextField(body, "location") ?? "",
      };
      const localizationPayload = parseFragmentLocalizationPayload(body);
      const localization = await buildFragmentLocalizations(context.env, source, undefined, localizationPayload);

      await context.env.DB
        .prepare(
          `INSERT INTO fragments (
            id, content_json, location_json, images_json, camera, mood, status, is_public, translation_locks_json, published_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          localization.content_json,
          localization.location_json,
          JSON.stringify(body.images_json ?? []),
          optionalTextField(body, "camera") ?? "",
          optionalTextField(body, "mood") ?? "",
          statusField(body),
          booleanField(body, "is_public", true),
          JSON.stringify(localizationPayload.translationLocks),
          optionalTextField(body, "published_at"),
          createdAt,
          createdAt,
        )
        .run();

      return jsonResponse({ data: await getFragmentById(context.env.DB, id), meta: { warnings: localization.warnings } }, { status: 201 });
    } catch (error) {
      return handleRequestError(error);
    }
  });
