"use client";

import PhotographyArchive from "@/components/PhotographyArchive";
import { useCmsData } from "@/hooks/useCmsData";
import { useI18n } from "@/i18n/useI18n";

export default function GalleryClient() {
  const { dictionary } = useI18n();
  const { data } = useCmsData();
  const photos = data.photos.filter((photo) => photo.status === "published");

  return (
    <div className="editorial-shell pb-28 md:pb-section-gap">
      <header className="mb-16 grid gap-8 md:grid-cols-[0.85fr_1fr] md:items-end">
        <div>
          <div className="label-mono mb-8">{dictionary.gallery.eyebrow}</div>
          <h1 className="font-serif text-display-lg text-on-background md:text-display-xl">{dictionary.gallery.title}</h1>
        </div>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">
          {dictionary.gallery.description}
        </p>
      </header>
      {photos.length > 0 ? (
        <PhotographyArchive photos={photos} />
      ) : (
        <section className="border-t border-outline-variant/10 py-16">
          <h2 className="font-serif text-headline-lg text-on-background">{dictionary.gallery.emptyTitle}</h2>
          <p className="mt-4 text-body-lg text-on-surface-variant">{dictionary.gallery.emptyDescription}</p>
        </section>
      )}
    </div>
  );
}
