"use client";

import type { FeaturedImage } from "@/data/site";
import { useI18n } from "@/i18n/useI18n";
import { cn } from "@/lib/utils";
import EditorialImage from "@/components/media/EditorialImage";
import { resolveEditorialAspectRatioFromSize } from "@/components/media/editorialImageStyles";

type FeaturedImagesGridProps = {
  images: FeaturedImage[];
  emptyTitle: string;
  emptyDescription: string;
  variant?: "editorial" | "image-only";
};

function sourceLabel(sourceType: FeaturedImage["sourceType"], locale: "zh-CN" | "zh-TW" | "en-US") {
  if (locale === "en-US") {
    return sourceType === "article" ? "From article" : "From gallery";
  }
  if (locale === "zh-TW") {
    return sourceType === "article" ? "來自文章" : "來自圖庫";
  }
  return sourceType === "article" ? "来自文章" : "来自图库";
}

function sourceActionLabel(sourceType: FeaturedImage["sourceType"], locale: "zh-CN" | "zh-TW" | "en-US") {
  if (locale === "en-US") {
    return sourceType === "article" ? "Read article" : "View gallery";
  }
  if (locale === "zh-TW") {
    return sourceType === "article" ? "閱讀文章" : "查看圖庫";
  }
  return sourceType === "article" ? "阅读文章" : "查看图库";
}

export default function FeaturedImagesGrid({ images, emptyTitle, emptyDescription, variant = "editorial" }: FeaturedImagesGridProps) {
  const { locale } = useI18n();

  if (images.length === 0) {
    return (
      <div className="border-y border-outline-variant/10 py-14">
        <h3 className="font-serif text-headline-md text-on-background">{emptyTitle}</h3>
        <p className="mt-4 max-w-2xl text-body-md text-on-surface-variant">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className={variant === "image-only" ? "grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 md:gap-gutter lg:grid-cols-3" : "grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3"}>
      {images.map((image, index) => (
        <div
          key={image.id}
          className={cn(
            "block",
            variant === "editorial" && "border-t border-outline-variant/10 pt-4",
            index % 5 === 0 && "sm:col-span-2 lg:col-span-1",
          )}
        >
          <EditorialImage
            alt={image.alt}
            aspectRatio={resolveEditorialAspectRatioFromSize(image.width, image.height)}
            caption={
              variant === "editorial" ? (
                <span className="flex items-start justify-between gap-4">
                  <span>
                    <span className="block font-serif text-headline-md normal-case tracking-normal text-on-background">{image.caption || image.alt}</span>
                    <span className="label-mono mt-2 block">
                      {sourceLabel(image.sourceType, locale)} / {image.sourceTitle}
                    </span>
                  </span>
                  <span className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </span>
              ) : null
            }
            fit="contain"
            revealColorOnHover
            sourceActionLabel={sourceActionLabel(image.sourceType, locale)}
            sourceLabel={sourceLabel(image.sourceType, locale)}
            sourceTitle={image.sourceTitle}
            sourceUrl={image.sourceUrl}
            src={image.imageUrl}
          />
        </div>
      ))}
    </div>
  );
}
