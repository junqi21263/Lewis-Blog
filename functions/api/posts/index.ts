import {
  jsonResponse,
  methodNotAllowed,
  withErrorHandling,
} from "../../_lib/api";
import { localizePostRecord, localeFromRequest } from "../../_lib/localization";

type PostRow = Record<string, unknown> & {
  featured: number;
  pinned: number;
  tag_names: string | null;
};

function serializePost(row: PostRow) {
  const { tag_names: tagNames, ...post } = row;
  return {
    ...post,
    featured: Boolean(row.featured),
    pinned: Boolean(row.pinned),
    tags: tagNames ? tagNames.split(",").filter(Boolean) : [],
  };
}

async function listPosts(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT posts.*, GROUP_CONCAT(tags.name) AS tag_names
       FROM posts
       LEFT JOIN post_tags ON post_tags.post_id = posts.id
       LEFT JOIN tags ON tags.id = post_tags.tag_id
       WHERE posts.status = 'published'
       GROUP BY posts.id
       ORDER BY COALESCE(NULLIF(posts.published_at, ''), posts.created_at) DESC, posts.created_at DESC`,
    )
    .all<PostRow>();

  return result.results.map(serializePost);
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const locale = localeFromRequest(context.request);
    const posts = await listPosts(context.env.DB);
    return jsonResponse({ data: posts.map((post) => localizePostRecord(post, locale)) });
  });

export const onRequestPost: PagesFunction<Env> = () => methodNotAllowed();
