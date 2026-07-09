import type { MetadataRoute } from "next";
import { defaultCategories, defaultTags } from "@/data/cms";
import { siteUrl } from "@/data/site";
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
      languages: buildLanguageAlternates(route),
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseRoutes = locales.flatMap((locale) =>
    ["", "/journal", "/fragments", "/gallery", "/gear", "/films", "/about"].map((route) =>
      routeEntry(route || "/", locale, route === "" ? 1 : 0.8),
    ),
  );
  const categoryRoutes = locales.flatMap((locale) =>
    defaultCategories.map((category) => routeEntry(`/category/${category.slug}`, locale, 0.6)),
  );
  const tagRoutes = locales.flatMap((locale) =>
    defaultTags.map((tag) => routeEntry(`/tag/${tag.slug}`, locale, 0.5)),
  );
  return [...baseRoutes, ...categoryRoutes, ...tagRoutes];
}
