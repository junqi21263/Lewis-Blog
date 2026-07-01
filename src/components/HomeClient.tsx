"use client";

import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import BlogCard from "@/components/BlogCard";
import FilmCard from "@/components/FilmCard";
import GalleryGrid from "@/components/GalleryGrid";
import { postToArticle } from "@/data/cms";
import type { Film, GalleryImage } from "@/data/site";
import { useCmsData } from "@/hooks/useCmsData";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

function SkeletonBand() {
  return <div className="h-72 animate-pulse border border-outline-variant/10 bg-surface-container-low" />;
}

export default function HomeClient() {
  const { locale, dictionary } = useI18n();
  const { data, isReady, error } = useCmsData();
  const articles = data.posts.filter((post) => post.status === "published").map((post) => postToArticle(post, data));
  const featuredArticle = articles.find((article) => data.posts.find((post) => post.slug === article.slug)?.featured) ?? articles[0];
  const secondaryArticles = articles.filter((article) => article.slug !== featuredArticle?.slug).slice(0, 3);
  const images: GalleryImage[] = data.photos
    .filter((photo) => photo.featured)
    .slice(0, 3)
    .map((photo, index) => ({
      id: photo.id,
      title: photo.title,
      location: photo.location,
      orientation: index % 3 === 0 ? "portrait" : index % 3 === 1 ? "landscape" : "square",
      src: photo.imageUrl,
      alt: photo.description || photo.title,
    }));
  const films: Film[] = data.videos
    .filter((video) => video.status === "published")
    .slice(0, 3)
    .map((video) => ({
      id: video.id,
      title: video.title,
      year: video.featured ? "Featured" : "Archive",
      duration: video.duration,
      category: video.tags[0] ?? video.platform,
      description: video.description,
      poster: { src: video.coverImage, alt: `${video.title} cover image.` },
      videoSrc: video.videoUrl,
    }));

  if (!isReady) {
    return (
      <div className="editorial-shell pb-28 md:pb-section-gap">
        <SkeletonBand />
      </div>
    );
  }

  if (error || !featuredArticle) {
    return (
      <div className="editorial-shell pb-28 md:pb-section-gap">
        <section className="border-t border-outline-variant/10 py-16">
          <h1 className="font-serif text-display-lg text-on-background">No published entries.</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
            {dictionary.home.emptyDescription}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="mb-28 md:mb-section-gap">
        <div className="editorial-shell mb-14">
          <div className="label-mono mb-8">{dictionary.home.eyebrow}</div>
          <h1 className="max-w-5xl font-serif text-display-lg text-on-background md:text-display-xl">
            {dictionary.home.title}
          </h1>
        </div>
        <Link className="group block" href={withLocalePrefix(`/journal/${featuredArticle.slug}`, locale)}>
          <div className="relative h-[58vh] min-h-[420px] w-full overflow-hidden md:h-[78vh]">
            <Image
              alt={featuredArticle.image.alt}
              className="h-full w-full object-cover grayscale transition duration-1000 ease-editorial group-hover:scale-[1.025] group-hover:grayscale-0"
              fill
              priority
              sizes="100vw"
              src={featuredArticle.image.src}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0">
              <div className="editorial-shell pb-10 md:pb-16">
                <div className="label-mono mb-4">{featuredArticle.eyebrow}</div>
                <h2 className="max-w-3xl font-serif text-headline-mobile text-on-background md:text-headline-lg">
                  {featuredArticle.title}
                </h2>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section className="editorial-shell mb-28 md:mb-section-gap">
        <div className="mb-12 flex flex-col justify-between gap-6 border-t border-outline-variant/10 pt-8 md:flex-row md:items-end">
            <div>
              <div className="label-mono mb-4">{dictionary.home.latestEyebrow}</div>
              <h2 className="font-serif text-headline-lg text-on-background">{dictionary.home.latestTitle}</h2>
            </div>
          <Link className="label-mono transition-colors hover:text-secondary" href={withLocalePrefix("/journal", locale)}>
            {dictionary.home.latestLink}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {secondaryArticles.map((article) => (
            <BlogCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      {images.length > 0 ? (
        <section className="editorial-shell mb-28 md:mb-section-gap">
          <div className="mb-12 grid gap-6 border-t border-outline-variant/10 pt-8 md:grid-cols-[0.7fr_1fr]">
            <div>
              <div className="label-mono mb-4">{dictionary.home.galleryEyebrow}</div>
              <h2 className="font-serif text-headline-lg text-on-background">{dictionary.home.galleryTitle}</h2>
            </div>
            <p className="text-body-lg text-on-surface-variant">
              {dictionary.home.galleryDescription}
            </p>
          </div>
          <GalleryGrid images={images} />
        </section>
      ) : null}

      {films.length > 0 ? (
        <section className="editorial-shell mb-28 md:mb-section-gap">
          <div className="mb-12 flex flex-col justify-between gap-6 border-t border-outline-variant/10 pt-8 md:flex-row md:items-end">
            <div>
              <div className="label-mono mb-4">{dictionary.home.filmsEyebrow}</div>
              <h2 className="font-serif text-headline-lg text-on-background">{dictionary.home.filmsTitle}</h2>
            </div>
            <Link className="label-mono transition-colors hover:text-secondary" href={withLocalePrefix("/films", locale)}>
              {dictionary.home.filmsLink}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            {films.map((film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="editorial-shell mb-28 md:mb-section-gap">
        <div className="grid gap-gutter border-t border-outline-variant/10 pt-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="label-mono mb-4">{dictionary.home.archiveEyebrow}</div>
            <h2 className="font-serif text-headline-lg text-on-background">{dictionary.home.archiveTitle}</h2>
          </div>
          <div className="md:col-span-8">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} compact />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
