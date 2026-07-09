"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  getEditorialImageAspectClassName,
  getEditorialImageFilterClassName,
  getEditorialImageObjectClassName,
  type EditorialImageAspectRatio,
  type EditorialImageFit,
} from "./editorialImageStyles";

type EditorialImageProps = {
  src: string;
  alt: string;
  fit?: EditorialImageFit;
  grayscale?: boolean;
  revealColorOnHover?: boolean;
  aspectRatio?: EditorialImageAspectRatio;
  caption?: ReactNode;
  sourceUrl?: string;
  sourceLabel?: string;
  sourceTitle?: string;
  sourceActionLabel?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  fillFrame?: boolean;
  className?: string;
  frameClassName?: string;
  imageClassName?: string;
  captionClassName?: string;
  style?: CSSProperties;
  onClick?: () => void;
};

function isExternalUrl(url: string) {
  return /^https?:\/\//.test(url);
}

export default function EditorialImage({
  src,
  alt,
  fit = "cover",
  grayscale = true,
  revealColorOnHover = true,
  aspectRatio = "cinema",
  caption,
  sourceUrl,
  sourceLabel,
  sourceTitle,
  sourceActionLabel,
  width = 1440,
  height = 900,
  sizes = "(min-width: 1280px) 1120px, calc(100vw - 48px)",
  priority = false,
  fillFrame = false,
  className,
  frameClassName,
  imageClassName,
  captionClassName,
  style,
  onClick,
}: EditorialImageProps) {
  const usesIntrinsicImage = !fillFrame && (aspectRatio === "original" || fit === "original");
  const aspectClassName = getEditorialImageAspectClassName(aspectRatio);
  const image = (
    <Image
      alt={alt}
      className={cn(
        getEditorialImageObjectClassName(fit),
        getEditorialImageFilterClassName({ grayscale, revealColorOnHover }),
        imageClassName,
      )}
      fill={!usesIntrinsicImage}
      height={usesIntrinsicImage ? height : undefined}
      loading={priority ? undefined : "lazy"}
      priority={priority}
      sizes={sizes}
      src={src}
      style={style}
      width={usesIntrinsicImage ? width : undefined}
    />
  );
  const media = (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-container-low",
        aspectClassName,
        usesIntrinsicImage && "w-full",
        frameClassName,
      )}
    >
      {image}
      {sourceLabel ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[16%] min-h-14 translate-y-0 items-end bg-[linear-gradient(to_top,rgba(0,0,0,0.75),rgba(0,0,0,0.35),transparent)] px-3 pb-2.5 pt-5 text-white backdrop-blur-[1.5px] transition-[opacity,transform] duration-300 ease-out md:h-[18%] md:min-h-16 md:translate-y-3 md:px-4 md:pb-3 md:pt-6 md:opacity-0 md:group-focus-within/editorial-image:translate-y-0 md:group-focus-within/editorial-image:opacity-100 md:group-hover/editorial-image:translate-y-0 md:group-hover/editorial-image:opacity-100">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/70 md:text-[10px]">{sourceLabel}</p>
            <div className="mt-0.5 flex min-w-0 items-baseline justify-between gap-3 md:mt-1">
              {sourceTitle ? <p className="line-clamp-1 min-w-0 text-xs leading-4 text-white md:text-sm md:leading-5">{sourceTitle}</p> : null}
              {sourceActionLabel ? (
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-white/80 md:text-[10px]">
                  → {sourceActionLabel}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
  const content = sourceUrl ? (
    isExternalUrl(sourceUrl) ? (
      <a className="block" href={sourceUrl}>
        {media}
      </a>
    ) : (
      <Link className="block" href={sourceUrl} prefetch={false}>
        {media}
      </Link>
    )
  ) : onClick ? (
    <button aria-label={`Zoom image: ${alt}`} className="block w-full cursor-zoom-in text-left" type="button" onClick={onClick}>
      {media}
    </button>
  ) : (
    media
  );

  return (
    <figure className={cn("group/editorial-image", className)}>
      {content}
      {caption ? (
        <figcaption className={cn("mt-4 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant", captionClassName)}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
