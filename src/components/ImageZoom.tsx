"use client";

import { useState } from "react";
import Lightbox from "@/components/Lightbox";
import EditorialImage from "@/components/media/EditorialImage";

type ImageZoomProps = {
  src: string;
  alt: string;
  layout?: "full-width";
};

export default function ImageZoom({ src, alt, layout }: ImageZoomProps) {
  const [open, setOpen] = useState(false);
  const image = { src, alt };

  return (
    <>
      <EditorialImage
        alt={alt}
        aspectRatio="original"
        caption={alt}
        className={layout === "full-width" ? "my-14 md:-mx-16" : "my-14"}
        fit="original"
        height={900}
        onClick={() => setOpen(true)}
        revealColorOnHover
        src={src}
        width={1440}
      />
      <Lightbox images={[image]} activeIndex={open ? 0 : null} onClose={() => setOpen(false)} onMove={() => undefined} />
    </>
  );
}
