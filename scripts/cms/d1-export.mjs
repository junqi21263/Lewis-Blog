#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
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

function parseArgs(argv) {
  const args = {
    database: "nordic_blog_cms",
    mode: "local",
    out: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--remote") {
      args.mode = "remote";
    } else if (arg === "--local") {
      args.mode = "local";
    } else if (arg === "--db") {
      args.database = argv[++index];
    } else if (arg === "--out") {
      args.out = argv[++index];
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function parseWranglerJson(stdout) {
  const lines = stdout.replace(/\u001b\[[0-9;]*m/g, "").split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === "[");
  if (start < 0) {
    throw new Error(`Unable to find Wrangler JSON output:\n${stdout}`);
  }

  return JSON.parse(lines.slice(start).join("\n"));
}

function runSelect(database, mode, table) {
  const stdout = execFileSync(
    "npx",
    ["wrangler", "d1", "execute", database, `--${mode}`, "--json", "--command", `SELECT * FROM ${table};`],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  const payload = parseWranglerJson(stdout);
  const result = payload[0];
  if (!result?.success) {
    throw new Error(`D1 export failed for table ${table}`);
  }

  return result.results ?? [];
}

const args = parseArgs(process.argv.slice(2));
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputPath = resolve(args.out || `backups/d1/${args.database}-${args.mode}-${timestamp}.json`);
const tables = {};

for (const table of TABLES) {
  tables[table] = runSelect(args.database, args.mode, table);
}

const backup = {
  meta: {
    version: 1,
    database: args.database,
    mode: args.mode,
    exported_at: new Date().toISOString(),
    tables: TABLES,
  },
  tables,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(backup, null, 2)}\n`);

console.log(`Exported ${args.database} (${args.mode}) to ${outputPath}`);
