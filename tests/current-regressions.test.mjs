import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("CMS settings are fetched without browser cache so homepage copy updates immediately", () => {
  const hookSource = read("../src/hooks/useCmsData.ts");
  const settingsApiSource = read("../functions/api/settings.ts");

  assert.match(hookSource, /cache:\s*"no-store"/);
  assert.match(settingsApiSource, /Cache-Control/);
  assert.match(settingsApiSource, /no-store/);
});

test("gallery page includes article images and cover images through a collected gallery API", () => {
  assert.equal(existsSync(new URL("../functions/api/gallery-images.ts", import.meta.url)), true);

  const apiSource = read("../functions/api/gallery-images.ts");
  const hookSource = read("../src/hooks/useCmsData.ts");
  const gallerySource = read("../src/components/GalleryClient.tsx");

  assert.match(apiSource, /sourceType: "article"/);
  assert.match(apiSource, /cover_image/);
  assert.match(apiSource, /parseArticleImages/);
  assert.match(hookSource, /galleryImages/);
  assert.match(gallerySource, /data\.galleryImages/);
  assert.match(gallerySource, /FeaturedImagesGrid/);
  assert.match(gallerySource, /variant="image-only"/);
});

test("journal archive hero copy uses localized CMS page copy settings", () => {
  const journalSource = read("../src/components/JournalClient.tsx");

  assert.match(journalSource, /resolvePageCopy/);
  assert.match(journalSource, /pageCopyJson/);
  assert.match(journalSource, /copy\.eyebrow/);
  assert.match(journalSource, /copy\.title/);
  assert.match(journalSource, /copy\.description/);
  assert.doesNotMatch(journalSource, /dictionary\.journal\.title/);
});

test("admin topbar publish button is only shown for post editor routes and triggers editor publishing", () => {
  const topbarSource = read("../src/components/admin/AdminTopbar.tsx");
  const buttonSource = read("../src/components/admin/PublishButton.tsx");
  const editorSource = read("../src/components/admin/PostEditorScreen.tsx");

  assert.match(topbarSource, /usePathname/);
  assert.match(topbarSource, /canPublishCurrentPost/);
  assert.match(buttonSource, /admin:publish-current-post/);
  assert.match(editorSource, /admin:publish-current-post/);
});

test("server-rendered article pages use the full site header controls", () => {
  const articleFunctionSource = read("../functions/journal/[slug].ts");

  assert.match(articleFunctionSource, /language switcher/i);
  assert.match(articleFunctionSource, /data-search-open/);
  assert.match(articleFunctionSource, /copy\.home/);
  assert.doesNotMatch(articleFunctionSource, /data-theme-toggle>○<\/button>/);
});

test("admin post dates use a localized formatter instead of raw ISO strings", () => {
  assert.equal(existsSync(new URL("../src/lib/adminDate.ts", import.meta.url)), true);

  const postsPageSource = read("../src/app/admin/posts/page.tsx");
  const dashboardSource = read("../src/app/admin/page.tsx");

  assert.match(postsPageSource, /formatAdminDate/);
  assert.match(dashboardSource, /formatAdminDate/);
  assert.doesNotMatch(postsPageSource, /\{post\.publishedAt \|\| post\.updatedAt\}/);
  assert.doesNotMatch(dashboardSource, /\{post\.updatedAt\}/);
});

test("published status badges do not wrap", () => {
  const badgeSource = read("../src/components/admin/StatusBadge.tsx");
  assert.match(badgeSource, /whitespace-nowrap/);
});
