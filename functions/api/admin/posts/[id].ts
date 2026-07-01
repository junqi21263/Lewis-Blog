import {
  booleanField,
  errorResponse,
  handleRequestError,
  jsonResponse,
  optionalTextField,
  readJsonObject,
  readingTimeFromContent,
  requireAccess,
  routeParam,
  runWhitelistedUpdate,
  statusField,
  stringArrayField,
  syncPostTags,
  textField,
  withErrorHandling,
} from "../../../_lib/api";
import { buildPostLocalizations, parsePostLocalizationPayload } from "../../../_lib/localization";

export const onRequestPut: PagesFunction<Env, "id"> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) {
      return blocked;
    }

    try {
      const id = routeParam(context, "id");
      if (!id) {
        return errorResponse("Post id is required.");
      }

      const body = await readJsonObject(context.request);
      const content = typeof body.content === "string" ? body.content : undefined;
      const tags = stringArrayField(body, "tags");
      const localizationPayload = parsePostLocalizationPayload(body);
      const existing = await context.env.DB
        .prepare("SELECT title, excerpt, content, seo_title, seo_description, title_json, excerpt_json, content_json, seo_title_json, seo_description_json, translation_locks_json FROM posts WHERE id = ?")
        .bind(id)
        .first<Record<string, string | null>>();
      const title = body.title == null ? existing?.title ?? "" : textField(body, "title", { required: true });
      const excerpt = body.excerpt == null ? existing?.excerpt ?? "" : optionalTextField(body, "excerpt") ?? "";
      const nextContent = content ?? existing?.content ?? "";
      const subtitle = body.subtitle == null ? "" : optionalTextField(body, "subtitle") ?? "";
      const seoTitle = body.seo_title == null ? existing?.seo_title ?? title : optionalTextField(body, "seo_title") ?? title;
      const seoDescription =
        body.seo_description == null
          ? existing?.seo_description ?? excerpt
          : optionalTextField(body, "seo_description") ?? (excerpt || subtitle);
      const localization =
        body.title != null ||
        body.excerpt != null ||
        body.content != null ||
        body.seo_title != null ||
        body.seo_description != null ||
        body.localized_fields != null ||
        body.regenerate_locales != null
          ? await buildPostLocalizations(
              context.env,
              {
                title,
                excerpt,
                content: nextContent,
                seoTitle,
                seoDescription,
              },
              existing ?? undefined,
              {
                ...localizationPayload,
                generateTranslations: Boolean(body.generate_translations),
              },
            )
          : null;

      await runWhitelistedUpdate(context.env.DB, "posts", id, {
        title: body.title == null ? undefined : title,
        subtitle: body.subtitle == null ? undefined : optionalTextField(body, "subtitle"),
        slug: body.slug == null ? undefined : textField(body, "slug", { required: true }),
        excerpt: body.excerpt == null ? undefined : excerpt,
        content,
        cover_image_url: body.cover_image_url == null ? undefined : optionalTextField(body, "cover_image_url"),
        status: body.status == null ? undefined : statusField(body),
        category_id: body.category_id == null ? undefined : optionalTextField(body, "category_id"),
        featured: body.featured == null ? undefined : booleanField(body, "featured"),
        pinned: body.pinned == null ? undefined : booleanField(body, "pinned"),
        seo_title: body.seo_title == null ? undefined : seoTitle,
        seo_description: body.seo_description == null ? undefined : seoDescription,
        title_json: localization?.title_json,
        excerpt_json: localization?.excerpt_json,
        content_json: localization?.content_json,
        seo_title_json: localization?.seo_title_json,
        seo_description_json: localization?.seo_description_json,
        translation_locks_json: body.translation_locks == null ? undefined : JSON.stringify(localizationPayload.translationLocks),
        reading_time:
          body.reading_time == null
            ? content
              ? readingTimeFromContent(content)
              : undefined
            : Math.max(1, Math.floor(Number(body.reading_time))),
        published_at: body.published_at == null ? undefined : optionalTextField(body, "published_at"),
      });

      if (body.tags != null) {
        await syncPostTags(context.env.DB, id, tags);
      }

      const post = await context.env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
      return jsonResponse({ data: post, meta: { warnings: localization?.warnings ?? [] } });
    } catch (error) {
      return handleRequestError(error);
    }
  });

export const onRequestDelete: PagesFunction<Env, "id"> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) {
      return blocked;
    }

    const id = routeParam(context, "id");
    if (!id) {
      return errorResponse("Post id is required.");
    }

    const result = await context.env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
    if (result.meta.changes === 0) {
      return errorResponse("Post not found.", 404);
    }

    return jsonResponse({ data: { id, deleted: true } });
  });
