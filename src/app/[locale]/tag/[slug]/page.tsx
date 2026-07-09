import type { Metadata } from "next";
import TaxonomyArchiveClient from "@/components/TaxonomyArchiveClient";
import { defaultTags } from "@/data/cms";
import { locales } from "@/i18n/config";
import { buildTagArchiveMetadata, resolveLocalizedTaxonomyParams } from "@/lib/taxonomyArchiveMetadata";

export function generateStaticParams() {
  return locales.flatMap((locale) => defaultTags.map((tag) => ({ locale: locale === "zh-CN" ? "zh" : locale === "zh-TW" ? "tw" : "en", slug: tag.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await resolveLocalizedTaxonomyParams(params);
  return buildTagArchiveMetadata(locale, slug);
}

export default async function LocalizedTagArchivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TaxonomyArchiveClient slug={slug} type="tag" />;
}
