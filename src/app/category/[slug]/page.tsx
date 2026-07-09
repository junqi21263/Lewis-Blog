import type { Metadata } from "next";
import TaxonomyArchiveClient from "@/components/TaxonomyArchiveClient";
import { defaultCategories } from "@/data/cms";
import { buildCategoryArchiveMetadata, resolveLocalizedTaxonomyParams } from "@/lib/taxonomyArchiveMetadata";

export function generateStaticParams() {
  return defaultCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await resolveLocalizedTaxonomyParams(params);
  return buildCategoryArchiveMetadata(locale, slug);
}

export default async function CategoryArchivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TaxonomyArchiveClient slug={slug} type="category" />;
}
