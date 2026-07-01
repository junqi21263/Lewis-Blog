import {
  booleanField,
  errorResponse,
  handleRequestError,
  jsonResponse,
  optionalNumberField,
  optionalTextField,
  parseJsonText,
  readJsonObject,
  requireAccess,
  routeParam,
  runWhitelistedUpdate,
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

export const onRequestPut: PagesFunction<Env, "id"> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) {
      return blocked;
    }

    try {
      const id = routeParam(context, "id");
      if (!id) {
        return errorResponse("Photo id is required.");
      }

      const body = await readJsonObject(context.request);
      const tags = stringArrayField(body, "tags");

      await runWhitelistedUpdate(context.env.DB, "photos", id, {
        title: body.title == null ? undefined : textField(body, "title", { required: true }),
        description: body.description == null ? undefined : optionalTextField(body, "description"),
        image_url: body.image_url == null ? undefined : textField(body, "image_url", { required: true }),
        location: body.location == null ? undefined : optionalTextField(body, "location"),
        taken_at: body.taken_at == null ? undefined : optionalTextField(body, "taken_at"),
        camera: body.camera == null ? undefined : optionalTextField(body, "camera"),
        lens: body.lens == null ? undefined : optionalTextField(body, "lens"),
        country: body.country == null ? undefined : optionalTextField(body, "country"),
        city: body.city == null ? undefined : optionalTextField(body, "city"),
        latitude: body.latitude == null ? undefined : optionalNumberField(body, "latitude"),
        longitude: body.longitude == null ? undefined : optionalNumberField(body, "longitude"),
        iso: body.iso == null ? undefined : optionalTextField(body, "iso"),
        aperture: body.aperture == null ? undefined : optionalTextField(body, "aperture"),
        shutter_speed: body.shutter_speed == null ? undefined : optionalTextField(body, "shutter_speed"),
        focal_length: body.focal_length == null ? undefined : optionalTextField(body, "focal_length"),
        alt_text: body.alt_text == null ? undefined : optionalTextField(body, "alt_text"),
        tags: body.tags == null ? undefined : JSON.stringify(tags),
        featured: body.featured == null ? undefined : booleanField(body, "featured"),
      });

      if (body.tags != null) {
        await syncPhotoTags(context.env.DB, id, tags);
      }

      const photo = await context.env.DB.prepare("SELECT * FROM photos WHERE id = ?").bind(id).first<PhotoRow>();
      return jsonResponse({ data: photo ? serializePhoto(photo) : null });
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
      return errorResponse("Photo id is required.");
    }

    const result = await context.env.DB.prepare("DELETE FROM photos WHERE id = ?").bind(id).run();
    if (result.meta.changes === 0) {
      return errorResponse("Photo not found.", 404);
    }

    return jsonResponse({ data: { id, deleted: true } });
  });
