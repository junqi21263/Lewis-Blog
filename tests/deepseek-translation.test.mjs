import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("fragment localization uses DeepSeek only for English translation", () => {
  const fragmentSource = read("../functions/_lib/fragments.ts");

  assert.match(fragmentSource, /DEEPSEEK_API_KEY/);
  assert.match(fragmentSource, /https:\/\/api\.deepseek\.com\/chat\/completions/);
  assert.doesNotMatch(fragmentSource, /OPENAI_API_KEY/);
  assert.doesNotMatch(fragmentSource, /api\.openai\.com/);
});

test("admin settings English translation path is unified on DeepSeek", () => {
  const settingsSource = read("../functions/api/admin/settings.ts");

  assert.match(settingsSource, /DEEPSEEK_API_KEY/);
  assert.match(settingsSource, /https:\/\/api\.deepseek\.com\/chat\/completions/);
  assert.doesNotMatch(settingsSource, /OPENAI_API_KEY/);
  assert.doesNotMatch(settingsSource, /OPENAI_MODEL/);
  assert.doesNotMatch(settingsSource, /api\.openai\.com/);
});
