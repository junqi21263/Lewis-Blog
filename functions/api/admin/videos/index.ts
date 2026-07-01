import {
  booleanField,
  handleRequestError,
  jsonResponse,
  nowIso,
  optionalTextField,
  platformField,
  readJsonObject,
  requireAccess,
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

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) {
      return blocked;
    }

    const result = await context.env.DB
      .prepare("SELECT * FROM videos ORDER BY featured DESC, updated_at DESC")
      .all<VideoRow>();

    return jsonResponse({ data: result.results.map(serializeVideo) });
  });

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) {
      return blocked;
    }

    try {
      const body = await readJsonObject(context.request);
      const id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : crypto.randomUUID();
      const createdAt = nowIso();

      await context.env.DB
        .prepare(
          `INSERT INTO videos (
            id, title, description, cover_image_url, video_url, platform, duration, featured, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          textField(body, "title", { required: true }),
          optionalTextField(body, "description"),
          optionalTextField(body, "cover_image_url"),
          textField(body, "video_url", { required: true }),
          platformField(body),
          optionalTextField(body, "duration"),
          booleanField(body, "featured"),
          createdAt,
          createdAt,
        )
        .run();

      const video = await context.env.DB.prepare("SELECT * FROM videos WHERE id = ?").bind(id).first<VideoRow>();
      return jsonResponse({ data: video ? serializeVideo(video) : null }, { status: 201 });
    } catch (error) {
      return handleRequestError(error);
    }
  });
