import type { AboutContentFields } from "@/data/cms";
import EditorialImage from "@/components/media/EditorialImage";
import { cn } from "@/lib/utils";
import {
  getAboutImageStyle,
  normalizeAboutImagePresentation,
  splitAboutBody,
} from "./imagePresentation";

type AboutPageContentProps = {
  content: AboutContentFields;
  fallback: {
    eyebrow: string;
    headline: string;
    description: string;
    imageAlt: string;
    imagePlaceholderTitle: string;
  };
  title: string;
  containerClassName?: string;
};

export default function AboutPageContent({ content, fallback, title, containerClassName }: AboutPageContentProps) {
  const imagePresentation = normalizeAboutImagePresentation(content);
  const headline = content.headline?.trim() || fallback.headline;
  const description = content.description?.trim() || fallback.description;
  const eyebrow = content.eyebrow?.trim() || fallback.eyebrow;
  const heroImage = content.heroImage?.trim() || "";
  const heroAlt = content.imageAlt?.trim() || fallback.imageAlt || headline || title;
  const bodyParagraphs = splitAboutBody(content.body ?? "");
  const editorialFit = imagePresentation.imageFit === "full-width" ? "original" : imagePresentation.imageFit;
  const editorialAspectRatio =
    imagePresentation.imageFit === "full-width" || imagePresentation.imageAspectRatio === "original"
      ? "original"
      : imagePresentation.imageAspectRatio === "square"
        ? "square"
        : "cinema";

  return (
    <div className={cn("pb-28 md:pb-section-gap", containerClassName)} data-pagefind-body>
      <section className="editorial-shell mb-14 grid gap-8 md:mb-20 md:grid-cols-12 md:items-end md:gap-12">
        <div className="md:col-span-7">
          <div className="label-mono mb-5 md:mb-8">{eyebrow}</div>
          <h1 className="font-serif text-[clamp(40px,12vw,64px)] leading-[1.04] text-on-background md:text-display-xl">{headline}</h1>
        </div>
        {description ? <p className="text-body-lg text-on-surface-variant md:col-span-5">{description}</p> : null}
      </section>

      <section className="editorial-shell mb-14 md:mb-20">
        {heroImage ? (
          <EditorialImage
            alt={heroAlt}
            aspectRatio={editorialAspectRatio}
            fit={editorialFit}
            frameClassName={editorialAspectRatio === "original" ? undefined : "min-h-[240px] md:min-h-[320px]"}
            height={1200}
            priority
            revealColorOnHover
            sizes="(min-width: 1280px) 1120px, calc(100vw - 48px)"
            src={heroImage}
            style={getAboutImageStyle(imagePresentation)}
            width={1800}
          />
        ) : (
          <div className="relative aspect-[4/5] min-h-[240px] overflow-hidden bg-surface-container-low sm:aspect-[16/10] md:min-h-[320px]">
            <div className="grid min-h-[240px] place-items-center px-6 text-center md:min-h-[320px] md:px-8">
              <div>
                <div className="label-mono mb-5 text-on-surface-variant">Lewis Photograph Blog</div>
                <p className="mx-auto max-w-2xl font-serif text-[34px] leading-tight text-on-background md:text-headline-lg">{fallback.imagePlaceholderTitle || title}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {bodyParagraphs.length ? (
        <section className="editorial-shell">
          <div className="max-w-3xl space-y-7 text-[17px] leading-8 text-on-surface-variant md:ml-auto md:space-y-8 md:text-body-lg">
            {bodyParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
