export type JournalArchiveEntryInput = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  featured: boolean;
  pinned: boolean;
  readTime: string;
  image: {
    src: string;
    alt: string;
    displayMode?: "cover" | "contain" | "original";
    focalX?: number;
    focalY?: number;
    width?: number | null;
    height?: number | null;
    aspectRatio?: number | null;
  };
  sortDate: string;
};

export type JournalArchiveEntry = JournalArchiveEntryInput & {
  year: string;
  displayDate: string;
};

export type JournalArchiveYearGroup = {
  year: string;
  entries: JournalArchiveEntry[];
};

export type JournalArchiveModel = {
  entries: JournalArchiveEntry[];
  featuredStory: JournalArchiveEntry | null;
  yearGroups: JournalArchiveYearGroup[];
  filters: {
    categories: string[];
    tags: string[];
    years: string[];
  };
};

function archiveDateSource(value?: string) {
  if (!value) {
    return new Date("1970-01-01T00:00:00.000Z");
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date("1970-01-01T00:00:00.000Z") : parsed;
}

function formatDisplayDate(value?: string) {
  const date = archiveDateSource(value);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${month}.${day}`;
}

function formatYear(value?: string) {
  return String(archiveDateSource(value).getUTCFullYear());
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function buildJournalArchiveModel(entries: JournalArchiveEntryInput[]): JournalArchiveModel {
  const normalizedEntries = [...entries]
    .sort((left, right) => right.sortDate.localeCompare(left.sortDate))
    .map((entry) => ({
      ...entry,
      year: formatYear(entry.sortDate),
      displayDate: formatDisplayDate(entry.sortDate),
    }));

  const featuredStory =
    normalizedEntries.find((entry) => entry.featured) ??
    normalizedEntries.find((entry) => entry.pinned) ??
    null;
  const archiveEntries = featuredStory
    ? normalizedEntries.filter((entry) => entry.slug !== featuredStory.slug)
    : normalizedEntries;

  const yearGroups = archiveEntries.reduce<JournalArchiveYearGroup[]>((groups, entry) => {
    const current = groups.at(-1);
    if (current?.year === entry.year) {
      current.entries.push(entry);
      return groups;
    }

    groups.push({ year: entry.year, entries: [entry] });
    return groups;
  }, []);

  return {
    entries: normalizedEntries,
    featuredStory,
    yearGroups,
    filters: {
      categories: uniqueValues(normalizedEntries.map((entry) => entry.category)),
      tags: uniqueValues(normalizedEntries.flatMap((entry) => entry.tags)),
      years: uniqueValues(normalizedEntries.map((entry) => entry.year)),
    },
  };
}
