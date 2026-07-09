import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(`${process.env.NODE_PATH || process.cwd()}/`);
const { chromium } = require("playwright");

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:3000";
const outputDir = process.env.AUDIT_OUTPUT_DIR || "/tmp/lewis-responsive-audit";
const shouldCaptureScreenshots = process.env.AUDIT_SCREENSHOTS === "1";
const paths = (process.env.AUDIT_PATHS || "/zh/,/zh/journal,/zh/gallery,/zh/fragments,/zh/gear,/zh/about,/zh/films,/admin,/admin/posts/new,/admin/gallery,/admin/fragments,/admin/about,/admin/gear,/admin/settings")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const viewports = [
  [360, 780],
  [375, 812],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 1366],
  [1440, 1000],
];

mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

for (const [width, height] of viewports) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(8000);

  for (const route of paths) {
    const url = new URL(route, baseUrl).toString();
    const label = route.replace(/^\/+|\/+$/g, "").replaceAll("/", "_") || "home";
    const screenshotPath = path.join(outputDir, `${width}-${label}.png`);
    const entry = { width, route, overflowX: 0, bodyWidth: 0, viewportWidth: width, errors: [] };

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 8000 });
      await page.waitForTimeout(700);
      if (shouldCaptureScreenshots) {
        await page.screenshot({ path: screenshotPath, fullPage: true });
      }
      const metrics = await page.evaluate(() => {
        const documentElement = document.documentElement;
        const body = document.body;
        const elements = Array.from(document.querySelectorAll("*"));
        const viewportWidth = documentElement.clientWidth;
        const overflowing = elements
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              className: typeof element.className === "string" ? element.className.slice(0, 120) : "",
              left: Math.floor(rect.left),
              right: Math.ceil(rect.right),
              width: Math.ceil(rect.width),
            };
          })
          .filter((item) => item.width > 0 && (item.right > viewportWidth + 2 || item.left < -2))
          .slice(0, 8);

        return {
          scrollWidth: Math.max(documentElement.scrollWidth, body.scrollWidth),
          clientWidth: viewportWidth,
          overflowing,
          headerHeight: document.querySelector("header")?.getBoundingClientRect().height ?? 0,
        };
      });

      entry.overflowX = metrics.scrollWidth - metrics.clientWidth;
      entry.bodyWidth = metrics.scrollWidth;
      entry.headerHeight = Math.round(metrics.headerHeight);
      entry.overflowing = metrics.overflowing;
      if (entry.overflowX > 2) {
        entry.errors.push(`horizontal overflow ${entry.overflowX}px`);
      }
    } catch (error) {
      entry.errors.push(error instanceof Error ? error.message : String(error));
    }

    results.push(entry);
  }

  await page.close();
}

await browser.close();

const failures = results.filter((entry) => entry.errors.length > 0);
console.log(JSON.stringify({ outputDir, checked: results.length, failures }, null, 2));
if (failures.length > 0) {
  process.exitCode = 1;
}
