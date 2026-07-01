type DbValue = string | number | null;
type JsonObject = Record<string, unknown>;
type AccessJwtPayload = {
  email?: unknown;
  sub?: unknown;
  common_name?: unknown;
  name?: unknown;
};

const postStatuses = ["draft", "published", "scheduled", "archived"] as const;
const videoPlatforms = ["YouTube", "Bilibili", "Vimeo", "Local URL"] as const;
const adminEmails = new Set(["junqi21263@gmail.com"]);

export function jsonResponse(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  return jsonResponse({ error: { message, details } }, { status });
}

export function methodNotAllowed() {
  return errorResponse("Method not allowed.", 405);
}

export function isLocalRequest(context: EventContext<Env, string, unknown>) {
  const url = new URL(context.request.url);
  const branch = (context.env as Env & { CF_PAGES_BRANCH?: string }).CF_PAGES_BRANCH;
  return url.hostname === "localhost" || url.hostname === "127.0.0.1" || branch === "local";
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
}

function decodeAccessJwt(jwt: string) {
  const payload = jwt.split(".")[1];
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as AccessJwtPayload;
  } catch {
    return null;
  }
}

function firstEmailCandidate(payload: AccessJwtPayload | null) {
  const candidates = [payload?.email, payload?.common_name, payload?.sub, payload?.name];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") {
      continue;
    }

    const email = candidate.trim().toLowerCase();
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return email;
    }
  }

  return "";
}

export function getAccessIdentity(request: Request) {
  const headerEmail =
    request.headers.get("Cf-Access-Authenticated-User-Email") ??
    request.headers.get("cf-access-authenticated-user-email") ??
    "";
  const jwt =
    request.headers.get("Cf-Access-Jwt-Assertion") ??
    request.headers.get("cf-access-jwt-assertion") ??
    "";
  const payload = jwt ? decodeAccessJwt(jwt) : null;
  const jwtEmail = firstEmailCandidate(payload);
  const email = (headerEmail || jwtEmail).trim().toLowerCase();

  return {
    authenticated: Boolean(email || jwt),
    email,
    hasJwt: Boolean(jwt),
    emailSource: headerEmail ? "header" : jwtEmail ? "jwt" : "",
  };
}

export function requireAccess(context: EventContext<Env, string, unknown>) {
  if (isLocalRequest(context)) {
    return null;
  }

  const identity = getAccessIdentity(context.request);
  if (!identity.authenticated) {
    return errorResponse("Cloudflare Access login is required for this admin request.", 401);
  }

  if (!identity.email) {
    return errorResponse("Cloudflare Access did not provide an email identity for this request.", 403);
  }

  if (!adminEmails.has(identity.email)) {
    return errorResponse(`Signed in as ${identity.email}, but this account is not allowed to manage the CMS.`, 403);
  }

  return null;
}

export async function withErrorHandling(handler: () => Promise<Response>) {
  try {
    return await handler();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return errorResponse("Internal server error.", 500, message);
  }
}

export async function readJsonObject(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new RequestError("Expected application/json request body.", 415);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new RequestError("Invalid JSON request body.", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new RequestError("Request body must be a JSON object.", 400);
  }

  return body as JsonObject;
}

export class RequestError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

export function routeParam(context: EventContext<Env, string, unknown>, name: string) {
  const value = context.params[name];
  return Array.isArray(value) ? value[0] : value;
}

export function handleRequestError(error: unknown) {
  if (error instanceof RequestError) {
    return errorResponse(error.message, error.status);
  }
  throw error;
}

export function textField(body: JsonObject, key: string, options: { required?: boolean; fallback?: string } = {}) {
  const value = body[key];

  if (value == null || value === "") {
    if (options.required) {
      throw new RequestError(`${key} is required.`);
    }
    return options.fallback ?? "";
  }

  if (typeof value !== "string") {
    throw new RequestError(`${key} must be a string.`);
  }

  const trimmed = value.trim();
  if (options.required && !trimmed) {
    throw new RequestError(`${key} is required.`);
  }

  return trimmed;
}

export function optionalTextField(body: JsonObject, key: string) {
  const value = body[key];
  if (value == null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    throw new RequestError(`${key} must be a string.`);
  }
  return value.trim();
}

