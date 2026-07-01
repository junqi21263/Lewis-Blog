import type { MetadataRoute } from "next";
import { articles, siteUrl } from "@/data/site";
import { localePath, locales, type Locale } from "@/i18n/config";
import { buildLanguageAlternates } from "@/i18n/metadata";

export const dynamic = "force-static";

function routeEntry(route: string, locale: Locale, priority: number) {
  return {
    url: `${siteUrl}${localePath(locale, route)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority,
    alternates: {
      languages: Object.fromEntries(
        Object.entries(buildLanguageAlternates(route)).map(([key, value]) => [key, `${siteUrl}${value}`]),
      ),
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = locales.flatMap((locale) =>
    ["", "/journal", "/gallery", "/gear", "/films", "/about"].map((route) => routeEntry(route || "/", locale, route === "" ? 1 : 0.8)),
  );

  const articleRoutes = locales.flatMap((locale) =>
    articles.map((article) => ({
      url: `${siteUrl}${localePath(locale, `/journal/${article.slug}`)}`,
      lastModified: new Date(article.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(buildLanguageAlternates(`/journal/${article.slug}`)).map(([key, value]) => [key, `${siteUrl}${value}`]),
        ),
      },
    })),
  );

  return [...staticRoutes, ...articleRoutes];
}
