import { errorResponse, withErrorHandling } from "../_lib/api";

function keyFromUrl(request: Request) {
  const url = new URL(request.url);
  const rawKey = url.searchParams.get("key");
  if (!rawKey || rawKey.includes("..")) {
    return "";
  }
  return rawKey.replace(/^\/+/, "");
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const key = keyFromUrl(context.request);
    if (!key) {
      return errorResponse("Asset key is required.");
    }

    const object = await context.env.ASSETS_BUCKET.get(key);
    if (!object) {
      return errorResponse("Asset not found.", 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", headers.get("Cache-Control") ?? "public, max-age=31536000, immutable");

    return new Response(object.body, { headers });
  });
