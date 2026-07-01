import {
  booleanField,
  handleRequestError,
  jsonResponse,
  nowIso,
  optionalNumberField,
  optionalTextField,
  parseJsonText,
  readJsonObject,
  requireAccess,
  stringArrayField,
  syncPhotoTags,
  textField,
  withErrorHandling,
} from "../../../_lib/api";

type PhotoRow = Record<string, unknown> & {
  featured: number;
  tags: string;
};

function serializePhoto(row: PhotoRow) {
  return {
    ...row,
    featured: Boolean(row.featured),
    tags: parseJsonText(row.tags, []),
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) {
      return blocked;
    }

    const result = await context.env.DB
      .prepare("SELECT * FROM photos ORDER BY featured DESC, taken_at DESC, updated_at DESC")
      .all<PhotoRow>();

    return jsonResponse({ data: result.results.map(serializePhoto) });
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
      const title = textField(body, "title", { required: true });
      const imageUrl = textField(body, "image_url", { required: true });
      const tags = stringArrayField(body, "tags");
      const createdAt = nowIso();

      await context.env.DB
        .prepare(
          `INSERT INTO photos (
            id, title, description, image_url, location, taken_at, camera, lens, tags, featured,
            country, city, latitude, longitude, iso, aperture, shutter_speed, focal_length, alt_text,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          title,
          optionalTextField(body, "description"),
          imageUrl,
          optionalTextField(body, "location"),
          optionalTextField(body, "taken_at"),
          optionalTextField(body, "camera"),
          optionalTextField(body, "lens"),
          JSON.stringify(tags),
          booleanField(body, "featured"),
          optionalTextField(body, "country"),
          optionalTextField(body, "city"),
          optionalNumberField(body, "latitude"),
          optionalNumberField(body, "longitude"),
          optionalTextField(body, "iso"),
          optionalTextField(body, "aperture"),
          optionalTextField(body, "shutter_speed"),
          optionalTextField(body, "focal_length"),
          optionalTextField(body, "alt_text"),
          createdAt,
          createdAt,
        )
        .run();

      if (tags.length > 0) {
        await syncPhotoTags(context.env.DB, id, tags);
      }

      const photo = await context.env.DB.prepare("SELECT * FROM photos WHERE id = ?").bind(id).first<PhotoRow>();
      return jsonResponse({ data: photo ? serializePhoto(photo) : null }, { status: 201 });
    } catch (error) {
      return handleRequestError(error);
    }
  });
