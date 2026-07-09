import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const editorialImageSource = fs.readFileSync(
  new URL("../src/components/media/EditorialImage.tsx", import.meta.url),
  "utf8",
);
const featuredGridSource = fs.readFileSync(
  new URL("../src/components/FeaturedImagesGrid.tsx", import.meta.url),
  "utf8",
);

test("editorial source overlay uses a restrained gradient reveal", () => {
  assert.match(editorialImageSource, /linear-gradient\(to_top/);
  assert.match(editorialImageSource, /rgba\(0,0,0,0\.75\)/);
  assert.match(editorialImageSource, /md:translate-y-/);
  assert.match(editorialImageSource, /md:opacity-0/);
  assert.match(editorialImageSource, /group-hover\/editorial-image:translate-y-0/);
  assert.match(editorialImageSource, /group-hover\/editorial-image:opacity-100/);
  assert.doesNotMatch(editorialImageSource, /bg-background\/(?:82|90)/);
});

test("featured and gallery images provide a localized source action", () => {
  assert.match(editorialImageSource, /sourceActionLabel/);
  assert.match(featuredGridSource, /阅读文章/);
  assert.match(featuredGridSource, /查看图库/);
  assert.match(featuredGridSource, /Read article/);
  assert.match(featuredGridSource, /View gallery/);
});
