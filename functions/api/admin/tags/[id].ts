import { errorResponse, jsonResponse, readJsonObject, requireAccess, routeParam, slugify, textField, withErrorHandling } from "../../../_lib/api";

type TagRow = {
  id: string;
  name: string;
  slug: string;
  post_count: number;
  created_at: string;
  updated_at: string;
};

export const onRequestPut: PagesFunction<Env, "id"> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    const id = routeParam(context, "id");
    if (!id) return errorResponse("Tag id is required.");
    const body = await readJsonObject(context.request);
    const name = textField(body, "name", { required: true });
    const slug = textField(body, "slug", { fallback: slugify(name) });
    const result = await context.env.DB
      .prepare("UPDATE tags SET name = ?, slug = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?")
      .bind(name, slug, id)
      .run();
    if (result.meta.changes === 0) return errorResponse("Tag not found.", 404);
    const tag = await context.env.DB
      .prepare(
        `SELECT tags.id, tags.name, tags.slug, tags.created_at, tags.updated_at, COUNT(post_tags.post_id) AS post_count
         FROM tags
         LEFT JOIN post_tags ON post_tags.tag_id = tags.id
         WHERE tags.id = ?
         GROUP BY tags.id`,
      )
      .bind(id)
      .first<TagRow>();
    return jsonResponse({ data: tag });
  });

export const onRequestDelete: PagesFunction<Env, "id"> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    const id = routeParam(context, "id");
    if (!id) return errorResponse("Tag id is required.");
    const result = await context.env.DB.prepare("DELETE FROM tags WHERE id = ?").bind(id).run();
    if (result.meta.changes === 0) return errorResponse("Tag not found.", 404);
    return jsonResponse({ data: { id, deleted: true } });
  });
