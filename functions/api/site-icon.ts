import { withErrorHandling } from "../_lib/api";

type BrandFields = {
  logoImageUrl?: string;
};

const fallbackIcon = "/favicon-32x32.png";

function safeParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function resolveIconUrl(value: unknown, fallback = fallbackIcon) {
  const source = typeof value === "string" ? safeParseJson(value) : value;
  if (!isRecord(source)) {
    return fallback;
  }

  const zhCn = isRecord(source["zh-CN"]) ? (source["zh-CN"] as BrandFields) : null;
  const enUs = isRecord(source["en-US"]) ? (source["en-US"] as BrandFields) : null;
  const zhTw = isRecord(source["zh-TW"]) ? (source["zh-TW"] as BrandFields) : null;
  return zhCn?.logoImageUrl || zhTw?.logoImageUrl || enUs?.logoImageUrl || fallback;
}

async function handleSiteIconRequest(context: EventContext<Env, string, unknown>) {
  let iconUrl = fallbackIcon;

  try {
    const result = await context.env.DB.prepare("SELECT key, value, value_type FROM site_settings WHERE key IN ('brand_json', 'logoImageUrl')").all<{
      key: string;
      value: string;
      value_type: string;
    }>();
    const legacyLogo = result.results.find((row) => row.key === "logoImageUrl")?.value;
    const brandRow = result.results.find((row) => row.key === "brand_json");
    if (brandRow) {
      iconUrl = resolveIconUrl(brandRow.value_type === "json" ? safeParseJson(brandRow.value) : brandRow.value, legacyLogo || fallbackIcon);
    } else if (legacyLogo) {
      iconUrl = legacyLogo;
    }
  } catch {
    iconUrl = fallbackIcon;
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: iconUrl || fallbackIcon,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    return await handleSiteIconRequest(context);
  });

export const onRequestHead: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    return await handleSiteIconRequest(context);
  });
