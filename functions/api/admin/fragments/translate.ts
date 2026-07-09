import { jsonResponse, readJsonObject, requireAccess, textField, withErrorHandling } from "../../../_lib/api";
import { translateFragmentPreview } from "../../../_lib/fragments";

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    const body = await readJsonObject(context.request);
    const data = await translateFragmentPreview(context.env, {
      content: textField(body, "content", { fallback: "" }),
      location: textField(body, "location", { fallback: "" }),
    });
    return jsonResponse({ data });
  });
