import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/data/site";

type ArticleCardProps = {
  article: Article;
  compact?: boolean;
};

export default function ArticleCard({ article, compact = false }: ArticleCardProps) {
  return (
    <Link
      className="group card-lift grid gap-5 border-t border-outline-variant/10 pt-6 md:grid-cols-[220px_1fr]"
      href={`/journal/${article.slug}`}
    >
      <div className="image-zoom aspect-video md:aspect-[4/3]">
        <Image
          alt={article.image.alt}
          className="h-full w-full object-cover grayscale transition duration-1000 group-hover:grayscale-0"
          height={480}
          src={article.image.src}
          width={640}
        />
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
