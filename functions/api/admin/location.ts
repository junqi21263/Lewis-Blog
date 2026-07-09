import * as OpenCC from "opencc-js";
import { jsonResponse, requireAccess, withErrorHandling } from "../../_lib/api";

type LocationCandidate = {
  city: string;
  region: string;
  country: string;
  countryCode: string;
};

type GeocodingResult = {
  name?: string;
  admin1?: string;
  country?: string;
};

const toTraditionalChinese = OpenCC.Converter({ from: "cn", to: "tw" });

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function fallbackLocation(request: Request): Promise<LocationCandidate> {
  const ip = clean(request.headers.get("CF-Connecting-IP"));
  if (!ip) return { city: "", region: "", country: "", countryCode: "" };

  const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
  if (!response.ok) return { city: "", region: "", country: "", countryCode: "" };
  const payload = await response.json() as Record<string, unknown>;
  if (payload.success === false) return { city: "", region: "", country: "", countryCode: "" };

  return {
    city: clean(payload.city),
    region: clean(payload.region),
    country: clean(payload.country),
    countryCode: clean(payload.country_code),
  };
}

async function localizedLocation(candidate: LocationCandidate, language: "zh" | "en") {
  if (!candidate.city) return "";
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", candidate.city);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", language);
  if (candidate.countryCode) url.searchParams.set("countryCode", candidate.countryCode);

  const response = await fetch(url);
  if (!response.ok) return "";
  const payload = await response.json() as { results?: GeocodingResult[] };
  const result = payload.results?.[0];
  if (!result) return "";
  return [result.name, result.admin1, result.country].map(clean).filter((part, index, all) => part && all.indexOf(part) === index).join(" · ");
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    const cf = (context.request as Request & { cf?: Record<string, unknown> }).cf;
    const fromCf: LocationCandidate = {
      city: clean(cf?.city),
      region: clean(cf?.region),
      country: clean(cf?.country),
      countryCode: clean(cf?.country),
    };
    const location = fromCf.city ? fromCf : await fallbackLocation(context.request);
    const [zh, en] = await Promise.all([localizedLocation(location, "zh"), localizedLocation(location, "en")]);
    const zhCN = zh || [location.city, location.region, location.country].filter(Boolean).join(" · ");
    const enUS = en || [location.city, location.region, location.country].filter(Boolean).join(" · ");

    return jsonResponse({
      data: {
        city: location.city,
        region: location.region,
        country: location.country,
        location_json: {
          "zh-CN": zhCN,
          "zh-TW": toTraditionalChinese(zhCN),
          "en-US": enUS || zhCN,
        },
      },
    });
  });
