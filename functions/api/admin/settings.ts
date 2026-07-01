import { handleRequestError, jsonResponse, nowIso, readJsonObject, requireAccess, withErrorHandling } from "../../_lib/api";

function parseSetting(value: string, valueType: string) {
  if (valueType === "boolean") {
    return value === "true";
  }
  if (valueType === "number") {
    return Number(value);
  }
  if (valueType === "string") {
    return value;
  }
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function inferValueType(value: unknown) {
  if (typeof value === "boolean") {
    return "boolean";
  }
  if (typeof value === "number") {
    return "number";
  }
  if (typeof value === "string") {
    return "string";
  }
  return "json";
}

function serializeValue(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) {
      return blocked;
    }

    const result = await context.env.DB.prepare("SELECT key, value, value_type FROM site_settings ORDER BY key ASC").all<{
      key: string;
      value: string;
      value_type: string;
    }>();

    const settings: Record<string, unknown> = {};
    for (const row of result.results) {
      settings[row.key] = parseSetting(row.value, row.value_type);
    }

    return jsonResponse({ data: settings });
  });

export const onRequestPut: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) {
      return blocked;
    }

    try {
      const body = await readJsonObject(context.request);
      const updatedAt = nowIso();

      for (const [key, value] of Object.entries(body)) {
        if (!/^[a-zA-Z0-9_.-]+$/.test(key)) {
          return jsonResponse({ error: { message: `Invalid setting key: ${key}` } }, { status: 400 });
        }

        const valueType = inferValueType(value);
        await context.env.DB
          .prepare(
            `INSERT INTO site_settings (key, value, value_type, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(key) DO UPDATE SET
               value = excluded.value,
               value_type = excluded.value_type,
               updated_at = excluded.updated_at`,
          )
          .bind(key, serializeValue(value), valueType, updatedAt, updatedAt)
          .run();
      }

      return jsonResponse({ data: { updated: true } });
    } catch (error) {
      return handleRequestError(error);
    }
  });
