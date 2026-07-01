"use client";

import AiArchivePanel from "@/components/AiArchivePanel";
import ArticleCard from "@/components/ArticleCard";
import BlogCard from "@/components/BlogCard";
import { getVisibleJournalPosts, postToArticle } from "@/data/cms";
import { useCmsData } from "@/hooks/useCmsData";
import { useI18n } from "@/i18n/useI18n";

export default function JournalClient() {
  const { dictionary } = useI18n();
  const { data } = useCmsData();
  const journalArticles = getVisibleJournalPosts(data).map((post) => postToArticle(post, data));
  const [lead, ...rest] = journalArticles;

  return (
    <div className="editorial-shell pb-28 md:pb-section-gap">
      <header className="mb-16">
        <div className="label-mono mb-8">{dictionary.journal.eyebrow}</div>
        <h1 className="max-w-4xl font-serif text-display-lg text-on-background md:text-display-xl">
          {dictionary.journal.title}
        </h1>
      </header>
      <AiArchivePanel />

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
          <h2 className="font-serif text-headline-lg text-on-background">{dictionary.journal.emptyTitle}</h2>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
            {dictionary.journal.emptyDescription}
          </p>
        </section>
      )}
    </div>
  );
}
