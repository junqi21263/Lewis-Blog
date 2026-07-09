"use client";

import FilmCard from "@/components/FilmCard";
import DynamicMetadata from "@/components/DynamicMetadata";
import { resolvePageCopy } from "@/components/pages/pageCopy";
import { siteUrl, type Film } from "@/data/site";
import { useCmsData } from "@/hooks/useCmsData";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

export default function FilmsClient() {
  const { locale } = useI18n();
  const { data } = useCmsData();
  const copy = resolvePageCopy(data.siteSettings.pageCopyJson, "films", locale);
  const canonicalUrl = `${siteUrl}${withLocalePrefix("/films", locale)}`;
  const featuredLabel = locale === "zh-CN" ? "精选" : locale === "zh-TW" ? "精選" : "Featured";
  const archiveLabel = locale === "zh-CN" ? "归档" : locale === "zh-TW" ? "歸檔" : "Archive";
  const films: Film[] = data.videos
    .filter((video) => video.status === "published")
    .map((video) => ({
      id: video.id,
      title: video.title,
      year: video.featured ? featuredLabel : archiveLabel,
      duration: video.duration,
      category: video.tags[0] ?? video.platform,
      description: video.description,
      poster: {
        src: video.coverImage,
        alt: `${video.title} cover image.`,
      },
      videoSrc: video.videoUrl,
    }));

  return (
    <div className="editorial-shell pb-24 md:pb-section-gap" data-pagefind-body>
      <DynamicMetadata canonicalUrl={canonicalUrl} description={copy.description} title={copy.title} />
      <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-[0.85fr_1fr] md:items-end md:gap-8">
        <div>
          <div className="label-mono mb-5 md:mb-8">{copy.eyebrow}</div>
          <h1 className="font-serif text-[clamp(40px,12vw,64px)] leading-[1.04] text-on-background md:text-display-xl">{copy.title}</h1>
        </div>
        <p className="max-w-2xl text-body-md text-on-surface-variant md:text-body-lg">
          {copy.description}
        </p>
      </header>
      {films.length > 0 ? (
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-3">
          {films.map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </div>
      ) : (
        <section className="border-t border-outline-variant/10 py-16">
          <h2 className="font-serif text-headline-lg text-on-background">{copy.emptyTitle}</h2>
          <p className="mt-4 text-body-lg text-on-surface-variant">{copy.emptyDescription}</p>
        </section>
      )}
    </div>
  );
}
