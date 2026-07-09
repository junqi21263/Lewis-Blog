import { jsonResponse, methodNotAllowed, withErrorHandling } from "../../_lib/api";

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const result = await context.env.DB
      .prepare(
        `SELECT tags.id, tags.name, tags.slug, COUNT(post_tags.post_id) AS post_count
         FROM tags
         LEFT JOIN post_tags ON post_tags.tag_id = tags.id
         GROUP BY tags.id
         ORDER BY post_count DESC, tags.name ASC`,
      )
      .all();
    return jsonResponse({ data: result.results });
  });

export const onRequestPost: PagesFunction<Env> = () => methodNotAllowed();
