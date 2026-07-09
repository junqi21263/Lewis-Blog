import Image from "next/image";
import Link from "next/link";
import { objectFitForCover, objectPositionForCover, normalizeCoverDisplayMode, normalizeFocalPoint } from "@/components/article/coverPresentation";
import type { Article } from "@/data/site";

type BlogCardProps = {
  article: Article;
  priority?: boolean;
  href?: string;
};

function ArticleImagePlaceholder({ title }: { title: string }) {
  return (
    <div className="grid h-full w-full place-items-center bg-surface-container-low px-6 text-center transition duration-1000 group-hover:bg-surface-container">
      <span className="font-serif text-headline-md text-on-background">{title}</span>
    </div>
  );
}

export default function BlogCard({ article, href, priority = false }: BlogCardProps) {
  const targetHref = href ?? `/journal/${article.slug}`;
  const objectFit = objectFitForCover(normalizeCoverDisplayMode(article.image.displayMode));
  const objectPosition = objectPositionForCover(normalizeFocalPoint(article.image.focalX), normalizeFocalPoint(article.image.focalY));

  return (
    <Link className="group card-lift block" href={targetHref} prefetch={false}>
      <div className="image-zoom mb-6 aspect-[4/5]">
        {article.image.src ? (
          <Image
            alt={article.image.alt}
            className="h-full w-full transition duration-1000 md:grayscale md:group-hover:grayscale-0"
            height={1200}
            priority={priority}
            src={article.image.src}
            style={{ objectFit, objectPosition }}
            width={960}
          />
        ) : (
          <ArticleImagePlaceholder title={article.title} />
        )}
      </div>
      <div className="label-mono mb-3">{article.eyebrow}</div>
      <h2 className="mb-4 font-serif text-headline-mobile text-on-background md:text-headline-lg">
        {article.title}
      </h2>
      <p className="mb-5 text-body-md text-on-surface-variant">{article.excerpt}</p>
      <div className="flex flex-wrap items-center gap-3 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
        <span>{article.date}</span>
        <span className="size-1 rounded-full bg-outline-variant" />
        <span>{article.readTime}</span>
      </div>
    </Link>
  );
}
