"use client";

import AiArchivePanel from "@/components/AiArchivePanel";
import DynamicMetadata from "@/components/DynamicMetadata";
import JournalArchive from "@/components/JournalArchive";
import EditorialPageSkeleton from "@/components/loading/EditorialPageSkeleton";
import { resolvePageCopy } from "@/components/pages/pageCopy";
import { FEATURE_AI_ARCHIVE } from "@/config/features";
import { getVisibleJournalPosts, postToArticle } from "@/data/cms";
import { siteUrl } from "@/data/site";
import { useCmsData } from "@/hooks/useCmsData";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

export default function JournalClient() {
  const { locale } = useI18n();
  const { data, isReady } = useCmsData();
  const copy = resolvePageCopy(data.siteSettings.pageCopyJson, "journal", locale);
  const canonicalUrl = `${siteUrl}${withLocalePrefix("/journal", locale)}`;
  const archiveEntries = getVisibleJournalPosts(data).map((post) => {
    const article = postToArticle(post, data, locale);

    return {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      tags: article.tags,
      featured: post.featured,
      pinned: post.pinned,
      readTime: article.readTime,
      image: article.image,
      sortDate: post.publishedAt || post.createdAt,
    };
  });

  if (!isReady) {
    return <EditorialPageSkeleton />;
  }

  return (
    <div className="editorial-shell pb-24 md:pb-section-gap" data-pagefind-body>
      <DynamicMetadata canonicalUrl={canonicalUrl} description={copy.description} title={copy.title} />
      <header className="mb-8 flex min-h-[14vh] flex-col justify-end border-b border-outline-variant/10 pb-6 pt-4 md:mb-10 md:min-h-[18vh] md:pb-7 md:pt-8">
        <div className="label-mono mb-4">{copy.eyebrow}</div>
        <h1 className="max-w-[11ch] overflow-visible py-1 font-serif text-[clamp(38px,11vw,46px)] leading-[1.04] text-on-background [text-wrap:balance] md:max-w-[12ch] md:text-[52px] lg:max-w-[14ch] lg:text-[62px]">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-2xl text-body-md text-on-surface-variant md:mt-5 md:text-body-lg">
          {copy.description}
        </p>
      </header>
      {FEATURE_AI_ARCHIVE ? <AiArchivePanel /> : null}
      <JournalArchive entries={archiveEntries} />
    </div>
  );
}
