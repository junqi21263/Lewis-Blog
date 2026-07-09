import assert from "node:assert/strict";
import test from "node:test";

import {
  getEditorialImageAspectClassName,
  getEditorialImageFilterClassName,
  getEditorialImageObjectClassName,
  resolveEditorialAspectRatioFromSize,
} from "../src/components/media/editorialImageStyles.ts";

test("editorial image styles map aspect ratio and fit without forcing layout shifts", () => {
  assert.equal(getEditorialImageAspectClassName("cinema"), "aspect-[16/10]");
  assert.equal(getEditorialImageAspectClassName("landscape"), "aspect-[3/2]");
  assert.equal(getEditorialImageAspectClassName("portrait"), "aspect-[4/5]");
  assert.equal(getEditorialImageAspectClassName("square"), "aspect-square");
  assert.equal(getEditorialImageAspectClassName("original"), "");

  assert.equal(getEditorialImageObjectClassName("cover"), "h-full w-full object-cover");
  assert.equal(getEditorialImageObjectClassName("contain"), "h-full w-full object-contain");
  assert.equal(getEditorialImageObjectClassName("original"), "h-auto w-full object-contain");
});

test("editorial image hover reveal is desktop-only and changes filters, not dimensions", () => {
  const className = getEditorialImageFilterClassName({ grayscale: true, revealColorOnHover: true });

  assert.match(className, /\btransition-\[filter,transform]/);
  assert.match(className, /\bduration-300\b/);
  assert.match(className, /\bmd:grayscale\b/);
  assert.match(className, /\bmd:brightness-\[0\.92]/);
  assert.match(className, /\bmd:contrast-\[0\.96]/);
  assert.match(className, /\bmd:group-hover\/editorial-image:grayscale-0\b/);
  assert.match(className, /\bmd:group-hover\/editorial-image:brightness-100\b/);
  assert.doesNotMatch(className, /\bscale-/);
});

test("editorial image aspect ratio can be inferred from real dimensions", () => {
  assert.equal(resolveEditorialAspectRatioFromSize(1600, 900), "cinema");
  assert.equal(resolveEditorialAspectRatioFromSize(1000, 1000), "square");
  assert.equal(resolveEditorialAspectRatioFromSize(900, 1200), "portrait");
  assert.equal(resolveEditorialAspectRatioFromSize(null, null), "cinema");
});
