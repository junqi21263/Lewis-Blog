import { errorResponse, jsonResponse, requireAccess, withErrorHandling } from "../../_lib/api";

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "image/tiff",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/mpeg",
]);
const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
  ".mp4",
  ".m4v",
  ".mov",
  ".webm",
  ".avi",
  ".mkv",
  ".mpeg",
  ".mpg",
]);

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

function isAllowedUpload(file: File, ext: string) {
  if (file.type && allowedMimeTypes.has(file.type)) {
    return true;
  }
  return allowedExtensions.has(ext);
}

async function uploadFile(context: EventContext<Env, string, unknown>, file: File, folder: string) {
  const ext = extensionFromName(file.name);
  if (file.size <= 0) {
    throw new Error(`${file.name || "file"} must not be empty.`);
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error(`${file.name || "file"} exceeds the 50MB upload limit.`);
  }
  if (!isAllowedUpload(file, ext)) {
    throw new Error(`${file.name || "file"} is not an allowed image or video format.`);
  }

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

  return {
    key,
    url: `/api/assets?key=${encodeURIComponent(key)}`,
    size: file.size,
    content_type: file.type || "application/octet-stream",
  };
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
    const folderValue = formData.get("folder");
    const folder = typeof folderValue === "string" ? safeSegment(folderValue, "uploads") : "uploads";
    const files = [...formData.getAll("files"), formData.get("file")].filter((value): value is File => value instanceof File);
    if (files.length === 0) {
      return errorResponse("At least one file is required.");
    }

    try {
      const uploaded = [];
      for (const file of files) {
        uploaded.push(await uploadFile(context, file, folder));
      }

      return jsonResponse(
        {
          data: files.length === 1 ? uploaded[0] : { files: uploaded },
        },
        { status: 201 },
      );
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Upload failed.", 400);
    }
  });
