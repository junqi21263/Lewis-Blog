import type { Metadata } from "next";
import { defaultCategories, defaultTags } from "@/data/cms";
import { localeFromSegment, type Locale } from "@/i18n/config";
import { buildLocaleMetadata } from "@/i18n/metadata";

function titleCaseFallback(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildCategoryArchiveMetadata(locale: Locale, slug: string): Metadata {
  const category = defaultCategories.find((item) => item.slug === slug);
  const name = category?.name ?? titleCaseFallback(slug);
  const description = category?.description || `Lewis Photograph Blog archive for ${name}.`;
  return buildLocaleMetadata(locale, `/category/${slug}`, name, description);
}

export function buildTagArchiveMetadata(locale: Locale, slug: string): Metadata {
  const tag = defaultTags.find((item) => item.slug === slug);
  const name = tag?.name ?? titleCaseFallback(slug);
  return buildLocaleMetadata(locale, `/tag/${slug}`, name, `Lewis Photograph Blog articles tagged ${name}.`);
}

export async function resolveLocalizedTaxonomyParams(params: Promise<{ locale?: string; slug: string }>) {
  const resolved = await params;
  return {
    locale: localeFromSegment(resolved.locale ?? "zh"),
    slug: resolved.slug,
  };
}
