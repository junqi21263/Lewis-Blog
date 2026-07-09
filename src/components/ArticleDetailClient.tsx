"use client";

import Link from "next/link";
import { Fragment, type ReactNode, useEffect, useMemo, useState } from "react";
import ArticleMeta from "@/components/ArticleMeta";
import ArticleNavigation, { type ArticleNavigationData } from "@/components/ArticleNavigation";
import ArticleToc from "@/components/ArticleToc";
import CodeBlock from "@/components/CodeBlock";
import Footnotes from "@/components/Footnotes";
import GiscusComments from "@/components/GiscusComments";
import ImageZoom from "@/components/ImageZoom";
import ReadingProgress from "@/components/ReadingProgress";
import ReadingCompletion from "@/components/ReadingCompletion";
import StructuredData from "@/components/StructuredData";
import { resolveBrandContent } from "@/components/brand/brandContent";
import EditorialImage from "@/components/media/EditorialImage";
import { siteName, siteUrl } from "@/data/site";
import { useCmsData } from "@/hooks/useCmsData";
import { objectFitForCover, objectPositionForCover, normalizeCoverDisplayMode, normalizeFocalPoint, type CoverDisplayMode } from "@/components/article/coverPresentation";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";
import { analyzeArticleContent } from "@/lib/editor";

type ApiPost = {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  cover_display_mode?: CoverDisplayMode | null;
  cover_focal_x?: number | null;
  cover_focal_y?: number | null;
  status: string;
  published_at: string | null;
  tags?: string[];
};

type AiRelatedItem = {
  slug?: string | null;
  title: string;
  description?: string;
  tags?: string[];
};

function QuietImagePlaceholder({ title, brandName }: { title: string; brandName: string }) {
  return (
    <div className="relative grid h-full w-full place-items-center bg-surface-container-low">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_55%)]" />
      <div className="relative px-8 text-center">
        <div className="label-mono mb-4 text-on-surface-variant">{brandName}</div>
        <p className="mx-auto max-w-xl font-serif text-headline-md text-on-background">{title}</p>
      </div>
    </div>
  );
}

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\[\^[^\]]+])/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[\^([^\]]+)]$/);
    if (match) {
      return (
        <sup key={`${part}-${index}`} id={`footnote-ref-${match[1]}`}>
          <a className="ml-0.5 text-secondary" href={`#footnote-${match[1]}`}>
            {match[1]}
          </a>
        </sup>
      );
    }
    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

