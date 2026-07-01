import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath, localeToSegment, locales, type Locale } from "@/i18n/config";
import { siteName, siteUrl } from "@/data/site";

export function buildLanguageAlternates(pathname: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    const href = localePath(locale, pathname);
    languages[locale === "en-US" ? "en" : locale] = `${siteUrl}${href}`;
  }
  languages["x-default"] = `${siteUrl}${localePath("zh-CN", pathname)}`;
  return languages;
}

export function buildLocaleMetadata(locale: Locale, pathname: string, title: string, description: string): Metadata {
  const canonicalPath = localePath(locale, pathname);
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const homeOgUrl = `${siteUrl}/og/home`;
  return {
    title: title === siteName ? { absolute: title } : title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: buildLanguageAlternates(pathname),
      types: {
        "application/rss+xml": `${siteUrl}${localePath(locale, "/rss.xml")}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: locale === "zh-CN" ? "zh_CN" : locale === "zh-TW" ? "zh_TW" : "en_US",
      images: [{ url: homeOgUrl, alt: "Lewis Photograph Blog open graph cover." }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [homeOgUrl],
    },
  };
}

export function buildSiteStructuredData(locale: Locale) {
  const dictionary = getDictionary(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: `${siteUrl}/${localeToSegment(locale)}/`,
    description: dictionary.seo.siteDescription,
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/${localeToSegment(locale)}/journal?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
