import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/data/site";

type BlogCardProps = {
  article: Article;
  priority?: boolean;
};

export default function BlogCard({ article, priority = false }: BlogCardProps) {
  return (
    <Link className="group card-lift block" href={`/journal/${article.slug}`}>
      <div className="image-zoom mb-6 aspect-[4/5]">
        <Image
          alt={article.image.alt}
          className="h-full w-full object-cover grayscale transition duration-1000 group-hover:grayscale-0"
          height={1200}
          priority={priority}
          src={article.image.src}
          width={960}
        />
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
