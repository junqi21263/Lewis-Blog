import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const editorSource = readFileSync(new URL("../src/components/admin/PostEditorScreen.tsx", import.meta.url), "utf8");
const cmsSource = readFileSync(new URL("../src/data/cms.ts", import.meta.url), "utf8");
const hookSource = readFileSync(new URL("../src/hooks/useCmsData.ts", import.meta.url), "utf8");
const sidebarSource = readFileSync(new URL("../src/components/admin/AdminSidebar.tsx", import.meta.url), "utf8");

test("post editor exposes direct cover upload controls and cover display metadata", () => {
  assert.match(editorSource, /uploadCover/);
  assert.match(editorSource, /replaceCover/);
  assert.match(editorSource, /deleteCover/);
  assert.match(editorSource, /coverDisplayMode/);
  assert.match(editorSource, /coverFocalX/);
  assert.match(editorSource, /coverFocalY/);
  assert.match(cmsSource, /coverDisplayMode/);
  assert.match(hookSource, /cover_display_mode/);
});

test("admin navigation includes category and tag management", () => {
  assert.equal(sidebarSource.includes("/admin/categories"), true);
  assert.equal(sidebarSource.includes("/admin/tags"), true);
});

test("post editor explains automatic translation locks and publish success feedback", () => {
  assert.match(editorSource, /Auto Translation/);
  assert.match(editorSource, /Manual Override/);
  assert.match(editorSource, /restoreAutoSync/);
  assert.match(editorSource, /Article Published Successfully/);
  assert.match(editorSource, /copyPublishedLink/);
  assert.match(editorSource, /Publishing\.\.\./);
});
