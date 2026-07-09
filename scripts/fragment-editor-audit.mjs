import { createRequire } from "node:module";

const require = createRequire(`${process.env.NODE_PATH || process.cwd()}/`);
const { chromium } = require("playwright");
const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8788";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(new URL("/admin/fragments/new", baseUrl).toString(), { waitUntil: "domcontentloaded" });
await page.locator("textarea").first().fill("后台编辑体验，今天也想早点下班。");

await page.getByRole("button", { name: "繁", exact: true }).click();
await page.waitForTimeout(800);
const traditional = await page.locator("textarea").first().inputValue();

await page.getByRole("button", { name: "EN", exact: true }).click();
await page.waitForTimeout(1400);
await page.waitForFunction(() => {
  const label = Array.from(document.querySelectorAll("label")).find((item) => item.textContent?.includes("Weather"));
  return Boolean(label?.querySelector("input")?.value);
}, null, { timeout: 8000 });
const english = await page.locator("textarea").first().inputValue();
const camera = await page.getByRole("textbox", { name: "Camera / Device", exact: true }).inputValue();
const mood = await page.getByRole("textbox", { name: "Mood", exact: true }).inputValue();
const weather = await page.getByRole("textbox", { name: "Weather", exact: true }).inputValue();

if (!traditional.includes("後臺編輯體驗") || !english || !camera || !mood || !weather) {
  throw new Error(JSON.stringify({ traditional, english, camera, mood, weather }));
}

console.log(JSON.stringify({ traditional, english, camera, mood, weather }, null, 2));
await browser.close();
