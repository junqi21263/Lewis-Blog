import { jsonResponse, requireAccess, withErrorHandling } from "../../_lib/api";
import { unavailableWeather, weatherCopyFromCode } from "../../_lib/weather";

type GeocodingResult = { latitude?: number; longitude?: number };
type ForecastPayload = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    time?: string;
  };
};

async function geocodeLocation(location: string) {
  const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geocodeUrl.searchParams.set("name", location);
  geocodeUrl.searchParams.set("count", "1");
  geocodeUrl.searchParams.set("language", "en");
  const geocodeResponse = await fetch(geocodeUrl, { signal: AbortSignal.timeout(4000) });
  if (geocodeResponse.ok) {
    const geocode = await geocodeResponse.json() as { results?: GeocodingResult[] };
    const match = geocode.results?.[0];
    if (typeof match?.latitude === "number" && typeof match.longitude === "number") return match;
  }

  const fallbackUrl = new URL("https://nominatim.openstreetmap.org/search");
  fallbackUrl.searchParams.set("q", location);
  fallbackUrl.searchParams.set("format", "jsonv2");
  fallbackUrl.searchParams.set("limit", "1");
  const fallbackResponse = await fetch(fallbackUrl, {
    headers: { "User-Agent": "LewisPhotographBlog/1.0" },
    signal: AbortSignal.timeout(4000),
  });
  if (!fallbackResponse.ok) throw new Error("Location lookup failed.");
  const fallback = await fallbackResponse.json() as Array<{ lat?: string; lon?: string }>;
  const latitude = Number(fallback[0]?.lat);
  const longitude = Number(fallback[0]?.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error("Location not found.");
  return { latitude, longitude };
}

async function loadWeather(location: string) {
  const searchLocation = location.split(/[·,/]/, 1)[0]?.trim() || location;
  const match = await geocodeLocation(searchLocation);

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", String(match.latitude));
  forecastUrl.searchParams.set("longitude", String(match.longitude));
  forecastUrl.searchParams.set("current", "temperature_2m,weather_code");
  forecastUrl.searchParams.set("timezone", "auto");
  const forecastResponse = await fetch(forecastUrl, { signal: AbortSignal.timeout(5000) });
  if (!forecastResponse.ok) throw new Error("Weather lookup failed.");
  const forecast = await forecastResponse.json() as ForecastPayload;
  const weatherCode = forecast.current?.weather_code;
  if (typeof weatherCode !== "number") throw new Error("Weather data unavailable.");

  return {
    weather_json: weatherCopyFromCode(weatherCode),
    temperature: forecast.current?.temperature_2m ?? null,
    raw: { weatherCode, observedAt: forecast.current?.time ?? "" },
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    const location = new URL(context.request.url).searchParams.get("location")?.trim() ?? "";
    if (!location) {
      return jsonResponse({ data: { weather_json: unavailableWeather, temperature: null, raw: null } });
    }

    const cache = (caches as CacheStorage & { default: Cache }).default;
    const cacheKey = new Request(`https://fragment-weather.internal/v2/${encodeURIComponent(location.toLowerCase())}`);
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    let data;
    try {
      data = await loadWeather(location);
    } catch {
      data = { weather_json: unavailableWeather, temperature: null, raw: null };
    }
    const response = jsonResponse(
      { data },
      { headers: { "Cache-Control": "private, max-age=1200" } },
    );
    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  });
