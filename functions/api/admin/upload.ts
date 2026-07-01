import { errorResponse, jsonResponse, requireAccess, withErrorHandling } from "../../_lib/api";

function safeSegment(value: string, fallback: string) {
  const segment = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return segment || fallback;
}

function extensionFromName(name: string) {
  const lastPart = name.split("/").pop() ?? name;
  const dotIndex = lastPart.lastIndexOf(".");
  if (dotIndex < 0 || dotIndex === lastPart.length - 1) {
    return "";
  }
  return lastPart.slice(dotIndex).toLowerCase().replace(/[^.a-z0-9]/g, "");
}

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) {
      return blocked;
    }

    const contentType = context.request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return errorResponse("Expected multipart/form-data request body.", 415);
    }

    const formData = await context.request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return errorResponse("file is required.");
    }
    if (file.size <= 0) {
      return errorResponse("file must not be empty.");
    }

    const folderValue = formData.get("folder");
    const folder = typeof folderValue === "string" ? safeSegment(folderValue, "uploads") : "uploads";
    const ext = extensionFromName(file.name);
    const key = `${folder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}${ext}`;
    const body = await file.arrayBuffer();

    await context.env.ASSETS_BUCKET.put(key, body, {
      httpMetadata: {
        contentType: file.type || "application/octet-stream",
        cacheControl: "public, max-age=31536000, immutable",
      },
      customMetadata: {
        originalName: file.name,
      },
    });

    return jsonResponse(
      {
        data: {
          key,
          url: `/api/assets?key=${encodeURIComponent(key)}`,
          size: file.size,
          content_type: file.type || "application/octet-stream",
        },
      },
      { status: 201 },
    );
  });