export function booleanField(body: JsonObject, key: string, fallback = false) {
  const value = body[key];
  if (value == null) {
    return fallback ? 1 : 0;
  }
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  if (value === 0 || value === 1) {
    return value;
  }
  throw new RequestError(`${key} must be a boolean.`);
}

export function numberField(body: JsonObject, key: string, fallback: number) {
  const value = body[key];
  if (value == null || value === "") {
    return fallback;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new RequestError(`${key} must be a number.`);
  }
  return value;
}

export function optionalNumberField(body: JsonObject, key: string) {
  const value = body[key];
  if (value == null || value === "") {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new RequestError(`${key} must be a number.`);
  }
  return value;
}

export function statusField(body: JsonObject, fallback = "draft") {
  const status = textField(body, "status", { fallback });
  if (!postStatuses.includes(status as (typeof postStatuses)[number])) {
    throw new RequestError("status must be draft, published, scheduled, or archived.");
  }
  return status;
}

export function platformField(body: JsonObject) {
  const platform = textField(body, "platform", { required: true });
  if (!videoPlatforms.includes(platform as (typeof videoPlatforms)[number])) {
    throw new RequestError("platform must be YouTube, Bilibili, Vimeo, or Local URL.");
  }
  return platform;
}

export function stringArrayField(body: JsonObject, key: string) {
  const value = body[key];
  if (value == null) {
    return [];
  }
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new RequestError(`${key} must be an array of strings.`);
  }
  return value.map((item) => item.trim()).filter(Boolean);
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function nowIso() {
  return new Date().toISOString();
}

export function readingTimeFromContent(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function normalizeRow<T extends JsonObject>(row: T) {
  return {
    ...row,
    featured: Boolean(row.featured),
    pinned: Boolean(row.pinned),
  };
}

export function parseJsonText(value: unknown, fallback: unknown) {
  if (typeof value !== "string") {
    return fallback;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return fallback;
  }
}

export async function ensureTag(db: D1Database, label: string) {
  const name = label.trim();
  const slug = slugify(name);
  if (!name || !slug) {
    throw new RequestError("Tag values must contain letters or numbers.");
  }

  const id = slug;
  await db
    .prepare(
      `INSERT INTO tags (id, name, slug, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at`,
    )
    .bind(id, name, slug, nowIso(), nowIso())
    .run();

  const tag = await db.prepare("SELECT id FROM tags WHERE slug = ?").bind(slug).first<{ id: string }>();
  if (!tag) {
    throw new RequestError("Unable to resolve tag.", 500);
  }
  return tag.id;
}

export async function syncPostTags(db: D1Database, postId: string, labels: string[]) {
  await db.prepare("DELETE FROM post_tags WHERE post_id = ?").bind(postId).run();
  for (const label of labels) {
    const tagId = await ensureTag(db, label);
    await db.prepare("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)").bind(postId, tagId).run();
  }
}

export async function syncPhotoTags(db: D1Database, photoId: string, labels: string[]) {
  await db.prepare("DELETE FROM photo_tags WHERE photo_id = ?").bind(photoId).run();
  for (const label of labels) {
    const tagId = await ensureTag(db, label);
    await db.prepare("INSERT OR IGNORE INTO photo_tags (photo_id, tag_id) VALUES (?, ?)").bind(photoId, tagId).run();
  }
}

export async function runWhitelistedUpdate(
  db: D1Database,
  table: string,
  id: string,
  values: Record<string, DbValue | undefined>,
) {
  const entries = Object.entries(values).filter((entry): entry is [string, DbValue] => entry[1] !== undefined);
  if (entries.length === 0) {
    throw new RequestError("No valid fields to update.");
  }

  const assignments = entries.map(([column]) => `${column} = ?`);
  const bindValues = entries.map(([, value]) => value);
  const result = await db
    .prepare(`UPDATE ${table} SET ${assignments.join(", ")}, updated_at = ? WHERE id = ?`)
    .bind(...bindValues, nowIso(), id)
    .run();

  if (result.meta.changes === 0) {
    throw new RequestError("Resource not found.", 404);
  }
}
