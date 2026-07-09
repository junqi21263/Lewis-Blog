import type { Metadata } from "next";
import TaxonomyArchiveClient from "@/components/TaxonomyArchiveClient";
import { defaultTags } from "@/data/cms";
import { buildTagArchiveMetadata, resolveLocalizedTaxonomyParams } from "@/lib/taxonomyArchiveMetadata";

export function generateStaticParams() {
  return defaultTags.map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await resolveLocalizedTaxonomyParams(params);
  return buildTagArchiveMetadata(locale, slug);
}

export default async function TagArchivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TaxonomyArchiveClient slug={slug} type="tag" />;
}
