"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ImageAsset } from "@/data/site";

type LightboxProps = {
  images: ImageAsset[];
  activeIndex: number | null;
  onClose: () => void;
  onMove: (index: number) => void;
};

export default function Lightbox({ images, activeIndex, onClose, onMove }: LightboxProps) {
  if (activeIndex === null) {
    return null;
  }

  const image = images[activeIndex];
  const previousIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
  const nextIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-background/95 p-margin-mobile backdrop-blur-md md:p-margin-desktop"
      role="dialog"
    >
      <button
        aria-label="Close lightbox"
        className="absolute right-6 top-6 grid size-11 place-items-center rounded-full border border-outline-variant/20 text-on-surface-variant transition hover:text-on-background"
        type="button"
        onClick={onClose}
      >
        <X aria-hidden size={20} />
      </button>
      <button
        aria-label="Previous image"
        className="absolute left-4 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-outline-variant/20 text-on-surface-variant transition hover:text-on-background md:grid"
        type="button"
        onClick={() => onMove(previousIndex)}
      >
        <ChevronLeft aria-hidden size={22} />
      </button>
      <figure className="w-full max-w-5xl">
        <div className="relative mx-auto aspect-[4/3] max-h-[76vh] w-full">
          <div
            aria-label={image.alt}
            className="h-full w-full bg-contain bg-center bg-no-repeat"
            role="img"
            style={{ backgroundImage: `url("${image.src}")` }}
          />
        </div>
        <figcaption className="mt-6 text-center font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
          {image.alt}
        </figcaption>
      </figure>
      <button
        aria-label="Next image"
        className="absolute right-4 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-outline-variant/20 text-on-surface-variant transition hover:text-on-background md:grid"
        type="button"
        onClick={() => onMove(nextIndex)}
      >
        <ChevronRight aria-hidden size={22} />
      </button>
    </div>
  );
}
