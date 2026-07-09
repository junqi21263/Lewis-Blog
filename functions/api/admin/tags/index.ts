import { errorResponse, jsonResponse, readJsonObject, requireAccess, slugify, textField, withErrorHandling } from "../../../_lib/api";

type TagRow = {
  id: string;
  name: string;
  slug: string;
  post_count: number;
  created_at: string;
  updated_at: string;
};

async function listTags(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT tags.id, tags.name, tags.slug, tags.created_at, tags.updated_at, COUNT(post_tags.post_id) AS post_count
       FROM tags
       LEFT JOIN post_tags ON post_tags.tag_id = tags.id
       GROUP BY tags.id
       ORDER BY post_count DESC, tags.name ASC`,
    )
    .all<TagRow>();
  return result.results;
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;
    return jsonResponse({ data: await listTags(context.env.DB) });
  });

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    const body = await readJsonObject(context.request);
    const name = textField(body, "name", { required: true });
    const slug = textField(body, "slug", { fallback: slugify(name) });
    if (!slug) return errorResponse("Tag slug is required.");
    const id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : slug;
    await context.env.DB
      .prepare(
        `INSERT INTO tags (id, name, slug, created_at, updated_at)
         VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
      )
      .bind(id, name, slug)
      .run();
    const tag = await context.env.DB
      .prepare("SELECT tags.*, 0 AS post_count FROM tags WHERE id = ?")
      .bind(id)
      .first<TagRow>();
    return jsonResponse({ data: tag }, { status: 201 });
  });
