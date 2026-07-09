import { withErrorHandling } from "./_lib/api";

type BrandFields = {
  brandName?: string;
  logoText?: string;
  logoImageUrl?: string;
};

const fallbackName = "Lewis Photograph Blog";
const fallbackShortName = "Lewis.";

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

function resolveBrand(value: unknown, fallbackIcon = ""): BrandFields {
  const source = typeof value === "string" ? safeParseJson(value) : value;
  if (!isRecord(source)) {
    return fallbackIcon ? { logoImageUrl: fallbackIcon } : {};
  }

  const zhCn = isRecord(source["zh-CN"]) ? (source["zh-CN"] as BrandFields) : null;
  const zhTw = isRecord(source["zh-TW"]) ? (source["zh-TW"] as BrandFields) : null;
  const enUs = isRecord(source["en-US"]) ? (source["en-US"] as BrandFields) : null;
  const firstIcon = zhCn?.logoImageUrl || zhTw?.logoImageUrl || enUs?.logoImageUrl || fallbackIcon;

  return {
    ...(zhCn ?? {}),
    logoImageUrl: firstIcon,
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    let brand: BrandFields = {};

    try {
      const result = await context.env.DB.prepare("SELECT key, value, value_type FROM site_settings WHERE key IN ('brand_json', 'logoImageUrl')").all<{
        key: string;
        value: string;
        value_type: string;
      }>();
      const legacyLogo = result.results.find((row) => row.key === "logoImageUrl")?.value ?? "";
      const brandRow = result.results.find((row) => row.key === "brand_json");
      if (brandRow) {
        brand = resolveBrand(brandRow.value_type === "json" ? safeParseJson(brandRow.value) : brandRow.value, legacyLogo);
      } else if (legacyLogo) {
        brand = { logoImageUrl: legacyLogo };
      }
    } catch {
      brand = {};
    }

    return Response.json(
      {
        name: brand.brandName || fallbackName,
        short_name: brand.logoText || fallbackShortName,
        description: "A Nordic editorial personal journal for travel, photography, films, and essays.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#111111",
        theme_color: "#111111",
        icons: [
          {
            src: "/api/site-icon?size=192",
            sizes: "192x192",
          },
          {
            src: "/api/site-icon?size=512",
            sizes: "512x512",
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/manifest+json; charset=utf-8",
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  });
