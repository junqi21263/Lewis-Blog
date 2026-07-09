import type { Metadata } from "next";
import TaxonomyArchiveClient from "@/components/TaxonomyArchiveClient";
import { defaultCategories } from "@/data/cms";
import { locales } from "@/i18n/config";
import { buildCategoryArchiveMetadata, resolveLocalizedTaxonomyParams } from "@/lib/taxonomyArchiveMetadata";

export function generateStaticParams() {
  return locales.flatMap((locale) => defaultCategories.map((category) => ({ locale: locale === "zh-CN" ? "zh" : locale === "zh-TW" ? "tw" : "en", slug: category.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await resolveLocalizedTaxonomyParams(params);
  return buildCategoryArchiveMetadata(locale, slug);
}

export default async function LocalizedCategoryArchivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TaxonomyArchiveClient slug={slug} type="category" />;
}
