import { errorResponse, jsonResponse, methodNotAllowed, routeParam, withErrorHandling } from "../../../_lib/api";
import { localeFromRequest, localizedValue, prefixedPath } from "../../../_lib/localization";

type NavRow = {
  id: string;
  title: string;
  title_json: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_json: string | null;
  category: string | null;
  category_id: string | null;
  published_at: string | null;
  updated_at: string;
  tag_names: string | null;
};

function tagsFor(row: NavRow) {
  return row.tag_names ? row.tag_names.split(",").filter(Boolean) : [];
}

function serializeItem(row: NavRow, locale: ReturnType<typeof localeFromRequest>) {
  return {
    slug: row.slug,
    title: localizedValue(row.title, row.title_json, locale),
    excerpt: localizedValue(row.excerpt, row.excerpt_json, locale),
    category: row.category,
    href: prefixedPath(locale, `/journal/${row.slug}`),
  };
}

async function listPublishedPosts(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT posts.id, posts.title, posts.title_json, posts.slug, posts.excerpt, posts.excerpt_json, posts.category_id,
              posts.published_at, posts.updated_at, categories.name AS category,
              GROUP_CONCAT(DISTINCT tags.name) AS tag_names
       FROM posts
       LEFT JOIN categories ON categories.id = posts.category_id
       LEFT JOIN post_tags ON post_tags.post_id = posts.id
       LEFT JOIN tags ON tags.id = post_tags.tag_id
       WHERE posts.status = 'published'
       GROUP BY posts.id
       ORDER BY posts.published_at DESC, posts.updated_at DESC`,
    )
    .all<NavRow>();

  return result.results;
}

export const onRequestGet: PagesFunction<Env, "identifier"> = async (context) =>
  await withErrorHandling(async () => {
    const slug = routeParam(context, "identifier");
    const locale = localeFromRequest(context.request);
    if (!slug) {
      return errorResponse("Post slug is required.");
    }

    const posts = await listPublishedPosts(context.env.DB);
    const index = posts.findIndex((post) => post.slug === slug);
    if (index < 0) {
      return errorResponse("Post not found.", 404);
    }

    const current = posts[index];
    const currentTags = new Set(tagsFor(current));
    const related = posts
      .filter((post) => post.slug !== slug)
      .map((post) => {
        const sharedTags = tagsFor(post).filter((tag) => currentTags.has(tag)).length;
        const sameCategory = post.category_id && post.category_id === current.category_id ? 2 : 0;
        return { post, score: sharedTags + sameCategory };
      })
      .sort((a, b) => b.score - a.score || (b.post.published_at ?? b.post.updated_at).localeCompare(a.post.published_at ?? a.post.updated_at))
      .slice(0, 2)
      .map(({ post }) => serializeItem(post, locale));

    return jsonResponse({
      data: {
        previous: index < posts.length - 1 ? serializeItem(posts[index + 1], locale) : null,
        next: index > 0 ? serializeItem(posts[index - 1], locale) : null,
        related,
      },
    });
  });

export const onRequestPost: PagesFunction<Env> = () => methodNotAllowed();
