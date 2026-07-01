import {
  booleanField,
  errorResponse,
  handleRequestError,
  jsonResponse,
  optionalTextField,
  platformField,
  readJsonObject,
  requireAccess,
  routeParam,
  runWhitelistedUpdate,
  textField,
  withErrorHandling,
} from "../../../_lib/api";

type VideoRow = Record<string, unknown> & {
  featured: number;
};

function serializeVideo(row: VideoRow) {
  return {
    ...row,
    featured: Boolean(row.featured),
  };
}

export const onRequestPut: PagesFunction<Env, "id"> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) {
      return blocked;
    }

    try {
      const id = routeParam(context, "id");
      if (!id) {
        return errorResponse("Video id is required.");
      }

      const body = await readJsonObject(context.request);
      await runWhitelistedUpdate(context.env.DB, "videos", id, {
        title: body.title == null ? undefined : textField(body, "title", { required: true }),
        description: body.description == null ? undefined : optionalTextField(body, "description"),
        cover_image_url: body.cover_image_url == null ? undefined : optionalTextField(body, "cover_image_url"),
        video_url: body.video_url == null ? undefined : textField(body, "video_url", { required: true }),
        platform: body.platform == null ? undefined : platformField(body),
        duration: body.duration == null ? undefined : optionalTextField(body, "duration"),
        featured: body.featured == null ? undefined : booleanField(body, "featured"),
      });

      const video = await context.env.DB.prepare("SELECT * FROM videos WHERE id = ?").bind(id).first<VideoRow>();
      return jsonResponse({ data: video ? serializeVideo(video) : null });
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
      return errorResponse("Video id is required.");
    }

    const result = await context.env.DB.prepare("DELETE FROM videos WHERE id = ?").bind(id).run();
    if (result.meta.changes === 0) {
      return errorResponse("Video not found.", 404);
    }

    return jsonResponse({ data: { id, deleted: true } });
  });
