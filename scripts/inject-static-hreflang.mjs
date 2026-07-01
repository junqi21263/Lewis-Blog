import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outDir = path.join(process.cwd(), "out");
const localeSegments = ["zh", "tw", "en"];
const hreflangBySegment = {
  zh: "zh-CN",
  tw: "zh-TW",
  en: "en",
};

async function getSiteUrl() {
  const siteData = await readFile(path.join(process.cwd(), "src/data/site.ts"), "utf8");
  const match = siteData.match(/siteUrl\s*=\s*["']([^"']+)["']/);
  return match?.[1] ?? "https://journal.lewislee.online";
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.name === "index.html") {
      files.push(fullPath);
    }
  }

  return files;
}

function getLocalizedPath(filePath) {
  const relativePath = path.relative(outDir, filePath).split(path.sep).join("/");
  const [segment, ...rest] = relativePath.split("/");

  if (!localeSegments.includes(segment)) {
    return null;
  }

  const pathname = rest.length <= 1 ? "/" : `/${rest.slice(0, -1).join("/")}/`;
  return { segment, pathname };
}

function buildAlternateLinks(siteUrl, pathname) {
  const links = localeSegments.map((segment) => {
    const href = `${siteUrl}/${segment}${pathname === "/" ? "/" : pathname}`;
    return `<link rel="alternate" hreflang="${hreflangBySegment[segment]}" href="${href}"/>`;
  });

  links.push(`<link rel="alternate" hreflang="x-default" href="${siteUrl}/zh${pathname === "/" ? "/" : pathname}"/>`);
  return links.join("");
}

const siteUrl = await getSiteUrl();
const htmlFiles = await walk(outDir);
let updated = 0;

for (const filePath of htmlFiles) {
  const localizedPath = getLocalizedPath(filePath);
  if (!localizedPath) {
    continue;
  }

  const html = await readFile(filePath, "utf8");
  if (html.includes('rel="alternate"') && html.includes("hreflang")) {
    continue;
  }

  const alternateLinks = buildAlternateLinks(siteUrl, localizedPath.pathname);
  await writeFile(filePath, html.replace("</head>", `${alternateLinks}</head>`));
  updated += 1;
}

console.log(`Injected hreflang alternates into ${updated} localized static HTML files.`);
