import {
  handleRequestError,
  jsonResponse,
  nowIso,
  readJsonObject,
  requireAccess,
  textField,
  withErrorHandling,
} from "../../../_lib/api";
import { deterministicTags, runTextAi, type AiEnv } from "../../../_lib/ai";

type ImageUnderstanding = {
  altText: string;
  caption: string;
  tags: string[];
  seoDescription: string;
};

function normalizeImageUnderstanding(value: Partial<ImageUnderstanding>, fallback: ImageUnderstanding) {
  return {
    altText: typeof value.altText === "string" && value.altText.trim() ? value.altText.trim() : fallback.altText,
    caption: typeof value.caption === "string" && value.caption.trim() ? value.caption.trim() : fallback.caption,
    tags: Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean).slice(0, 8) : fallback.tags,
    seoDescription:
      typeof value.seoDescription === "string" && value.seoDescription.trim() ? value.seoDescription.trim() : fallback.seoDescription,
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    try {
      const body = await readJsonObject(context.request);
      const photoId = textField(body, "photoId", { required: true });
      const title = textField(body, "title");
      const description = textField(body, "description");
      const imageUrl = textField(body, "imageUrl");
      const location = textField(body, "location");
      const camera = textField(body, "camera");
      const lens = textField(body, "lens");
      const contextText = [title, description, imageUrl, location, camera, lens].filter(Boolean).join(". ");
      const fallback = {
        altText: description || `${title || "Photograph"}${location ? ` in ${location}` : ""}.`,
        caption: [title, location].filter(Boolean).join(" - ") || "Photograph from the archive.",
        tags: deterministicTags(contextText, 8),
        seoDescription: description || contextText || "A photograph from the visual archive.",
      };

      const response = await runTextAi(
        context.env as AiEnv,
        `Analyze this editorial photography record and return JSON only with keys altText, caption, tags array, seoDescription. Base the answer only on this metadata and image URL: ${contextText}`,
      );
      let data: ImageUnderstanding = fallback;
      try {
        if (response) data = normalizeImageUnderstanding(JSON.parse(response) as Partial<ImageUnderstanding>, fallback);
      } catch {
        data = fallback;
      }

      const timestamp = nowIso();
      await context.env.DB
        .prepare(
          `INSERT INTO ai_image_metadata (photo_id, alt_text, caption, tags, seo_description, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(photo_id) DO UPDATE SET
             alt_text = excluded.alt_text,
             caption = excluded.caption,
             tags = excluded.tags,
             seo_description = excluded.seo_description,
             updated_at = excluded.updated_at`,
        )
        .bind(photoId, data.altText, data.caption, JSON.stringify(data.tags), data.seoDescription, timestamp, timestamp)
        .run();

      return jsonResponse({ data, meta: { mode: response ? "ai" : "fallback" } });
    } catch (error) {
      return handleRequestError(error);
    }
  });
