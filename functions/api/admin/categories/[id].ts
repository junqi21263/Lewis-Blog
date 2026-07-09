import { errorResponse, jsonResponse, readJsonObject, requireAccess, routeParam, slugify, textField, withErrorHandling } from "../../../_lib/api";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export const onRequestPut: PagesFunction<Env, "id"> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    const id = routeParam(context, "id");
    if (!id) return errorResponse("Category id is required.");
    const body = await readJsonObject(context.request);
    const name = textField(body, "name", { required: true });
    const slug = textField(body, "slug", { fallback: slugify(name) });
    const sortOrder = Number(body.sort_order ?? 0);

    const result = await context.env.DB
      .prepare(
        `UPDATE categories
         SET name = ?, slug = ?, description = ?, icon = ?, color = ?, sort_order = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         WHERE id = ?`,
      )
      .bind(
        name,
        slug,
        typeof body.description === "string" ? body.description : "",
        typeof body.icon === "string" ? body.icon : "",
        typeof body.color === "string" ? body.color : "",
        Number.isFinite(sortOrder) ? sortOrder : 0,
        id,
      )
      .run();

    if (result.meta.changes === 0) return errorResponse("Category not found.", 404);
    const category = await context.env.DB.prepare("SELECT * FROM categories WHERE id = ?").bind(id).first<CategoryRow>();
    return jsonResponse({ data: category });
  });

export const onRequestDelete: PagesFunction<Env, "id"> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    const id = routeParam(context, "id");
    if (!id) return errorResponse("Category id is required.");
    const result = await context.env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
    if (result.meta.changes === 0) return errorResponse("Category not found.", 404);
    return jsonResponse({ data: { id, deleted: true } });
  });
