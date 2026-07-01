#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const TABLES = [
  "categories",
  "tags",
  "posts",
  "post_tags",
  "photos",
  "photo_tags",
  "videos",
  "site_settings",
  "newsletter_subscribers",
  "ai_documents",
  "ai_image_metadata",
];

const DELETE_ORDER = [
  "ai_image_metadata",
  "ai_documents",
  "newsletter_subscribers",
  "photo_tags",
  "post_tags",
  "videos",
  "photos",
  "posts",
  "site_settings",
  "tags",
  "categories",
];

const COLUMNS = {
  categories: ["id", "name", "slug", "description", "sort_order", "created_at", "updated_at"],
  tags: ["id", "name", "slug", "created_at", "updated_at"],
  posts: [
    "id",
    "title",
    "subtitle",
    "slug",
    "excerpt",
    "content",
    "cover_image_url",
    "status",
    "category_id",
    "featured",
    "pinned",
    "seo_title",
    "seo_description",
    "reading_time",
    "published_at",
    "created_at",
    "updated_at",
  ],
  post_tags: ["post_id", "tag_id", "created_at"],
  photos: [
    "id",
    "title",
    "description",
    "image_url",
    "location",
    "taken_at",
    "camera",
    "lens",
    "tags",
    "featured",
    "country",
    "city",
    "latitude",
    "longitude",
    "iso",
    "aperture",
    "shutter_speed",
    "focal_length",
    "alt_text",
    "created_at",
    "updated_at",
  ],
  photo_tags: ["photo_id", "tag_id", "created_at"],
  videos: ["id", "title", "description", "cover_image_url", "video_url", "platform", "duration", "featured", "created_at", "updated_at"],
  site_settings: ["key", "value", "value_type", "created_at", "updated_at"],
  newsletter_subscribers: ["id", "email", "source", "status", "created_at", "updated_at"],
  ai_documents: [
    "id",
    "source_type",
    "source_id",
    "slug",
    "title",
    "content",
    "summary",
    "tldr",
    "key_takeaways",
    "reading_difficulty",
    "suggested_tags",
    "embedding_id",
    "created_at",
    "updated_at",
  ],
  ai_image_metadata: ["photo_id", "alt_text", "caption", "tags", "seo_description", "created_at", "updated_at"],
};

function parseArgs(argv) {
  const args = {
    database: "nordic_blog_cms",
    mode: "local",
    restoreMode: "replace",
    file: "",
    keepSql: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--remote") {
      args.mode = "remote";
    } else if (arg === "--local") {
      args.mode = "local";
    } else if (arg === "--db") {
      args.database = argv[++index];
    } else if (arg === "--file") {
      args.file = argv[++index];
    } else if (arg === "--mode") {
      args.restoreMode = argv[++index];
    } else if (arg === "--keep-sql") {
      args.keepSql = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.file) {
    throw new Error("Missing --file <backup.json>");
  }
  if (!["replace", "merge"].includes(args.restoreMode)) {
    throw new Error("--mode must be replace or merge");
  }

  return args;
}

function sqlValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return `'${text.replace(/'/g, "''")}'`;
}

function normalizeRow(table, row) {
  const next = { ...row };
  if (table === "photos" && Array.isArray(next.tags)) {
    next.tags = JSON.stringify(next.tags);
  }
  if (table === "ai_image_metadata" && Array.isArray(next.tags)) {
    next.tags = JSON.stringify(next.tags);
  }
  if (table === "ai_documents") {
    if (Array.isArray(next.key_takeaways)) next.key_takeaways = JSON.stringify(next.key_takeaways);
    if (Array.isArray(next.suggested_tags)) next.suggested_tags = JSON.stringify(next.suggested_tags);
  }
  if (table === "site_settings" && typeof next.value !== "string") {
    next.value = JSON.stringify(next.value);
  }
  return next;
}

function buildSql(backup, restoreMode) {
  const statements = ["PRAGMA foreign_keys = OFF;"];

  if (restoreMode === "replace") {
    for (const table of DELETE_ORDER) {
      statements.push(`DELETE FROM ${table};`);
    }
  }

  for (const table of TABLES) {
    const rows = backup.tables?.[table] ?? [];
    if (!Array.isArray(rows)) {
      throw new Error(`Backup table ${table} must be an array`);
    }

    const columns = COLUMNS[table];
    for (const rawRow of rows) {
      const row = normalizeRow(table, rawRow);
      const values = columns.map((column) => sqlValue(row[column]));
      statements.push(`INSERT OR REPLACE INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});`);
    }
  }

  statements.push("PRAGMA foreign_keys = ON;");
  return `${statements.join("\n")}\n`;
}

const args = parseArgs(process.argv.slice(2));
const backupPath = resolve(args.file);
const backup = JSON.parse(readFileSync(backupPath, "utf8"));
const sql = buildSql(backup, args.restoreMode);
const sqlPath = resolve(`backups/d1/.tmp-restore-${Date.now()}.sql`);

mkdirSync(dirname(sqlPath), { recursive: true });
writeFileSync(sqlPath, sql);

try {
  execFileSync("npx", ["wrangler", "d1", "execute", args.database, `--${args.mode}`, "--file", sqlPath, "--yes"], {
    stdio: "inherit",
  });
  console.log(`Restored ${backupPath} into ${args.database} (${args.mode}, ${args.restoreMode})`);
} finally {
  if (!args.keepSql) {
    rmSync(sqlPath, { force: true });
  } else {
    console.log(`Kept generated SQL at ${sqlPath}`);
  }
}