export default function ArticleDetailClient({ slug }: { slug: string }) {
  const { locale, dictionary } = useI18n();
  const { data } = useCmsData();
  const brand = resolveBrandContent(data.siteSettings.brandJson, locale);
  const brandName = brand.brandName || brand.cmsTitle || siteName;
  const [post, setPost] = useState<ApiPost | null>(null);
  const [navigation, setNavigation] = useState<ArticleNavigationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const analysis = useMemo(() => (post ? analyzeArticleContent(post.content) : null), [post]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/posts/${encodeURIComponent(slug)}?lang=${encodeURIComponent(locale)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Post not found");
        }
        return (await response.json()) as { data: ApiPost };
      })
      .then((payload) => {
        if (!cancelled) {
          setPost(payload.data);
          setFailed(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      };
  }, [locale, slug]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/posts/${encodeURIComponent(slug)}/navigation?lang=${encodeURIComponent(locale)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Navigation not found");
        }
        return (await response.json()) as { data: ArticleNavigationData };
      })
      .then((payload) => {
        if (!cancelled) {
          setNavigation(payload.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNavigation(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [locale, slug]);

  useEffect(() => {
    if (!post) return;
    let cancelled = false;

    fetch(`/api/ai/related?source=${encodeURIComponent(post.id || post.slug)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("AI related articles unavailable");
        }
        return (await response.json()) as { data: AiRelatedItem[] };
      })
      .then((payload) => {
        if (cancelled || payload.data.length === 0) return;
        const aiRelated = payload.data
          .filter((item) => item.slug && item.slug !== post.slug)
          .map((item) => ({
            slug: item.slug as string,
            title: item.title,
            excerpt: item.description || null,
            category: item.tags?.[0] || "AI Related",
          }));

        if (aiRelated.length === 0) return;
        setNavigation((current) => ({
          previous: current?.previous ?? null,
          next: current?.next ?? null,
          related: aiRelated,
        }));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [post]);

  if (isLoading) {
    return (
      <div className="editorial-shell pb-28 md:pb-section-gap">
        <div className="h-[70vh] animate-pulse border border-outline-variant/10 bg-surface-container-low" />
      </div>
    );
  }

  if (failed || !post || post.status !== "published" || !analysis) {
    return (
      <div className="editorial-shell pb-28 md:pb-section-gap">
        <section className="border-t border-outline-variant/10 py-16">
          <h1 className="font-serif text-display-lg text-on-background">{dictionary.common.entryUnavailable}</h1>
          <p className="mt-4 text-body-lg text-on-surface-variant">{dictionary.common.entryUnavailableDescription}</p>
          <Link className="label-mono mt-8 inline-block hover:text-secondary" href={withLocalePrefix("/journal", locale)}>
            {dictionary.common.backToJournal}
          </Link>
        </section>
      </div>
    );
  }
  const coverObjectFit = objectFitForCover(normalizeCoverDisplayMode(post.cover_display_mode));
  const coverObjectPosition = objectPositionForCover(normalizeFocalPoint(post.cover_focal_x), normalizeFocalPoint(post.cover_focal_y));

  return (
    <>
      <ReadingProgress />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt || post.subtitle,
          image: post.cover_image_url ? new URL(post.cover_image_url, siteUrl).toString() : `${siteUrl}/og/${post.slug}`,
          datePublished: post.published_at,
          author: { "@type": "Organization", name: siteName },
          publisher: { "@type": "Organization", name: siteName },
          mainEntityOfPage: `${siteUrl}${withLocalePrefix(`/journal/${post.slug}`, locale)}`,
          inLanguage: locale,
          keywords: (post.tags ?? []).join(", "),
          wordCount: analysis.wordCount,
        }}
      />
      <article>
        <header className="mb-16 md:mb-section-gap">
          <div className="editorial-shell relative z-10 mb-10 md:mb-14">
            <div className="label-mono mb-5 md:mb-8">{dictionary.journal.eyebrow}</div>
            <h1 className="mb-6 max-w-[12ch] font-serif text-[clamp(40px,11.5vw,58px)] leading-[1.05] text-on-background md:mb-8 md:max-w-4xl md:text-display-xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
              <span>{brand.logoText || brandName}</span>
              <span className="size-1 rounded-full bg-outline-variant" />
              <span>{post.published_at ? new Date(post.published_at).toLocaleDateString(locale === "zh-TW" ? "zh-Hant-TW" : locale === "zh-CN" ? "zh-Hans-CN" : "en-US") : dictionary.common.published}</span>
              <span className="size-1 rounded-full bg-outline-variant" />
              <ArticleMeta readingTime={analysis.readingTime} wordCount={analysis.wordCount} />
            </div>
          </div>
          <div className="relative h-[50vh] min-h-[340px] w-full md:h-[80vh] md:min-h-[420px]">
            {post.cover_image_url ? (
              <EditorialImage
                alt={`${post.title} cover image`}
                aspectRatio="original"
                className="h-full"
                fillFrame
                fit={coverObjectFit}
                frameClassName="h-full w-full"
                imageClassName="h-full w-full"
                sizes="100vw"
                src={post.cover_image_url}
                priority
                style={{ objectFit: coverObjectFit, objectPosition: coverObjectPosition }}
              />
            ) : (
              <QuietImagePlaceholder brandName={brandName} title={post.title} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>
        </header>

        <div className="editorial-shell grid grid-cols-1 gap-gutter pb-24 md:grid-cols-12 md:pb-section-gap">
          <aside className="md:col-span-3 md:block">
            <div className="sticky top-40 flex flex-col gap-8">
              <ArticleToc items={analysis.toc} />
              <div>
                <div className="label-mono mb-4">{dictionary.common.tags}</div>
                <div className="flex flex-wrap gap-2">
                  {(post.tags ?? []).map((tag) => (
                    <span key={tag} className="rounded-full border border-outline-variant/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-px w-full bg-outline-variant/20" />
              <Link className="label-mono transition-colors hover:text-secondary" href={withLocalePrefix("/journal", locale)}>
                {dictionary.common.backToJournal}
              </Link>
            </div>
          </aside>

          <div className="md:col-span-7 md:col-start-5">
            {post.subtitle || post.excerpt ? (
              <p className="mb-10 text-[18px] leading-8 text-on-surface-variant md:mb-12 md:text-xl md:leading-9">{post.subtitle || post.excerpt}</p>
            ) : null}
          <div className="prose prose-invert max-w-none dark:prose-invert prose-p:font-body prose-p:text-[17px] prose-p:leading-[1.78] prose-p:text-on-background prose-figcaption:text-[12px] prose-figcaption:leading-5 prose-blockquote:break-words prose-pre:overflow-x-auto prose-headings:font-serif prose-headings:font-normal prose-headings:text-on-background md:prose-p:text-body-lg" data-pagefind-body>
              {analysis.blocks.map((block, index) => {
                if (block.type === "heading") {
                  const Heading = block.level <= 1 ? "h2" : "h3";
                  return (
                    <Heading key={`${block.type}-${index}`} id={block.id} className="scroll-mt-36 mt-14 text-[34px] leading-tight md:mt-16 md:text-headline-lg">
                      {renderInline(block.text)}
                    </Heading>
                  );
                }
                if (block.type === "quote") {
                  return (
                    <blockquote key={`${block.type}-${index}`} className="my-12 max-w-full border-l pl-5 md:my-16 md:pl-8">
                      <p className="font-serif text-[28px] leading-snug italic md:text-headline-md">{block.text}</p>
                    </blockquote>
                  );
                }
                if (block.type === "code" || block.type === "mdx") {
                  return <CodeBlock key={`${block.type}-${index}`} code={block.code} language={block.type === "code" ? block.language : "mdx"} />;
                }
                if (block.type === "list") {
                  const List = block.ordered ? "ol" : "ul";
                  return (
                    <List key={`${block.type}-${index}`} className={block.ordered ? "list-decimal" : "list-disc"}>
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </List>
                  );
                }
                if (block.type === "image") {
                  return <ImageZoom key={`${block.type}-${index}`} alt={block.alt} layout={block.layout} src={block.src} />;
                }
                return <p key={`${block.type}-${index}`}>{renderInline(block.text)}</p>;
              })}
            </div>
            <Footnotes footnotes={analysis.footnotes} />
            <ReadingCompletion slug={post.slug} />
            <GiscusComments />
            <ArticleNavigation navigation={navigation} />
          </div>
        </div>
      </article>
    </>
  );
}
