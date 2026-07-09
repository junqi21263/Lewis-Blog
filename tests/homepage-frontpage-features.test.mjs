import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const homeSource = read("../src/components/HomeClient.tsx");
const settingsSource = read("../src/app/admin/settings/page.tsx");
const cmsSource = read("../src/data/cms.ts");
const hookSource = read("../src/hooks/useCmsData.ts");
const postsApiSource = read("../functions/api/posts/index.ts");
const journalSource = read("../src/components/JournalClient.tsx");

test("homepage section copy is sourced from CMS settings", () => {
  assert.match(cmsSource, /homepageJson/);
  assert.match(hookSource, /homepage_json/);
  assert.match(settingsSource, /updateHomepageField/);
  assert.match(homeSource, /resolveHomepageContent/);
  assert.doesNotMatch(homeSource, /dictionary\.home\.title/);
  assert.doesNotMatch(homeSource, /dictionary\.home\.latestTitle/);
});

test("AI archive UI is hidden behind a disabled-by-default feature flag", () => {
  const featureSource = read("../src/config/features.ts");
  assert.match(featureSource, /FEATURE_AI_ARCHIVE/);
  assert.match(featureSource, /false/);
  assert.match(journalSource, /FEATURE_AI_ARCHIVE/);
  assert.match(journalSource, /FEATURE_AI_ARCHIVE \? <AiArchivePanel/);
});

test("featured images API combines gallery and article image sources", () => {
  assert.equal(existsSync(new URL("../functions/api/featured-images.ts", import.meta.url)), true);
  const apiSource = read("../functions/api/featured-images.ts");
  assert.match(apiSource, /sourceType: "gallery"/);
  assert.match(apiSource, /sourceType: "article"/);
  assert.match(apiSource, /parseArticleImages/);
  assert.match(hookSource, /featuredImages/);
  assert.match(homeSource, /FeaturedImagesGrid/);
});

test("public post API and homepage latest articles sort by publish date with created date fallback", () => {
  assert.match(postsApiSource, /COALESCE\(NULLIF\(posts\.published_at, ''\), posts\.created_at\) DESC/);
  assert.doesNotMatch(postsApiSource, /ORDER BY posts\.pinned DESC/);
  assert.match(homeSource, /latestArticles = publishedArticles\.slice\(0, 3\)/);
});
