import { jsonResponse, methodNotAllowed, withErrorHandling } from "../_lib/api";
import { localeFromRequest, localizedValue, prefixedPath } from "../_lib/localization";

type SearchRow = {
  id: string;
  title: string;
  title_json: string | null;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  excerpt_json: string | null;
  category: string | null;
  category_slug: string | null;
  tag_names: string | null;
};

function likeValue(value: string) {
  return `%${value.trim().toLowerCase().replace(/[%_]/g, "\\$&")}%`;
}

function serializeRow(row: SearchRow, locale: ReturnType<typeof localeFromRequest>) {
  const tags = row.tag_names ? row.tag_names.split(",").filter(Boolean) : [];
  return {
    type: "Article" as const,
    id: row.id,
    title: localizedValue(row.title, row.title_json, locale),
    description: localizedValue(row.excerpt || row.subtitle || "Published journal entry.", row.excerpt_json, locale),
    href: prefixedPath(locale, `/journal/${row.slug}`),
    category: row.category,
    tags,
    excerpt: localizedValue(row.excerpt, row.excerpt_json, locale),
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const url = new URL(context.request.url);
    const query = url.searchParams.get("q") ?? "";
    const category = url.searchParams.get("category") ?? "";
    const tag = url.searchParams.get("tag") ?? "";
    const locale = localeFromRequest(context.request);
    const where = ["posts.status = 'published'"];
    const bindings: string[] = [];

    if (query.trim()) {
      const value = likeValue(query);
      where.push(
        `(LOWER(posts.title) LIKE ? ESCAPE '\\'
          OR LOWER(COALESCE(posts.title_json, '')) LIKE ? ESCAPE '\\'
          OR LOWER(posts.subtitle) LIKE ? ESCAPE '\\'
          OR LOWER(posts.excerpt) LIKE ? ESCAPE '\\'
          OR LOWER(COALESCE(posts.excerpt_json, '')) LIKE ? ESCAPE '\\'
          OR LOWER(posts.content) LIKE ? ESCAPE '\\'
          OR LOWER(COALESCE(posts.content_json, '')) LIKE ? ESCAPE '\\'
          OR LOWER(categories.name) LIKE ? ESCAPE '\\'
          OR LOWER(tags.name) LIKE ? ESCAPE '\\')`,
      );
      bindings.push(value, value, value, value, value, value, value, value, value);
    }

    if (category.trim()) {
      where.push("(LOWER(categories.name) = ? OR LOWER(categories.slug) = ?)");
      bindings.push(category.trim().toLowerCase(), category.trim().toLowerCase());
    }

    if (tag.trim()) {
      where.push("EXISTS (SELECT 1 FROM post_tags filter_post_tags INNER JOIN tags filter_tags ON filter_tags.id = filter_post_tags.tag_id WHERE filter_post_tags.post_id = posts.id AND (LOWER(filter_tags.name) = ? OR LOWER(filter_tags.slug) = ?))");
      bindings.push(tag.trim().toLowerCase(), tag.trim().toLowerCase());
    }

    const result = await context.env.DB
      .prepare(
        `SELECT posts.id, posts.title, posts.title_json, posts.slug, posts.subtitle, posts.excerpt, posts.excerpt_json,
                categories.name AS category, categories.slug AS category_slug,
                GROUP_CONCAT(DISTINCT tags.name) AS tag_names
         FROM posts
         LEFT JOIN categories ON categories.id = posts.category_id
         LEFT JOIN post_tags ON post_tags.post_id = posts.id
         LEFT JOIN tags ON tags.id = post_tags.tag_id
         WHERE ${where.join(" AND ")}
         GROUP BY posts.id
         ORDER BY posts.pinned DESC, posts.published_at DESC, posts.updated_at DESC
         LIMIT 12`,
      )
      .bind(...bindings)
      .all<SearchRow>();

    return jsonResponse({ data: result.results.map((row) => serializeRow(row, locale)) });
  });

export const onRequestPost: PagesFunction<Env> = () => methodNotAllowed();
