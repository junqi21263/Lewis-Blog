import { errorResponse, jsonResponse, readJsonObject, requireAccess, slugify, textField, withErrorHandling } from "../../../_lib/api";

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

async function listCategories(db: D1Database) {
  const result = await db
    .prepare("SELECT id, name, slug, description, icon, color, sort_order, created_at, updated_at FROM categories ORDER BY sort_order ASC, name ASC")
    .all<CategoryRow>();
  return result.results;
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;
    return jsonResponse({ data: await listCategories(context.env.DB) });
  });

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    const body = await readJsonObject(context.request);
    const name = textField(body, "name", { required: true });
    const slug = textField(body, "slug", { fallback: slugify(name) });
    if (!slug) return errorResponse("Category slug is required.");
    const id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : slug;
    const sortOrder = Number(body.sort_order ?? 0);

    await context.env.DB
      .prepare(
        `INSERT INTO categories (id, name, slug, description, icon, color, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
      )
      .bind(
        id,
        name,
        slug,
        typeof body.description === "string" ? body.description : "",
        typeof body.icon === "string" ? body.icon : "",
        typeof body.color === "string" ? body.color : "",
        Number.isFinite(sortOrder) ? sortOrder : 0,
      )
      .run();

    const category = await context.env.DB.prepare("SELECT * FROM categories WHERE id = ?").bind(id).first<CategoryRow>();
    return jsonResponse({ data: category }, { status: 201 });
  });
