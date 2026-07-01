import { jsonResponse, methodNotAllowed, withErrorHandling } from "../_lib/api";

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

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
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

export const onRequestPut: PagesFunction<Env> = () => methodNotAllowed();
