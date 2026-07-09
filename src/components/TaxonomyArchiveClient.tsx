"use client";

import ArticleCard from "@/components/ArticleCard";
import { getVisibleJournalPosts, getCategoryById, getPostTags, postToArticle } from "@/data/cms";
import { useCmsData } from "@/hooks/useCmsData";
import { localeToSegment } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

type TaxonomyArchiveClientProps = {
  type: "category" | "tag";
  slug: string;
};

export default function TaxonomyArchiveClient({ type, slug }: TaxonomyArchiveClientProps) {
  const { data } = useCmsData();
  const { locale, dictionary } = useI18n();
  const localeSegment = localeToSegment(locale);
  const posts = getVisibleJournalPosts(data).filter((post) => {
    if (type === "category") {
      return getCategoryById(data, post.categoryId).slug === slug;
    }
    return getPostTags(data, post).some((tag) => tag.slug === slug);
  });
  const articles = posts.map((post) => postToArticle(post, data, locale));
  const title =
    type === "category"
      ? data.categories.find((category) => category.slug === slug)?.name ?? slug
      : data.tags.find((tag) => tag.slug === slug)?.name ?? slug;

  return (
    <main className="editorial-shell pb-28 pt-32 md:pb-section-gap">
      <header className="mb-16">
        <div className="label-mono mb-8">{type === "category" ? "Category Archive" : "Tag Archive"}</div>
        <h1 className="max-w-4xl font-serif text-display-lg text-on-background md:text-display-xl">{title}</h1>
      </header>
      {articles.length > 0 ? (
        <section className="grid gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} href={`/${localeSegment}/journal/${article.slug}`} />
          ))}
        </section>
      ) : (
        <section className="border-t border-outline-variant/10 py-16">
          <h2 className="font-serif text-headline-lg text-on-background">{dictionary.common.searchEmpty}</h2>
          <p className="mt-4 text-body-lg text-on-surface-variant">{dictionary.common.searchHint}</p>
        </section>
      )}
    </main>
  );
}
