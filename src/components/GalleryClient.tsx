"use client";

import FeaturedImagesGrid from "@/components/FeaturedImagesGrid";
import DynamicMetadata from "@/components/DynamicMetadata";
import EditorialPageSkeleton from "@/components/loading/EditorialPageSkeleton";
import { resolvePageCopy } from "@/components/pages/pageCopy";
import { siteUrl } from "@/data/site";
import { useCmsData } from "@/hooks/useCmsData";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

export default function GalleryClient() {
  const { locale } = useI18n();
  const { data, isReady } = useCmsData();
  const copy = resolvePageCopy(data.siteSettings.pageCopyJson, "gallery", locale);
  const canonicalUrl = `${siteUrl}${withLocalePrefix("/gallery", locale)}`;
  const galleryImages = data.galleryImages.length > 0
    ? data.galleryImages
    : data.photos
        .filter((photo) => photo.status === "published")
        .map((photo) => ({
          id: `gallery-${photo.id}`,
          imageUrl: photo.imageUrl,
          alt: photo.altText || photo.description || photo.title,
          caption: photo.description || photo.altText || photo.title,
          sourceType: "gallery" as const,
          sourceId: photo.id,
          sourceTitle: photo.title,
          sourceUrl: withLocalePrefix("/gallery", locale),
          width: null,
          height: null,
        }));

  if (!isReady) {
    return <EditorialPageSkeleton />;
  }

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
      {galleryImages.length > 0 ? (
        <FeaturedImagesGrid
          images={galleryImages}
          emptyDescription={copy.emptyDescription}
          emptyTitle={copy.emptyTitle}
          variant="image-only"
        />
      ) : (
        <section className="border-t border-outline-variant/10 py-16">
          <h2 className="font-serif text-headline-lg text-on-background">{copy.emptyTitle}</h2>
          <p className="mt-4 text-body-lg text-on-surface-variant">{copy.emptyDescription}</p>
        </section>
      )}
    </div>
  );
}
