#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const DEFAULT_BUCKET = "nordic-blog-assets";

function parseArgs(argv) {
  const args = {
    action: "",
    bucket: DEFAULT_BUCKET,
    mode: "local",
    dir: "",
    prefix: "",
    manifest: "",
    cacheControl: "public, max-age=31536000, immutable",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "upload" || arg === "delete") {
      args.action = arg;
    } else if (arg === "--remote") {
      args.mode = "remote";
    } else if (arg === "--local") {
      args.mode = "local";
    } else if (arg === "--bucket") {
      args.bucket = argv[++index];
    } else if (arg === "--dir") {
      args.dir = argv[++index];
    } else if (arg === "--prefix") {
      args.prefix = argv[++index];
    } else if (arg === "--manifest") {
      args.manifest = argv[++index];
    } else if (arg === "--cache-control") {
      args.cacheControl = argv[++index];
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.action) {
    throw new Error("Usage: r2-prefix.mjs upload|delete [options]");
  }
  if (args.action === "upload" && (!args.dir || !args.prefix)) {
    throw new Error("upload requires --dir <path> and --prefix <r2-prefix>");
  }
  if (args.action === "delete" && !args.manifest) {
    throw new Error("delete requires --manifest <manifest.json>");
  }

  return args;
}

function contentTypeFor(file) {
  const lower = file.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".json")) return "application/json";
  if (lower.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

function walkFiles(root) {
  const files = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...walkFiles(path));
    } else if (stat.isFile()) {
      files.push(path);
    }
  }
  return files;
}

function normalizePrefix(prefix) {
  return prefix.replace(/^\/+|\/+$/g, "");
}

function upload(args) {
  const root = resolve(args.dir);
  const prefix = normalizePrefix(args.prefix);
  const files = walkFiles(root);
  const objects = [];

  for (const file of files) {
    const relativePath = relative(root, file).split(sep).join("/");
    const key = `${prefix}/${relativePath}`;
    execFileSync(
      "npx",
      [
        "wrangler",
        "r2",
        "object",
        "put",
        `${args.bucket}/${key}`,
        `--${args.mode}`,
        "--file",
        file,
        "--content-type",
        contentTypeFor(file),
        "--cache-control",
        args.cacheControl,
        "--force",
      ],
      { stdio: "inherit" },
    );
    objects.push({
      key,
      source: file,
      size: statSync(file).size,
      content_type: contentTypeFor(file),
    });
  }

  const manifestPath = resolve(args.manifest || `backups/r2/${args.bucket}-${prefix.replace(/\//g, "-")}-${Date.now()}.manifest.json`);
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeFileSync(
    manifestPath,
    `${JSON.stringify(
      {
        bucket: args.bucket,
        prefix,
        mode: args.mode,
        created_at: new Date().toISOString(),
        objects,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Uploaded ${objects.length} object(s) to r2://${args.bucket}/${prefix}/`);
  console.log(`Wrote manifest ${manifestPath}`);
}

function deleteFromManifest(args) {
  const manifestPath = resolve(args.manifest);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const bucket = args.bucket || manifest.bucket;
  const objects = manifest.objects ?? [];

  for (const object of objects) {
    execFileSync("npx", ["wrangler", "r2", "object", "delete", `${bucket}/${object.key}`, `--${args.mode}`, "--force"], {
      stdio: "inherit",
    });
  }

  console.log(`Deleted ${objects.length} object(s) from r2://${bucket}/${manifest.prefix}/ using ${manifestPath}`);
}

const args = parseArgs(process.argv.slice(2));
if (args.action === "upload") {
  upload(args);
} else {
  deleteFromManifest(args);
}
