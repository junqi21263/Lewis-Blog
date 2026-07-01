"use client";

import Image from "next/image";
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
import { siteName, siteUrl } from "@/data/site";
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

  return (
    <>
      <ReadingProgress />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt || post.subtitle,
          image: post.cover_image_url ? new URL(post.cover_image_url, siteUrl).toString() : `${siteUrl}/images/open-road.jpg`,
          datePublished: post.published_at,
          author: { "@type": "Organization", name: "Noah. Studio" },
          publisher: { "@type": "Organization", name: siteName },
          mainEntityOfPage: `${siteUrl}${withLocalePrefix(`/journal/${post.slug}`, locale)}`,
          inLanguage: locale,
          keywords: (post.tags ?? []).join(", "),
          wordCount: analysis.wordCount,
        }}
      />
      <article>
        <header className="mb-24 md:mb-section-gap">
          <div className="editorial-shell relative z-10 mb-14">
            <div className="label-mono mb-8">{dictionary.journal.eyebrow}</div>
            <h1 className="mb-8 max-w-4xl font-serif text-display-lg text-on-background md:text-display-xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
              <span>Noah. Studio</span>
              <span className="size-1 rounded-full bg-outline-variant" />
              <span>{post.published_at ? new Date(post.published_at).toLocaleDateString(locale === "zh-TW" ? "zh-Hant-TW" : locale === "zh-CN" ? "zh-Hans-CN" : "en-US") : dictionary.common.published}</span>
              <span className="size-1 rounded-full bg-outline-variant" />
              <ArticleMeta readingTime={analysis.readingTime} wordCount={analysis.wordCount} />
            </div>
          </div>
          <div className="relative h-[60vh] min-h-[420px] w-full md:h-[80vh]">
            <Image
              alt={`${post.title} cover image`}
              className="h-full w-full object-cover grayscale"
              fill
              priority
              sizes="100vw"
              src={post.cover_image_url || "/images/open-road.jpg"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>
        </header>

        <div className="editorial-shell grid grid-cols-1 gap-gutter pb-28 md:grid-cols-12 md:pb-section-gap">
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
              <p className="mb-12 text-xl leading-9 text-on-surface-variant">{post.subtitle || post.excerpt}</p>
            ) : null}
            <div className="prose prose-invert max-w-none dark:prose-invert prose-p:font-body prose-p:text-body-lg prose-p:text-on-background prose-headings:font-serif prose-headings:font-normal prose-headings:text-on-background">
              {analysis.blocks.map((block, index) => {
                if (block.type === "heading") {
                  const Heading = block.level <= 1 ? "h2" : "h3";
                  return (
                    <Heading key={`${block.type}-${index}`} id={block.id} className="scroll-mt-36 mt-16 text-headline-lg">
                      {renderInline(block.text)}
                    </Heading>
                  );
                }
                if (block.type === "quote") {
                  return (
                    <blockquote key={`${block.type}-${index}`} className="my-16 border-l pl-8">
                      <p className="font-serif text-headline-md italic">{block.text}</p>
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
                  return <ImageZoom key={`${block.type}-${index}`} alt={block.alt} src={block.src} />;
                }
                return <p key={`${block.type}-${index}`}>{renderInline(block.text)}</p>;
              })}
            </div>
            <Footnotes footnotes={analysis.footnotes} />
            <ReadingCompletion slug={post.slug} />
            <ArticleNavigation navigation={navigation} />
            <GiscusComments />
          </div>
        </div>
      </article>
    </>
  );
}
