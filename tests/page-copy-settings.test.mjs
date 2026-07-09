import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("site settings persist localized page copy and translation modes", () => {
  const cmsSource = read("../src/data/cms.ts");
  const hookSource = read("../src/hooks/useCmsData.ts");
  const apiSource = read("../functions/api/admin/settings.ts");

  assert.match(cmsSource, /pageCopyJson:\s*PageCopyJson/);
  assert.match(hookSource, /page_copy_json/);
  assert.match(apiSource, /page_copy_json/);
  assert.match(apiSource, /page_copy_translate_from/);
  assert.match(apiSource, /DEEPSEEK_API_KEY/);
  assert.match(apiSource, /translatePageCopyToTraditional/);
});

test("settings exposes page copy fields and manual translation controls", () => {
  const settingsSource = read("../src/app/admin/settings/page.tsx");
  const pageCopySource = read("../src/components/pages/pageCopy.ts");

  assert.match(settingsSource, /Page Copy/);
  assert.match(pageCopySource, /emptyTitle/);
  assert.match(pageCopySource, /emptyDescription/);
  assert.match(settingsSource, /MANUAL/);
  assert.match(settingsSource, /AUTO/);
  assert.match(settingsSource, /updatePageCopyField/);
});

test("channel pages resolve hero and metadata copy from CMS settings", () => {
  for (const component of ["JournalClient", "GalleryClient", "GearClient", "FilmsClient", "FragmentsClient"]) {
    const source = read(`../src/components/${component}.tsx`);
    assert.match(source, /resolvePageCopy/);
    assert.match(source, /pageCopyJson/);
    assert.match(source, /DynamicMetadata/);
  }
});
