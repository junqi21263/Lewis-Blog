import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("CMS-backed public pages gate empty states behind a shared loading skeleton", () => {
  const paths = [
    "../src/components/HomeClient.tsx",
    "../src/components/JournalClient.tsx",
    "../src/components/GalleryClient.tsx",
    "../src/components/GearClient.tsx",
    "../src/components/FilmsClient.tsx",
    "../src/components/FragmentsClient.tsx",
  ];

  assert.equal(
    existsSync(new URL("../src/components/loading/EditorialPageSkeleton.tsx", import.meta.url)),
    true,
  );

  for (const path of paths) {
    const source = read(path);
    assert.match(source, /EditorialPageSkeleton/);
    assert.match(source, /isReady/);
  }
});

test("technical image labels resolve to editorial fallbacks", async () => {
  const moduleUrl = new URL("../src/components/media/editorialImageLabel.ts", import.meta.url);
  assert.equal(existsSync(moduleUrl), true);

  const { isTechnicalImageLabel, resolveEditorialImageLabel, untitledImageLabel } = await import(moduleUrl.href);
  assert.equal(isTechnicalImageLabel("IMG_3084.JPG"), true);
  assert.equal(isTechnicalImageLabel("DSC00041"), true);
  assert.equal(isTechnicalImageLabel("f68c164c24254c6cb00ebda75894f95a"), true);
  assert.equal(isTechnicalImageLabel("大连海边的傍晚"), false);
  assert.equal(resolveEditorialImageLabel("IMG_3084", "大连，海风吹过的北方夏天"), "大连，海风吹过的北方夏天");
  assert.equal(resolveEditorialImageLabel("雨后的街道", "未命名影像"), "雨后的街道");
  assert.equal(untitledImageLabel("zh-CN"), "未命名影像");
  assert.equal(untitledImageLabel("zh-TW"), "未命名影像");
  assert.equal(untitledImageLabel("en-US"), "Untitled image");

  for (const path of [
    "../functions/api/gallery-images.ts",
    "../functions/api/featured-images.ts",
  ]) {
    assert.match(read(path), /resolveEditorialImageLabel/);
  }
});

test("admin dashboard counts the public Gallery dataset and created videos", () => {
  const dashboard = read("../src/app/admin/page.tsx");

  assert.match(dashboard, /data\.galleryImages\.length\s*\+\s*data\.videos\.length/);
  assert.match(dashboard, /data\.galleryImages\.length\s*>\s*0/);
});

test("homepage keeps latest articles but removes the duplicated full archive", () => {
  const home = read("../src/components/HomeClient.tsx");

  assert.match(home, /latestArticles\.map/);
  assert.doesNotMatch(home, /import ArticleCard/);
  assert.doesNotMatch(home, /publishedArticles\.map/);
  assert.doesNotMatch(home, /<ArticleCard/);
});
