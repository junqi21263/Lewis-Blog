import assert from "node:assert/strict";
import test from "node:test";

import {
  aboutImageDefaults,
  getAboutImageClassName,
  getAboutImageFrameClassName,
  getAboutImageStyle,
  splitAboutBody,
} from "../src/components/about/imagePresentation.ts";

test("about image presentation defaults to cinematic cover with centered focus", () => {
  assert.deepEqual(aboutImageDefaults, {
    imageFit: "cover",
    imagePositionX: "center",
    imagePositionY: "center",
    imageAspectRatio: "cinema",
  });

  assert.equal(getAboutImageFrameClassName({}), "relative aspect-[21/9] min-h-[320px] overflow-hidden bg-surface-container-low");
  assert.equal(getAboutImageClassName({}), "h-full w-full object-cover grayscale");
  assert.deepEqual(getAboutImageStyle({}), { objectPosition: "center center" });
});

test("contain mode keeps the full image visible inside the selected frame", () => {
  assert.equal(getAboutImageClassName({ imageFit: "contain" }), "h-full w-full object-contain grayscale");
  assert.deepEqual(getAboutImageStyle({ imageFit: "contain", imagePositionX: "left", imagePositionY: "top" }), {
    objectPosition: "left top",
  });
});

test("full-width and original modes avoid fixed-height cropping frames", () => {
  assert.equal(getAboutImageFrameClassName({ imageFit: "full-width" }), "relative overflow-hidden bg-surface-container-low");
  assert.equal(getAboutImageClassName({ imageFit: "full-width" }), "h-auto w-full grayscale");
  assert.equal(getAboutImageFrameClassName({ imageAspectRatio: "original" }), "relative overflow-hidden bg-surface-container-low");
  assert.equal(getAboutImageClassName({ imageAspectRatio: "original" }), "h-auto w-full grayscale");
});

test("body splitting does not fall back to headline or description", () => {
  assert.deepEqual(splitAboutBody("First paragraph.\n\nSecond paragraph."), ["First paragraph.", "Second paragraph."]);
  assert.deepEqual(splitAboutBody(""), []);
  assert.deepEqual(splitAboutBody("   \n\n  "), []);
});
