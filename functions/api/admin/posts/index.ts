import {
  booleanField,
  handleRequestError,
  jsonResponse,
  nowIso,
  optionalTextField,
  readJsonObject,
  readingTimeFromContent,
  requireAccess,
  statusField,
  stringArrayField,
  syncPostTags,
  textField,
  withErrorHandling,
} from "../../../_lib/api";
import { buildPostLocalizations, parsePostLocalizationPayload } from "../../../_lib/localization";

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
       GROUP BY posts.id
       ORDER BY posts.pinned DESC, posts.published_at DESC, posts.updated_at DESC`,
    )
    .all<PostRow>();

  return result.results.map(serializePost);
}

async function getPostById(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT posts.*, GROUP_CONCAT(tags.name) AS tag_names
       FROM posts
       LEFT JOIN post_tags ON post_tags.post_id = posts.id
       LEFT JOIN tags ON tags.id = post_tags.tag_id
       WHERE posts.id = ?
       GROUP BY posts.id`,
    )
    .bind(id)
    .first<PostRow>();

  return row ? serializePost(row) : null;
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) {
      return blocked;
    }

    const posts = await listPosts(context.env.DB);
    return jsonResponse({ data: posts });
  });

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) {
      return blocked;
    }

    try {
      const body = await readJsonObject(context.request);
      const title = textField(body, "title", { required: true });
      const slug = textField(body, "slug", { fallback: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") });
      const content = textField(body, "content", { required: true });
      const id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : crypto.randomUUID();
      const createdAt = nowIso();
      const tags = stringArrayField(body, "tags");
      const localizationPayload = parsePostLocalizationPayload(body);
      const source = {
        title,
        excerpt: optionalTextField(body, "excerpt") ?? optionalTextField(body, "subtitle") ?? "",
        content,
        seoTitle: optionalTextField(body, "seo_title") ?? title,
        seoDescription: optionalTextField(body, "seo_description") ?? optionalTextField(body, "excerpt") ?? optionalTextField(body, "subtitle") ?? "",
      };
      const localization = await buildPostLocalizations(context.env, source, undefined, {
        ...localizationPayload,
        generateTranslations: Boolean(body.generate_translations),
      });

      await context.env.DB
        .prepare(
          `INSERT INTO posts (
            id, title, subtitle, slug, excerpt, content, cover_image_url, status, category_id,
            cover_display_mode, cover_focal_x, cover_focal_y, cover_width, cover_height, cover_aspect_ratio,
            featured, pinned, seo_title, seo_description, title_json, excerpt_json, content_json,
            seo_title_json, seo_description_json, translation_locks_json, reading_time, published_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          title,
          optionalTextField(body, "subtitle"),
          slug,
          optionalTextField(body, "excerpt"),
          content,
          optionalTextField(body, "cover_image_url"),
          statusField(body),
          optionalTextField(body, "category_id"),
          typeof body.cover_display_mode === "string" ? body.cover_display_mode : "cover",
          Math.min(100, Math.max(0, Math.round(Number(body.cover_focal_x ?? 50)))),
          Math.min(100, Math.max(0, Math.round(Number(body.cover_focal_y ?? 50)))),
          body.cover_width == null ? null : Math.max(0, Math.round(Number(body.cover_width))),
          body.cover_height == null ? null : Math.max(0, Math.round(Number(body.cover_height))),
          body.cover_aspect_ratio == null ? null : Number(body.cover_aspect_ratio),
          booleanField(body, "featured"),
          booleanField(body, "pinned"),
          optionalTextField(body, "seo_title"),
          optionalTextField(body, "seo_description"),
          localization.title_json,
          localization.excerpt_json,
          localization.content_json,
          localization.seo_title_json,
          localization.seo_description_json,
          JSON.stringify(localizationPayload.translationLocks),
          Math.max(1, Math.floor(Number(body.reading_time) || readingTimeFromContent(content))),
          optionalTextField(body, "published_at"),
          createdAt,
          createdAt,
        )
        .run();

      if (tags.length > 0) {
        await syncPostTags(context.env.DB, id, tags);
      }

      const post = await getPostById(context.env.DB, id);
      return jsonResponse({ data: post, meta: { warnings: localization.warnings } }, { status: 201 });
    } catch (error) {
      return handleRequestError(error);
    }
  });
