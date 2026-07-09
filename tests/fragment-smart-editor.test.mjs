import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("fragment model and APIs persist localized weather without storing IP or coordinates", () => {
  const cms = read("../src/data/cms.ts");
  const hook = read("../src/hooks/useCmsData.ts");
  const migration = read("../migrations/0012_fragment_weather.sql");
  const createApi = read("../functions/api/admin/fragments/index.ts");
  const publicApi = read("../functions/api/fragments.ts");

  assert.match(cms, /weatherJson:\s*LocalizedTextMap/);
  assert.match(hook, /weather_json/);
  assert.match(migration, /ADD COLUMN weather_json/);
  assert.match(createApi, /weather_json/);
  assert.match(publicApi, /weather_json/);
  assert.doesNotMatch(migration, /\bip\b|latitude|longitude/i);
});

test("location, weather, and translation preview endpoints require Access", () => {
  for (const path of [
    "../functions/api/admin/location.ts",
    "../functions/api/admin/weather.ts",
    "../functions/api/admin/fragments/translate.ts",
  ]) {
    assert.match(read(path), /requireAccess/);
  }
});

test("fragment editor provides live localization, smart defaults, and weather refresh", () => {
  const editor = read("../src/components/admin/FragmentEditorScreen.tsx");
  const suggestions = read("../src/components/admin/fragmentSuggestions.ts");

  assert.match(editor, /OpenCC/);
  assert.match(editor, /fragments\/translate/);
  assert.match(editor, /api\/admin\/location/);
  assert.match(editor, /api\/admin\/weather/);
  assert.match(editor, /RefreshCw/);
  assert.match(editor, /weatherJson/);
  assert.match(suggestions, /想下班😭/);
  assert.match(suggestions, /牛马专用 MacBook 🐮/);
  assert.match(suggestions, /FEATURE_FRAGMENT_AI_SUGGESTIONS/);
});

test("front-end fragments render weather with restrained metadata", () => {
  const client = read("../src/components/FragmentsClient.tsx");
  assert.match(client, /fragment\.weather/);
  assert.match(client, /weatherLabel/);
});
