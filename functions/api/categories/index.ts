import { jsonResponse, methodNotAllowed, withErrorHandling } from "../../_lib/api";

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const result = await context.env.DB
      .prepare("SELECT id, name, slug, description, icon, color, sort_order FROM categories ORDER BY sort_order ASC, name ASC")
      .all();
    return jsonResponse({ data: result.results });
  });

export const onRequestPost: PagesFunction<Env> = () => methodNotAllowed();
