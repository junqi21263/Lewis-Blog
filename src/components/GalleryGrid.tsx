"use client";

import { useMemo, useState } from "react";
import type { GalleryImage, ImageAsset } from "@/data/site";
import Lightbox from "@/components/Lightbox";
import { cn } from "@/lib/utils";

type GalleryGridProps = {
  images: GalleryImage[];
};

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const lightboxImages = useMemo<ImageAsset[]>(() => images.map(({ src, alt }) => ({ src, alt })), [images]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 md:gap-gutter xl:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image.id}
            className={cn(
              "group card-lift block w-full text-left",
              image.orientation === "portrait" && "md:row-span-2",
            )}
            type="button"
            onClick={() => setActiveIndex(index)}
          >
            <div
              className={cn(
                "image-zoom relative mb-5",
                image.orientation === "portrait" && "aspect-[4/5]",
                image.orientation === "landscape" && "aspect-[4/3]",
                image.orientation === "square" && "aspect-square",
              )}
            >
              <div
                aria-label={image.alt}
                className="h-full w-full bg-cover bg-center transition duration-1000 md:grayscale md:group-hover:scale-105 md:group-hover:grayscale-0"
                role="img"
                style={{ backgroundImage: `url("${image.src}")` }}
              />
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="font-serif text-headline-md text-on-background">{image.title}</h3>
                <p className="label-mono mt-2">{image.location}</p>
              </div>
              <span className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          </button>
        ))}
      </div>
      <Lightbox activeIndex={activeIndex} images={lightboxImages} onClose={() => setActiveIndex(null)} onMove={setActiveIndex} />
    </>
  );
}
