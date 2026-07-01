import { handleRequestError, jsonResponse, readJsonObject, requireAccess, textField, withErrorHandling } from "../../../_lib/api";
import { deterministicSummary, runTextAi, type AiEnv } from "../../../_lib/ai";

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    try {
      const body = await readJsonObject(context.request);
      const title = textField(body, "title");
      const content = textField(body, "content", { required: true });
      const fallback = deterministicSummary(`${title}\n\n${content}`);
      const response = await runTextAi(
        context.env as AiEnv,
        `Summarize this article as JSON with keys summary, tldr, keyTakeaways array, readingDifficulty. Return only JSON.\n\nTitle: ${title}\n\n${content.slice(0, 8000)}`,
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
