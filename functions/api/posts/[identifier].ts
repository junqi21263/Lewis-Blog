import {
  errorResponse,
  jsonResponse,
  methodNotAllowed,
  routeParam,
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

async function getPostBySlug(db: D1Database, slug: string) {
  return await db
    .prepare(
      `SELECT posts.*, GROUP_CONCAT(tags.name) AS tag_names
       FROM posts
       LEFT JOIN post_tags ON post_tags.post_id = posts.id
       LEFT JOIN tags ON tags.id = post_tags.tag_id
       WHERE posts.slug = ? AND posts.status = 'published'
       GROUP BY posts.id`,
    )
    .bind(slug)
    .first<PostRow>();
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const slug = routeParam(context, "identifier");
    const locale = localeFromRequest(context.request);
    if (!slug) {
      return errorResponse("Post slug is required.");
    }

    const post = await getPostBySlug(context.env.DB, slug);
    if (!post) {
      return errorResponse("Post not found.", 404);
    }

    return jsonResponse({ data: localizePostRecord(serializePost(post), locale) });
  });

export const onRequestPut: PagesFunction<Env> = () => methodNotAllowed();

export const onRequestDelete: PagesFunction<Env> = () => methodNotAllowed();
