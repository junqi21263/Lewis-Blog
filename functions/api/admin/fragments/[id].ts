import {
  booleanField,
  handleRequestError,
  jsonResponse,
  optionalTextField,
  readJsonObject,
  requireAccess,
  routeParam,
  runWhitelistedUpdate,
  statusField,
  textField,
  withErrorHandling,
  RequestError,
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

    const id = routeParam(context, "id");
    if (!id) return jsonResponse({ error: { message: "Fragment id is required." } }, { status: 400 });
    const fragment = await getFragmentById(context.env.DB, id);
    if (!fragment) return jsonResponse({ error: { message: "Fragment not found." } }, { status: 404 });
    return jsonResponse({ data: fragment });
  });

export const onRequestPut: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    try {
      const id = routeParam(context, "id");
      if (!id) {
        throw new RequestError("Fragment id is required.");
      }

      const existing = await context.env.DB
        .prepare("SELECT content_json, location_json FROM fragments WHERE id = ?")
        .bind(id)
        .first<{ content_json?: string | null; location_json?: string | null }>();
      if (!existing) {
        throw new RequestError("Fragment not found.", 404);
      }

      const body = await readJsonObject(context.request);
      const source = {
        content: textField(body, "content", { fallback: "" }),
        location: optionalTextField(body, "location") ?? "",
      };
      const localizationPayload = parseFragmentLocalizationPayload(body);
      const localization = await buildFragmentLocalizations(context.env, source, existing, localizationPayload);

      await runWhitelistedUpdate(context.env.DB, "fragments", id, {
        content_json: localization.content_json,
        location_json: localization.location_json,
        images_json: JSON.stringify(body.images_json ?? []),
        camera: optionalTextField(body, "camera") ?? "",
        mood: optionalTextField(body, "mood") ?? "",
        status: statusField(body),
        is_public: booleanField(body, "is_public", true),
        translation_locks_json: JSON.stringify(localizationPayload.translationLocks),
        published_at: optionalTextField(body, "published_at"),
      });

      return jsonResponse({ data: await getFragmentById(context.env.DB, id), meta: { warnings: localization.warnings } });
    } catch (error) {
      return handleRequestError(error);
    }
  });

export const onRequestDelete: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    const id = routeParam(context, "id");
    if (!id) return jsonResponse({ error: { message: "Fragment id is required." } }, { status: 400 });
    const result = await context.env.DB.prepare("DELETE FROM fragments WHERE id = ?").bind(id).run();
    if ((result.meta.changes ?? 0) === 0) {
      return jsonResponse({ error: { message: "Fragment not found." } }, { status: 404 });
    }
    return jsonResponse({ data: { id, deleted: true } });
  });
