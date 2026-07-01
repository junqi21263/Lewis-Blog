"use client";

import FilmCard from "@/components/FilmCard";
import type { Film } from "@/data/site";
import { useCmsData } from "@/hooks/useCmsData";
import { useI18n } from "@/i18n/useI18n";

export default function FilmsClient() {
  const { dictionary } = useI18n();
  const { data } = useCmsData();
  const films: Film[] = data.videos
    .filter((video) => video.status === "published")
    .map((video) => ({
      id: video.id,
      title: video.title,
      year: video.featured ? "Featured" : "Archive",
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
    <div className="editorial-shell pb-28 md:pb-section-gap">
      <header className="mb-16 grid gap-8 md:grid-cols-[0.85fr_1fr] md:items-end">
        <div>
          <div className="label-mono mb-8">{dictionary.films.eyebrow}</div>
          <h1 className="font-serif text-display-lg text-on-background md:text-display-xl">{dictionary.films.title}</h1>
        </div>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">
          {dictionary.films.description}
        </p>
      </header>
      {films.length > 0 ? (
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-3">
          {films.map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </div>
      ) : (
        <section className="border-t border-outline-variant/10 py-16">
          <h2 className="font-serif text-headline-lg text-on-background">{dictionary.films.emptyTitle}</h2>
          <p className="mt-4 text-body-lg text-on-surface-variant">{dictionary.films.emptyDescription}</p>
        </section>
      )}
    </div>
  );
}
