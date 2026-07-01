"use client";

import { useMemo, useState } from "react";
import ArticleCard from "@/components/ArticleCard";
import BlogCard from "@/components/BlogCard";
import type { Article } from "@/data/site";
import { getArticleCategories, getArticleTags } from "@/data/site";
import { cn } from "@/lib/utils";

type JournalArchiveProps = {
  articles: Article[];
};

export default function JournalArchive({ articles }: JournalArchiveProps) {
  const [category, setCategory] = useState("All");
  const [tag, setTag] = useState("All");
  const categories = useMemo(() => ["All", ...getArticleCategories()], []);
  const tags = useMemo(() => ["All", ...getArticleTags()], []);
  const filteredArticles = useMemo(
    () =>
      articles.filter((article) => {
        const matchesCategory = category === "All" || article.category === category;
        const matchesTag = tag === "All" || article.tags.includes(tag);
        return matchesCategory && matchesTag;
      }),
    [articles, category, tag],
  );
  const [lead, ...rest] = filteredArticles;

  return (
    <>
      <section className="mb-14 border-y border-outline-variant/10 py-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
          <span className="label-mono min-w-24">Category</span>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                className={cn(
                  "whitespace-nowrap border border-outline-variant/20 px-4 py-2 font-mono text-label-mono uppercase tracking-widest transition hover:text-on-background",
                  category === item ? "bg-primary text-background" : "text-on-surface-variant",
                )}
                type="button"
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <span className="label-mono min-w-24">Tags</span>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {tags.map((item) => (
              <button
                key={item}
                className={cn(
                  "whitespace-nowrap rounded-full border border-outline-variant/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition hover:text-on-background",
                  tag === item ? "bg-surface-container-high text-on-background" : "text-on-surface-variant",
                )}
                type="button"
                onClick={() => setTag(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {lead ? (
        <section className="mb-20 grid gap-gutter md:grid-cols-[1.15fr_0.85fr]">
          <BlogCard article={lead} priority />
          <div className="flex flex-col gap-8">
            {rest.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      ) : (
        <section className="border-t border-outline-variant/10 py-16">
          <h2 className="font-serif text-headline-lg text-on-background">No entries found.</h2>
          <p className="mt-4 text-body-lg text-on-surface-variant">Adjust the category or tag filters.</p>
        </section>
      )}
    </>
  );
}
