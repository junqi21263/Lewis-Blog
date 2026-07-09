import Image from "next/image";
import Link from "next/link";
import { objectFitForCover, objectPositionForCover, normalizeCoverDisplayMode, normalizeFocalPoint } from "@/components/article/coverPresentation";
import type { Article } from "@/data/site";

type ArticleCardProps = {
  article: Article;
  compact?: boolean;
  href?: string;
};

function ArticleImagePlaceholder({ title }: { title: string }) {
  return (
    <div className="grid h-full w-full place-items-center bg-surface-container-low px-4 text-center transition duration-1000 group-hover:bg-surface-container">
      <span className="font-serif text-headline-md text-on-background">{title}</span>
    </div>
  );
}

export default function ArticleCard({ article, compact = false, href }: ArticleCardProps) {
  const targetHref = href ?? `/journal/${article.slug}`;
  const objectFit = objectFitForCover(normalizeCoverDisplayMode(article.image.displayMode));
  const objectPosition = objectPositionForCover(normalizeFocalPoint(article.image.focalX), normalizeFocalPoint(article.image.focalY));

  return (
    <Link
      className="group card-lift grid gap-5 border-t border-outline-variant/10 pt-6 md:grid-cols-[220px_1fr]"
      href={targetHref}
      prefetch={false}
    >
      <div className="image-zoom aspect-video md:aspect-[4/3]">
        {article.image.src ? (
          <Image
            alt={article.image.alt}
            className="h-full w-full transition duration-1000 md:grayscale md:group-hover:grayscale-0"
            height={480}
            src={article.image.src}
            style={{ objectFit, objectPosition }}
            width={640}
          />
        ) : (
          <ArticleImagePlaceholder title={article.title} />
        )}
      </div>
      <div>
        <div className="label-mono mb-3">{article.category}</div>
        <h3 className="mb-3 font-serif text-headline-md text-on-background transition-colors duration-500 group-hover:text-secondary">
          {article.title}
        </h3>
        {!compact ? <p className="mb-5 text-body-md text-on-surface-variant">{article.excerpt}</p> : null}
        <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
          {article.date} / {article.readTime}
        </p>
      </div>
    </Link>
  );
}
