import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  defaultFooterJson,
  normalizeFooterJson,
  resolveFooterContent,
} from "../src/components/footer/footerContent.ts";

test("footer defaults provide localized editorial content", () => {
  assert.equal(defaultFooterJson["zh-CN"].brand, "Lewis.");
  assert.equal(defaultFooterJson["zh-CN"].description, "关于旅行、摄影、影像与安静写作的个人归档。");
  assert.equal(defaultFooterJson["zh-CN"].copyright, "© 2026 Lewis Lee.");
  assert.equal(defaultFooterJson["zh-CN"].location, "Guangzhou · China");
});

test("footer content falls back through locale chain without hardcoded dictionary copy", () => {
  const footer = normalizeFooterJson({
    "zh-CN": {
      brand: "Lewis.",
      description: "简体简介",
      copyright: "© 2026 Lewis Lee.",
      location: "Guangzhou · China",
    },
    "en-US": {
      brand: "Lewis.",
      description: "English description",
      copyright: "",
      location: "",
    },
  });

  assert.equal(resolveFooterContent(footer, "zh-TW").description, "简体简介");
  assert.equal(resolveFooterContent(footer, "en-US").description, "English description");
  assert.equal(resolveFooterContent(footer, "en-US").copyright, "© 2026 Lewis Lee.");
});

test("footer component does not include newsletter form wiring", () => {
  const source = readFileSync(new URL("../src/components/Footer.tsx", import.meta.url), "utf8");

  assert.equal(source.includes("NewsletterSignup"), false);
  assert.equal(source.includes("newsletter-email"), false);
  assert.equal(source.includes("订阅通讯"), false);
  assert.equal(source.includes("name@example.com"), false);
});

test("footer translation API is unified on the existing DeepSeek key", () => {
  const source = readFileSync(new URL("../functions/api/admin/settings.ts", import.meta.url), "utf8");
  const legacyWarning = `${["OPENAI", "API", "KEY"].join("_")} is not configured; English footer falls back to zh-CN.`;

  assert.equal(source.includes("DEEPSEEK_API_KEY"), true);
  assert.equal(source.includes("https://api.deepseek.com/chat/completions"), true);
  assert.equal(source.includes("DEEPSEEK_API_KEY is not configured; English footer falls back to zh-CN."), true);
  assert.equal(source.includes(legacyWarning), false);
});
