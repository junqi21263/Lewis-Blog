import assert from "node:assert/strict";
import test from "node:test";

import { buildJournalArchiveModel } from "../src/components/journal/archivePresentation.ts";

function createEntry(overrides) {
  return {
    title: overrides.title,
    slug: overrides.slug,
    category: overrides.category,
    tags: overrides.tags ?? [],
    image: {
      src: overrides.coverImageSrc ?? "/cover.jpg",
      alt: overrides.title,
      displayMode: overrides.displayMode ?? "cover",
      focalX: 50,
      focalY: 50,
      width: 1200,
      height: 800,
      aspectRatio: 1.5,
    },
    excerpt: overrides.excerpt ?? "",
    featured: overrides.featured ?? false,
    pinned: overrides.pinned ?? false,
    readTime: overrides.readTime ?? "1 min read",
    sortDate: overrides.sortDate,
  };
}

test("journal archive model keeps publish-date order and groups entries by year", () => {
  const model = buildJournalArchiveModel([
      createEntry({
        title: "Pinned but older",
        slug: "pinned-but-older",
        category: "Travel",
        tags: ["Architecture"],
        pinned: true,
        sortDate: "2026-07-01T10:00:00.000Z",
      }),
      createEntry({
        title: "Latest published",
        slug: "latest-published",
        category: "Journal",
        tags: ["Writing"],
        featured: true,
        sortDate: "2026-07-03T08:00:00.000Z",
      }),
      createEntry({
        title: "Last year essay",
        slug: "last-year-essay",
        category: "Photography",
        tags: ["Architecture", "Writing"],
        sortDate: "2025-11-09T08:00:00.000Z",
      }),
    ]);

  assert.deepEqual(
    model.entries.map((entry) => entry.slug),
    ["latest-published", "pinned-but-older", "last-year-essay"],
  );
  assert.deepEqual(
    model.yearGroups.map((group) => ({ year: group.year, entries: group.entries.map((entry) => entry.slug) })),
    [
      { year: "2026", entries: ["pinned-but-older"] },
      { year: "2025", entries: ["last-year-essay"] },
    ],
  );
  assert.equal(model.featuredStory?.slug, "latest-published");
  assert.equal(model.entries[0].featured, true);
  assert.equal(model.entries[1].pinned, true);
});

test("journal archive model derives compact date stamps and filter options from entries", () => {
  const model = buildJournalArchiveModel([
      createEntry({
        title: "One",
        slug: "one",
        category: "Travel",
        tags: ["Architecture", "Writing"],
        sortDate: "2026-07-02T10:00:00.000Z",
      }),
      createEntry({
        title: "Two",
        slug: "two",
        category: "Photography",
        tags: ["Architecture"],
        sortDate: "2024-03-11T10:00:00.000Z",
      }),
    ]);

  assert.equal(model.entries[0].displayDate, "07.02");
  assert.deepEqual(model.filters.years, ["2026", "2024"]);
  assert.deepEqual(model.filters.categories, ["Travel", "Photography"]);
  assert.deepEqual(model.filters.tags, ["Architecture", "Writing"]);
});

test("journal archive model promotes the newest featured or pinned story into a dedicated lead slot", () => {
  const model = buildJournalArchiveModel([
    createEntry({
      title: "Newest standard entry",
      slug: "newest-standard-entry",
      category: "Travel",
      sortDate: "2026-07-05T10:00:00.000Z",
    }),
    createEntry({
      title: "Newest featured entry",
      slug: "newest-featured-entry",
      category: "Editorial",
      featured: true,
      sortDate: "2026-07-04T10:00:00.000Z",
    }),
    createEntry({
      title: "Older pinned entry",
      slug: "older-pinned-entry",
      category: "Journal",
      pinned: true,
      sortDate: "2026-06-30T10:00:00.000Z",
    }),
  ]);

  assert.equal(model.featuredStory?.slug, "newest-featured-entry");
  assert.deepEqual(
    model.yearGroups.map((group) => ({ year: group.year, entries: group.entries.map((entry) => entry.slug) })),
    [{ year: "2026", entries: ["newest-standard-entry", "older-pinned-entry"] }],
  );
});

test("journal archive model falls back to the newest pinned entry when no featured story exists", () => {
  const model = buildJournalArchiveModel([
    createEntry({
      title: "Newest pinned entry",
      slug: "newest-pinned-entry",
      category: "Travel",
      pinned: true,
      sortDate: "2026-07-05T10:00:00.000Z",
    }),
    createEntry({
      title: "Standard entry",
      slug: "standard-entry",
      category: "Travel",
      sortDate: "2026-07-04T10:00:00.000Z",
    }),
  ]);

  assert.equal(model.featuredStory?.slug, "newest-pinned-entry");
  assert.deepEqual(
    model.yearGroups.map((group) => ({ year: group.year, entries: group.entries.map((entry) => entry.slug) })),
    [{ year: "2026", entries: ["standard-entry"] }],
  );
});
