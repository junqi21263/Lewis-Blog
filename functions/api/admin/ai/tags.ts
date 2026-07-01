import { handleRequestError, jsonResponse, readJsonObject, requireAccess, textField, withErrorHandling } from "../../../_lib/api";
import { deterministicTags, runTextAi, type AiEnv } from "../../../_lib/ai";

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    try {
      const body = await readJsonObject(context.request);
      const content = textField(body, "content", { required: true });
      const fallback = deterministicTags(content, 8);
      const response = await runTextAi(
        context.env as AiEnv,
        `Return 6 to 8 concise editorial tags as a JSON array of strings. Avoid generic words.\n\n${content.slice(0, 8000)}`,
      );
      let tags = fallback;
      try {
        const parsed = response ? JSON.parse(response) : null;
        if (Array.isArray(parsed)) tags = parsed.filter((item): item is string => typeof item === "string").slice(0, 8);
      } catch {
        tags = fallback;
      }

      return jsonResponse({ data: { tags }, meta: { mode: response ? "ai" : "fallback" } });
    } catch (error) {
      return handleRequestError(error);
    }
  });
