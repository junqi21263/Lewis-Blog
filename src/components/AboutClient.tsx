"use client";

import AboutPageContent from "@/components/about/AboutPageContent";
import { aboutImageDefaults } from "@/components/about/imagePresentation";
import DynamicMetadata from "@/components/DynamicMetadata";
import { resolvePageCopy } from "@/components/pages/pageCopy";
import StructuredData from "@/components/StructuredData";
import type { AboutContentFields, AboutSeoFields } from "@/data/cms";
import { siteUrl } from "@/data/site";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";
import { useCmsData } from "@/hooks/useCmsData";

const emptyContent: AboutContentFields = {
  eyebrow: "",
  headline: "",
  description: "",
  body: "",
  heroImage: "",
  imageAlt: "",
  ...aboutImageDefaults,
};

const emptySeo: AboutSeoFields = {
  title: "",
  description: "",
};

export default function AboutClient() {
  const { data, isReady, error } = useCmsData();
  const { locale, dictionary } = useI18n();
  const pageCopy = resolvePageCopy(data.siteSettings.pageCopyJson, "about", locale);
  const page = data.sitePages.about;
  const content = {
    ...emptyContent,
    ...(page?.contentJson["zh-CN"] ?? {}),
    ...(page?.contentJson["en-US"] ?? {}),
    ...(page?.contentJson[locale] ?? {}),
  };
  const seo = {
    ...emptySeo,
    ...(page?.seoJson["zh-CN"] ?? {}),
    ...(page?.seoJson["en-US"] ?? {}),
    ...(page?.seoJson[locale] ?? {}),
  };
  const fallbackContent: AboutContentFields = {
    eyebrow: pageCopy.eyebrow,
    headline: pageCopy.title,
    description: pageCopy.description,
    body: [dictionary.about.paragraphOne, dictionary.about.paragraphTwo].filter(Boolean).join("\n\n"),
    heroImage: "",
    imageAlt: pageCopy.title,
    ...aboutImageDefaults,
  };
  const activeContent = isReady ? content : fallbackContent;
  const canonicalPath = withLocalePrefix("/about", locale);
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const title = seo?.title?.trim() || pageCopy.title;
  const description = seo?.description?.trim() || activeContent?.description?.trim() || pageCopy.description;
  const heroImage = activeContent?.heroImage?.trim() || "";
  const heroImageUrl = heroImage ? new URL(heroImage, siteUrl).toString() : `${siteUrl}/og/home`;
  const hasCmsContent = Boolean(content?.headline?.trim() || content?.description?.trim() || content?.body?.trim() || content?.heroImage?.trim());

  return (
    <>
      <DynamicMetadata canonicalUrl={canonicalUrl} description={description} ogImage={heroImageUrl} title={title} />
      {hasCmsContent ? (
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@type": "AboutPage",
            url: canonicalUrl,
            name: title,
            description,
            inLanguage: locale,
            image: heroImageUrl,
          }}
        />
      ) : null}

      {isReady && !hasCmsContent ? (
        <section className="editorial-shell border-t border-outline-variant/10 py-16">
          <div className="label-mono mb-5">{dictionary.nav.about}</div>
          <h1 className="font-serif text-display-lg text-on-background">{pageCopy.emptyTitle}</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
            {error || pageCopy.emptyDescription}
          </p>
        </section>
      ) : (
        <AboutPageContent
          content={activeContent}
          fallback={{
            eyebrow: pageCopy.eyebrow,
            headline: pageCopy.title,
            description: pageCopy.description,
            imageAlt: pageCopy.title,
            imagePlaceholderTitle: title,
          }}
          title={title}
        />
      )}
    </>
  );
}
