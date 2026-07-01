import type { Metadata } from "next";
import GalleryClient from "@/components/GalleryClient";
import { localeFromSegment } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildLocaleMetadata } from "@/i18n/metadata";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  const dictionary = getDictionary(locale);
  return buildLocaleMetadata(locale, "/gallery", dictionary.seo.galleryTitle, dictionary.seo.galleryDescription);
}

export default function LocalizedGalleryPage() {
  return <GalleryClient />;
}
