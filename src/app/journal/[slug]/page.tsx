import type { Metadata } from "next";
import ArticleDetailClient from "@/components/ArticleDetailClient";
import { articles, getArticleBySlug, siteName, siteUrl } from "@/data/site";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return {
    title: `${article.title} | ${siteName}`,
    description: article.excerpt,
    alternates: {
      canonical: `/journal/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: `${siteUrl}/journal/${article.slug}`,
      siteName,
      publishedTime: article.date,
      authors: [article.author],
      tags: article.tags,
      images: [{ url: `${siteUrl}/og/${article.slug}`, alt: article.image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [`${siteUrl}/og/${article.slug}`],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  return <ArticleDetailClient slug={slug} />;
}
