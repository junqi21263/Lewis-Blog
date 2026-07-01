import { handleRequestError, jsonResponse, readJsonObject, requireAccess, textField, withErrorHandling } from "../../../_lib/api";
import { deterministicTags, runTextAi, type AiEnv } from "../../../_lib/ai";

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    try {
      const body = await readJsonObject(context.request);
      const title = textField(body, "title");
      const description = textField(body, "description");
      const location = textField(body, "location");
      const camera = textField(body, "camera");
      const lens = textField(body, "lens");
      const contextText = [title, description, location, camera, lens].filter(Boolean).join(". ");
      const fallback = {
        altText: description || `${title || "Photograph"}${location ? ` in ${location}` : ""}.`,
        caption: [title, location].filter(Boolean).join(" - "),
        tags: deterministicTags(contextText, 6),
        seoDescription: description || contextText,
      };
      const response = await runTextAi(
        context.env as AiEnv,
        `Create image metadata as JSON with keys altText, caption, tags array, seoDescription. Use this provided context only: ${contextText}`,
      );
      let data = fallback;
      try {
        if (response) data = { ...fallback, ...(JSON.parse(response) as Partial<typeof fallback>) };
      } catch {
        data = fallback;
      }

      return jsonResponse({ data, meta: { mode: response ? "ai" : "fallback" } });
    } catch (error) {
      return handleRequestError(error);
    }
  });
