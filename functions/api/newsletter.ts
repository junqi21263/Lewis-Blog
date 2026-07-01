import {
  errorResponse,
  jsonResponse,
  methodNotAllowed,
  nowIso,
  readJsonObject,
  textField,
  withErrorHandling,
} from "../_lib/api";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const body = await readJsonObject(context.request);
    const email = normalizeEmail(textField(body, "email", { required: true }));
    if (!isEmail(email)) {
      return errorResponse("A valid email is required.", 400);
    }

    const id = crypto.randomUUID();
    const timestamp = nowIso();
    await context.env.DB
      .prepare(
        `INSERT INTO newsletter_subscribers (id, email, source, status, created_at, updated_at)
         VALUES (?, ?, ?, 'subscribed', ?, ?)
         ON CONFLICT(email) DO UPDATE SET status = 'subscribed', updated_at = excluded.updated_at`,
      )
      .bind(id, email, "site", timestamp, timestamp)
      .run();

    return jsonResponse({ data: { subscribed: true } }, { status: 201 });
  });

export const onRequestGet: PagesFunction<Env> = () => methodNotAllowed();
export const onRequestPut: PagesFunction<Env> = () => methodNotAllowed();
export const onRequestDelete: PagesFunction<Env> = () => methodNotAllowed();
