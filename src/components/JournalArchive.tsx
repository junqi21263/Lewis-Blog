"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  objectFitForCover,
  objectPositionForCover,
  normalizeCoverDisplayMode,
  normalizeFocalPoint,
} from "@/components/article/coverPresentation";
import {
  buildJournalArchiveModel,
  type JournalArchiveEntry,
  type JournalArchiveEntryInput,
} from "@/components/journal/archivePresentation";
import EditorialImage from "@/components/media/EditorialImage";
import { withLocalePrefix, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

type JournalArchiveProps = {
  entries: JournalArchiveEntryInput[];
};

function toRomanYear(year: string) {
  const value = Number(year);
  if (!Number.isFinite(value) || value <= 0) {
    return year;
  }

  const numerals: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let remainder = value;
  let result = "";
  for (const [numeric, symbol] of numerals) {
    while (remainder >= numeric) {
      result += symbol;
      remainder -= numeric;
    }
  }

  return result;
}

function articleHref(locale: Locale, slug: string) {
  return withLocalePrefix(`/journal/${slug}`, locale);
}

function coverPresentation(entry: JournalArchiveEntry) {
  const coverFit = entry.image.displayMode === "original" ? "contain" : normalizeCoverDisplayMode(entry.image.displayMode);
  const coverPosition = objectPositionForCover(
    normalizeFocalPoint(entry.image.focalX),
    normalizeFocalPoint(entry.image.focalY),
  );

  return {
    coverFit,
    coverPosition,
  };
}

function MetaColumn({ entry }: { entry: JournalArchiveEntry }) {
  const { dictionary } = useI18n();
  const markers = [
    entry.category,
    entry.pinned ? dictionary.journal.pinnedLabel : null,
    entry.featured ? dictionary.journal.featuredLabel : null,
  ].filter(Boolean);

  return (
    <div className="space-y-3 text-on-surface-variant">
      <div className="font-mono text-[18px] uppercase tracking-[0.24em] text-on-background md:text-[20px]">
        {entry.displayDate}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
        {markers.join(" / ")}
      </div>
      {entry.tags.length > 0 ? (
        <div className="flex flex-wrap gap-x-2 gap-y-2 font-mono text-[9px] uppercase tracking-[0.18em] text-on-surface-variant">
          {entry.tags.map((tag) => (
            <span key={`${entry.slug}-${tag}`}>[{tag}]</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ArchiveImage({
  entry,
  sizes,
  frameClassName,
}: {
  entry: JournalArchiveEntry;
  sizes: string;
  frameClassName: string;
}) {
  const { coverFit, coverPosition } = coverPresentation(entry);

  if (!entry.image.src) {
    return <div className={`w-full border border-outline-variant/10 bg-surface-container-low ${frameClassName}`} />;
  }

  return (
    <EditorialImage
      alt={entry.image.alt || entry.title}
      aspectRatio="original"
      className="w-full"
      fit={coverFit}
      frameClassName={`w-full overflow-hidden border border-outline-variant/10 bg-surface-container-low ${frameClassName}`}
      grayscale
      imageClassName="h-full w-full md:group-hover/editorial-image:scale-[1.025]"
      revealColorOnHover
      sizes={sizes}
      src={entry.image.src}
      style={{ objectFit: objectFitForCover(coverFit), objectPosition: coverPosition }}
    />
  );
}

function FeaturedStory({ entry }: { entry: JournalArchiveEntry }) {
  const { locale } = useI18n();

  return (
    <Link
      className="group mb-14 block border-y border-outline-variant/10 py-7 md:mb-16 md:py-10"
      href={articleHref(locale, entry.slug)}
      prefetch={false}
    >
      <article className="grid gap-7 md:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] md:items-end md:gap-10 lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)] lg:gap-14">
        <div className="order-2 md:order-1">
          <div className="label-mono mb-5">FEATURED STORY</div>
          <MetaColumn entry={entry} />
          <h2 className="mt-8 max-w-[11.5em] font-serif text-[34px] leading-[1.06] text-on-background transition-colors duration-[250ms] ease-[ease] [text-wrap:balance] group-hover:text-secondary md:text-[50px] lg:text-[62px]">
            {entry.title}
          </h2>
          {entry.excerpt ? (
            <p className="mt-5 max-w-2xl text-body-md leading-8 text-on-surface-variant md:text-body-lg">
              {entry.excerpt}
            </p>
          ) : null}
          <div className="label-mono mt-6">{entry.year} / {entry.readTime}</div>
        </div>

        <div className="order-1 md:order-2">
          <ArchiveImage
            entry={entry}
            frameClassName="aspect-video"
            sizes="(min-width: 1280px) 600px, (min-width: 768px) 48vw, 100vw"
          />
        </div>
      </article>
    </Link>
  );
}

function ArchiveEntryRow({ entry }: { entry: JournalArchiveEntry }) {
  const { locale } = useI18n();

  return (
    <Link
      className="group block border-t border-outline-variant/10 py-8 md:py-9"
      href={articleHref(locale, entry.slug)}
      prefetch={false}
    >
      <article className="grid gap-5 md:grid-cols-[100px_minmax(0,1.35fr)_minmax(340px,0.95fr)] md:items-start md:gap-8 lg:grid-cols-[120px_minmax(0,1.2fr)_420px] lg:gap-10">
        <div className="order-2 md:order-1">
          <MetaColumn entry={entry} />
        </div>

        <div className="order-3 min-w-0 md:order-2">
          <h2 className="max-w-[13em] font-serif text-[31px] leading-[1.12] text-on-background transition-colors duration-[250ms] ease-[ease] [text-wrap:balance] group-hover:text-secondary md:text-[38px] lg:text-[42px]">
            {entry.title}
          </h2>
          {entry.excerpt ? (
            <p className="mt-4 max-w-2xl text-body-md leading-8 text-on-surface-variant md:text-body-lg">
              {entry.excerpt}
            </p>
          ) : null}
          <div className="label-mono mt-5">{entry.year} / {entry.readTime}</div>
        </div>

        <div className="order-1 md:order-3 md:justify-self-end">
          <ArchiveImage
            entry={entry}
            frameClassName="aspect-[4/3] md:w-[380px] lg:w-[420px]"
            sizes="(min-width: 1280px) 420px, (min-width: 768px) 33vw, 100vw"
          />
        </div>
      </article>
    </Link>
  );
}

function ArchiveYearDivider({ year }: { year: string }) {
  return (
    <div className="mb-4 flex items-center gap-5 md:mb-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.36em] text-on-surface-variant">
        {toRomanYear(year)} / {year}
      </div>
      <div className="h-px flex-1 bg-outline-variant/20" />
    </div>
  );
}

export default function JournalArchive({ entries }: JournalArchiveProps) {
  const { dictionary } = useI18n();
  const archive = useMemo(() => buildJournalArchiveModel(entries), [entries]);
  const hasEntries = archive.entries.length > 0;

  if (!hasEntries) {
    return (
      <section className="border-t border-outline-variant/10 py-16">
        <div className="label-mono mb-5">{dictionary.journal.archiveLabel}</div>
        <h2 className="max-w-2xl font-serif text-headline-lg text-on-background">{dictionary.journal.emptyTitle}</h2>
        <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">{dictionary.journal.emptyDescription}</p>
      </section>
    );
  }

  return (
    <>
      {archive.featuredStory ? <FeaturedStory entry={archive.featuredStory} /> : null}

      <section className="space-y-14 md:space-y-16">
        {archive.yearGroups.map((group) => (
          <div key={group.year}>
            <ArchiveYearDivider year={group.year} />
            <div>
              {group.entries.map((entry) => (
                <ArchiveEntryRow key={entry.slug} entry={entry} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
