"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "@/components/Lightbox";

type ImageZoomProps = {
  src: string;
  alt: string;
};

export default function ImageZoom({ src, alt }: ImageZoomProps) {
  const [open, setOpen] = useState(false);
  const image = { src, alt };

  return (
    <>
      <figure className="my-12">
        <button
          className="image-zoom group block w-full cursor-zoom-in text-left"
          type="button"
          aria-label={`Zoom image: ${alt}`}
          onClick={() => setOpen(true)}
        >
          <Image alt={alt} className="w-full grayscale" height={900} src={src} width={1440} />
        </button>
        <figcaption className="mt-4 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
          {alt}
        </figcaption>
      </figure>
      <Lightbox images={[image]} activeIndex={open ? 0 : null} onClose={() => setOpen(false)} onMove={() => undefined} />
    </>
  );
}
