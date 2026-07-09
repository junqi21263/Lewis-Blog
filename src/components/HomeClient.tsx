"use client";

import Image from "next/image";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import FeaturedImagesGrid from "@/components/FeaturedImagesGrid";
import FilmCard from "@/components/FilmCard";
import EditorialPageSkeleton from "@/components/loading/EditorialPageSkeleton";
import EditorialImage from "@/components/media/EditorialImage";
import { getVisibleFragments, getVisibleJournalPosts, localizedFragment, postToArticle } from "@/data/cms";
import { resolveHomepageContent } from "@/components/home/homepageContent";
import type { Film } from "@/data/site";
import { useCmsData } from "@/hooks/useCmsData";
import { localeToSegment, withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

export default function HomeClient() {
  const { locale, dictionary } = useI18n();
  const { data, isReady, error } = useCmsData();
  const homepage = resolveHomepageContent(data.siteSettings.homepageJson, locale);
  const publishedPosts = getVisibleJournalPosts(data);
  const publishedArticles = publishedPosts.map((post) => postToArticle(post, data, locale));
  const featuredArticle = publishedArticles.find((article) => data.posts.find((post) => post.slug === article.slug)?.featured) ?? publishedArticles[0];
  const latestArticles = publishedArticles.slice(0, 3);
  const latestFragments = getVisibleFragments(data)
    .slice(0, 3)
    .map((fragment) => localizedFragment(fragment, locale));
  const images = data.featuredImages.slice(0, 9);
  const films: Film[] = data.videos
    .filter((video) => video.status === "published")
    .slice(0, 3)
    .map((video) => ({
      id: video.id,
      title: video.title,
      year: video.featured
        ? locale === "zh-CN"
          ? "精选"
          : locale === "zh-TW"
            ? "精選"
            : "Featured"
        : locale === "zh-CN"
          ? "归档"
          : locale === "zh-TW"
            ? "歸檔"
            : "Archive",
      duration: video.duration,
      category: video.tags[0] ?? video.platform,
      description: video.description,
      poster: { src: video.coverImage, alt: `${video.title} cover image.` },
      videoSrc: video.videoUrl,
    }));

  if (!isReady) {
    return <EditorialPageSkeleton home />;
  }

  if (error || !featuredArticle) {
    return (
      <div className="editorial-shell pb-28 md:pb-section-gap" data-pagefind-body>
        <section className="border-t border-outline-variant/10 py-16">
          <h1 className="font-serif text-display-lg text-on-background">{dictionary.common.noPublishedEntries}</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
            {dictionary.home.emptyDescription}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div data-pagefind-body>
      <section className="mb-20 md:mb-section-gap">
        <div className="editorial-shell mb-10 md:mb-14">
          <div className="label-mono mb-5 md:mb-8">{homepage.heroEyebrow}</div>
          <h1 className="max-w-[11ch] font-serif text-[clamp(42px,13vw,64px)] leading-[1.02] text-on-background md:max-w-5xl md:text-display-xl">
            {homepage.heroHeadline}
          </h1>
        </div>
        <Link className="group block" href={withLocalePrefix(`/journal/${featuredArticle.slug}`, locale)} prefetch={false}>
          <div className="relative h-[54vh] min-h-[360px] w-full overflow-hidden md:h-[78vh] md:min-h-[420px]">
            {featuredArticle.image.src ? (
              <Image
                alt={featuredArticle.image.alt}
                className="h-full w-full object-cover transition duration-1000 ease-editorial md:grayscale md:group-hover:scale-[1.025] md:group-hover:grayscale-0"
                fill
                priority
                sizes="100vw"
                src={featuredArticle.image.src}
              />
            ) : (
              <div className="grid h-full place-items-center bg-surface-container-low px-8 text-center">
                <span className="max-w-3xl font-serif text-headline-lg text-on-background">{featuredArticle.title}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0">
              <div className="editorial-shell pb-10 md:pb-16">
                <div className="label-mono mb-4">{featuredArticle.eyebrow}</div>
                <h2 className="max-w-[13ch] font-serif text-[34px] leading-[1.08] text-on-background md:max-w-3xl md:text-headline-lg">
                  {featuredArticle.title}
                </h2>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section className="editorial-shell mb-20 md:mb-section-gap">
        <div className="mb-12 flex flex-col justify-between gap-6 border-t border-outline-variant/10 pt-8 md:flex-row md:items-end">
            <div>
              <div className="label-mono mb-4">{homepage.latestEyebrow}</div>
              <h2 className="font-serif text-[38px] leading-tight text-on-background md:text-headline-lg">{homepage.latestHeadline}</h2>
            </div>
          <Link className="label-mono transition-colors hover:text-secondary" href={withLocalePrefix("/journal", locale)}>
            {homepage.latestCta}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((article) => (
            <BlogCard key={article.slug} article={article} href={`/${localeToSegment(locale)}/journal/${article.slug}`} />
          ))}
        </div>
      </section>

      <section className="editorial-shell mb-20 md:mb-section-gap">
        <div className="mb-12 grid gap-6 border-t border-outline-variant/10 pt-8 md:grid-cols-[0.7fr_1fr]">
          <div>
            <div className="label-mono mb-4">{homepage.galleryEyebrow}</div>
            <h2 className="font-serif text-[38px] leading-tight text-on-background md:text-headline-lg">{homepage.galleryHeadline}</h2>
          </div>
          <p className="text-body-lg text-on-surface-variant">
            {dictionary.home.galleryDescription}
          </p>
        </div>
        <FeaturedImagesGrid
          emptyDescription={dictionary.gallery.emptyDescription}
          emptyTitle={dictionary.gallery.emptyTitle}
          images={images}
        />
      </section>

      {latestFragments.length > 0 ? (
        <section className="editorial-shell mb-20 md:mb-section-gap">
          <div className="mb-12 flex flex-col justify-between gap-6 border-t border-outline-variant/10 pt-8 md:flex-row md:items-end">
            <div>
              <div className="label-mono mb-4">{dictionary.home.fragmentsEyebrow}</div>
              <h2 className="font-serif text-[38px] leading-tight text-on-background md:text-headline-lg">{dictionary.home.fragmentsTitle}</h2>
            </div>
            <Link className="label-mono transition-colors hover:text-secondary" href={withLocalePrefix("/fragments", locale)}>
              {dictionary.nav.fragments}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {latestFragments.map((fragment) => {
              const cover = fragment.images[0];
              const date = new Intl.DateTimeFormat(locale === "zh-CN" ? "zh-Hans-CN" : locale === "zh-TW" ? "zh-Hant-TW" : "en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).format(new Date(fragment.publishedAt || fragment.createdAt));

              return (
                <Link key={fragment.id} className="group border-t border-outline-variant/10 pt-5" href={withLocalePrefix("/fragments", locale)}>
                  {cover ? (
                    <EditorialImage
                      alt={cover.alt || fragment.content || "Fragment image"}
                      aspectRatio="cinema"
                      className="mb-5"
                      frameClassName="border border-outline-variant/10"
                      grayscale
                      revealColorOnHover
                      sizes="(min-width: 768px) 33vw, 100vw"
                      src={cover.url}
                    />
                  ) : null}
                  <div className="label-mono mb-3">{date}</div>
                  <h3 className="line-clamp-3 font-serif text-headline-sm text-on-background transition group-hover:text-secondary">
                    {fragment.content || fragment.location || dictionary.home.fragmentsTitle}
                  </h3>
                  {fragment.location ? <p className="mt-3 text-body-sm text-on-surface-variant">{fragment.location}</p> : null}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {films.length > 0 ? (
        <section className="editorial-shell mb-20 md:mb-section-gap">
          <div className="mb-12 flex flex-col justify-between gap-6 border-t border-outline-variant/10 pt-8 md:flex-row md:items-end">
            <div>
              <div className="label-mono mb-4">{dictionary.home.filmsEyebrow}</div>
              <h2 className="font-serif text-[38px] leading-tight text-on-background md:text-headline-lg">{dictionary.home.filmsTitle}</h2>
            </div>
            <Link className="label-mono transition-colors hover:text-secondary" href={withLocalePrefix("/films", locale)}>
              {dictionary.home.filmsLink}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {films.map((film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        </section>
      ) : null}

    </div>
  );
}
